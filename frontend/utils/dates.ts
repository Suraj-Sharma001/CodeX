/**
 * Convert a string or Date to YYYY-MM-DD format
 */
export function toDateString(date: string | Date | undefined): string {
  if (!date) return '';
  
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  if (typeof date === 'string') {
    // If it's already in ISO format, extract just the date part
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    // If it's just a date string already, return as is
    return date;
  }
  
  return '';
}

/**
 * Convert a string or Date to a locale date string
 */
export function toLocaleDateString(date: string | Date | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  } catch {
    return '';
  }
}

/**
 * Convert a string or Date to ISO string
 */
export function toISOString(date: string | Date | undefined): string {
  if (!date) return '';
  
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  if (typeof date === 'string') {
    // If it's already an ISO string, return it
    if (date.includes('T')) {
      return date;
    }
    // Convert YYYY-MM-DD to ISO format
    return new Date(date).toISOString();
  }
  
  return '';
}
