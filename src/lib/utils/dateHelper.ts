// import { Intl } from 'intl'; // Only needed if in an environment without native Intl support



// concept: dueDate is date for both chore and record, stored as date @ 0:00am 
//  record is 'normalized' and date is a string - below utils covert that string to date for comparison ect



/**
 * Returns 'YYYY-MM-DD' for the current time in the specified timezone.
 */
export function getLocalTodayString(
  date: Date | string = new Date(), 
  timeZone: string = 'America/Los_Angeles'
): string {
 let d: Date;

  if (date instanceof Date) {
    d = date;
  } else {
    // If it's a simple date string (YYYY-MM-DD), force local parsing
    const normalized = (typeof date === 'string' && date.length <= 10) 
      ? date.replace(/-/g, '/') 
      : date;
    d = new Date(normalized);
  }

  if (isNaN(d.getTime())) d = new Date();

  return d.toLocaleDateString('en-CA', { 
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit' 
  });
}


/**
 * Safely converts our DB string 'YYYY-MM-DD' into a Date object 
 * for UI components that require a Date type.
 */
export function stringToDate(dateStr: string): Date {
  // Appending 'T00:00:00' ensures the Date object is created at 
  // midnight local time rather than UTC, preventing "Day Flipping".
  return new Date(`${dateStr}T00:00:00`);
}

export function getLocalTodayDate(): Date {
// Directly chain the helpers to return a Date object 
  // pinned to the start of the local day.
  return stringToDate(getLocalTodayString());
}

/**
 * Compares two dates/strings by their 'YYYY-MM-DD' values in a specific timezone.
 * This prevents 8:00 PM PST (UTC tomorrow) from being treated as a different day.
 */
export function isSameDay(a: Date | string, b: Date | string, timeZone: string = 'America/Los_Angeles') {
  
  
 const getComparisonString = (input: Date | string) => {
    // 1. If it's a "YYYY-MM-DD" string, it's already a calendar day. 
    // Just return it. Don't let new Date() touch it!
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return input;
    }

    // 2. Otherwise, treat it as a real timestamp and convert to the target timezone.
    return new Date(input).toLocaleDateString('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const dateA = getComparisonString(a);
  const dateB = getComparisonString(b);

  console.log(`Checking: [${dateA}] vs [${dateB}]`); // This will tell you the truth!

  return dateA === dateB;
}