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
  const d = date instanceof Date ? date : new Date(date);
  
  // Check for invalid dates to prevent 'Invalid Date' string return
  if (isNaN(d.getTime())) {
    return new Date().toLocaleDateString('en-CA', { timeZone });
  }

  return d.toLocaleDateString('en-CA', { timeZone });
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
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    // Format both to YYYY-MM-DD using the CA locale trick
    const dateA = new Date(a).toLocaleDateString('en-CA', options);
    const dateB = new Date(b).toLocaleDateString('en-CA', options);

    // If either date is invalid, toLocaleDateString might return 'Invalid Date'
    if (dateA === 'Invalid Date' || dateB === 'Invalid Date') return false;

    return dateA === dateB;
  } catch (error) {
    console.error("Error comparing dates:", error);
    return false;
  }
}