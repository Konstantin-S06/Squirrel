/**
 * Canvas Time Conversion Utilities
 * 
 * Canvas API timestamps are in UTC (ISO 8601 format)
 * This module converts them to America/Toronto timezone for UofT students
 */

/**
 * Converts a Canvas UTC timestamp to America/Toronto time
 * 
 * Note: JavaScript Date objects always store time in UTC internally.
 * This function parses the UTC timestamp and returns a Date object that,
 * when formatted with Toronto timezone, will show the correct local time.
 * 
 * @param utcTimestamp - UTC timestamp string from Canvas (ISO 8601) or null
 * @returns Date object (UTC internally, but represents Toronto time), or null if input is null
 */
export function canvasTimestampToToronto(utcTimestamp: string | null): Date | null {
  if (!utcTimestamp) {
    return null;
  }

  try {
    // Parse UTC timestamp - Date constructor parses ISO 8601 strings correctly
    const date = new Date(utcTimestamp);

    if (isNaN(date.getTime())) {
      console.warn(`Invalid timestamp: ${utcTimestamp}`);
      return null;
    }

    // Date object stores time in UTC internally
    // When displayed/formatted with Toronto timezone, it will show correct local time
    // This is the correct way to handle timezone conversion in JavaScript
    return date;
  } catch (error) {
    console.error(`Error converting timestamp ${utcTimestamp}:`, error);
    return null;
  }
}

/**
 * Formats a date for display in Toronto timezone
 * @param date - Date object (can be null)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string or "Not submitted" if null
 */
export function formatTorontoDate(
  date: Date | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Toronto',
    timeZoneName: 'short',
  }
): string {
  if (!date) {
    return 'Not submitted';
  }

  try {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Checks if a submission timestamp is late (after due date)
 * @param submittedAt - Submission timestamp (can be null)
 * @param dueAt - Due date timestamp (can be null)
 * @returns true if submitted after due date, false otherwise, null if either is null
 */
export function isLate(submittedAt: string | null, dueAt: string | null): boolean | null {
  if (!submittedAt || !dueAt) {
    return null;
  }

  try {
    const submitted = new Date(submittedAt);
    const due = new Date(dueAt);

    if (isNaN(submitted.getTime()) || isNaN(due.getTime())) {
      return null;
    }

    return submitted > due;
  } catch (error) {
    console.error('Error checking if late:', error);
    return null;
  }
}

/**
 * Gets relative time description (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to compare
 * @param referenceDate - Reference date (defaults to now)
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | null, referenceDate: Date = new Date()): string {
  if (!date) {
    return 'Not submitted';
  }

  const diffMs = date.getTime() - referenceDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) {
    return diffSeconds < 0 ? `${Math.abs(diffSeconds)} seconds ago` : `in ${diffSeconds} seconds`;
  } else if (Math.abs(diffMinutes) < 60) {
    return diffMinutes < 0 ? `${Math.abs(diffMinutes)} minutes ago` : `in ${diffMinutes} minutes`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours < 0 ? `${Math.abs(diffHours)} hours ago` : `in ${diffHours} hours`;
  } else if (Math.abs(diffDays) < 30) {
    return diffDays < 0 ? `${Math.abs(diffDays)} days ago` : `in ${diffDays} days`;
  } else {
    return formatTorontoDate(date);
  }
}
