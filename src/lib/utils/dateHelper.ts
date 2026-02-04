export function isSameDay(a: Date | string, b: Date | string) {
   const dateA = a instanceof Date ? a : new Date(a);
   const dateB = b instanceof Date ? b : new Date(b);
   return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
   );
}
