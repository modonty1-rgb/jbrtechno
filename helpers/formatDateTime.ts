/**
 * Format date and time with Arabic time format (مساء/صباح) instead of AM/PM
 */
export function formatDateTimeWithArabicTime(
  date: Date | string,
  locale: string,
  options: {
    year?: 'numeric' | '2-digit';
    month?: 'long' | 'short' | 'numeric';
    day?: 'numeric' | '2-digit';
    hour?: '2-digit' | 'numeric';
    minute?: '2-digit' | 'numeric';
  } = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'ar') {
    // Format date part - use ar-EG which defaults to Gregorian calendar (not Hijri)
    const dateFormatter = new Intl.DateTimeFormat('ar-EG', {
      year: options.year || 'numeric',
      month: options.month || 'long',
      day: options.day || 'numeric',
    });
    
    // Format time part with Arabic time format
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const hour12 = hours % 12 || 12;
    const minuteStr = minutes.toString().padStart(2, '0');
    const timePeriod = hours < 12 ? 'صباح' : 'مساء';
    
    const dateStr = dateFormatter.format(dateObj);
    const timeStr = `${hour12}:${minuteStr} ${timePeriod}`;
    
    return `${dateStr} في ${timeStr}`;
  } else {
    // Use standard English format with AM/PM
    return new Intl.DateTimeFormat('en-US', {
      year: options.year || 'numeric',
      month: options.month || 'long',
      day: options.day || 'numeric',
      hour: options.hour || '2-digit',
      minute: options.minute || '2-digit',
    }).format(dateObj);
  }
}

/**
 * Format time only with Arabic time format (مساء/صباح)
 */
export function formatTimeWithArabicTime(
  date: Date | string,
  locale: string
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'ar') {
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const hour12 = hours % 12 || 12;
    const minuteStr = minutes.toString().padStart(2, '0');
    const timePeriod = hours < 12 ? 'صباح' : 'مساء';
    
    return `${hour12}:${minuteStr} ${timePeriod}`;
  } else {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }
}

