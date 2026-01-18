// ICS (iCalendar) Parser for Canvas Calendar Events

export interface TimetableEvent {
    id: string;
    title: string;
    courseCode: string;
    location: string;
    startTime: Date;
    endTime: Date;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    recurrence?: string;
    description?: string;
}

export interface AttendanceRecord {
    eventId: string;
    date: string; // ISO date string
    attended: boolean;
    checkedAt?: Date;
}

/**
 * Parse .ics file content and extract calendar events
 * @param icsContent - Raw .ics file content
 * @returns Array of timetable events
 */
export const parseICS = (icsContent: string): TimetableEvent[] => {
    const events: TimetableEvent[] = [];
    const lines = icsContent.split(/\r\n|\n|\r/);

    let currentEvent: Partial<TimetableEvent> | null = null;
    let inEvent = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === 'BEGIN:VEVENT') {
            inEvent = true;
            currentEvent = {
                id: '',
                title: '',
                courseCode: '',
                location: '',
                startTime: new Date(),
                endTime: new Date(),
                dayOfWeek: 0
            };
        } else if (line === 'END:VEVENT' && currentEvent) {
            inEvent = false;
            if (currentEvent.id && currentEvent.title) {
                events.push(currentEvent as TimetableEvent);
            }
            currentEvent = null;
        } else if (inEvent && currentEvent) {
            // Parse event properties
            if (line.startsWith('UID:')) {
                currentEvent.id = line.substring(4);
            } else if (line.startsWith('SUMMARY:')) {
                const summary = line.substring(8);
                currentEvent.title = summary;
                // Extract course code (e.g., "CSC110" from "CSC110 - Lecture")
                const courseMatch = summary.match(/^([A-Z]{3}\d{3})/);
                if (courseMatch) {
                    currentEvent.courseCode = courseMatch[1];
                }
            } else if (line.startsWith('LOCATION:')) {
                currentEvent.location = line.substring(9);
            } else if (line.startsWith('DTSTART')) {
                const dateStr = line.split(':')[1];
                currentEvent.startTime = parseICSDate(dateStr);
                currentEvent.dayOfWeek = currentEvent.startTime.getDay();
            } else if (line.startsWith('DTEND')) {
                const dateStr = line.split(':')[1];
                currentEvent.endTime = parseICSDate(dateStr);
            } else if (line.startsWith('DESCRIPTION:')) {
                currentEvent.description = line.substring(12);
            } else if (line.startsWith('RRULE:')) {
                currentEvent.recurrence = line.substring(6);
            }
        }
    }

    return events;
};

/**
 * Parse ICS date format to JavaScript Date
 * @param dateStr - Date string in ICS format (e.g., "20260118T143000Z")
 * @returns JavaScript Date object
 */
const parseICSDate = (dateStr: string): Date => {
    // Remove timezone indicator if present
    const cleanStr = dateStr.replace(/Z$/, '');

    const year = parseInt(cleanStr.substring(0, 4));
    const month = parseInt(cleanStr.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(cleanStr.substring(6, 8));
    const hour = parseInt(cleanStr.substring(9, 11));
    const minute = parseInt(cleanStr.substring(11, 13));
    const second = parseInt(cleanStr.substring(13, 15)) || 0;

    return new Date(year, month, day, hour, minute, second);
};

/**
 * Get events for a specific day of the week
 * @param events - Array of all timetable events
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, etc.)
 * @returns Filtered and sorted events for that day
 */
export const getEventsForDay = (events: TimetableEvent[], dayOfWeek: number): TimetableEvent[] => {
    return events
        .filter(event => event.dayOfWeek === dayOfWeek)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};

/**
 * Check if current time is within a lecture's time slot
 * @param event - The timetable event to check
 * @returns true if current time is during the lecture
 */
export const isEventHappeningNow = (event: TimetableEvent): boolean => {
    const now = new Date();
    const currentDay = now.getDay();

    // Check if it's the right day of the week
    if (event.dayOfWeek !== currentDay) {
        return false;
    }

    // Get current time in minutes since midnight
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Get event start and end times in minutes since midnight
    const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
    const endMinutes = event.endTime.getHours() * 60 + event.endTime.getMinutes();

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Format time for display (e.g., "2:30 PM")
 * @param date - Date object
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Get day name from day of week number
 * @param dayOfWeek - Day number (0 = Sunday, 1 = Monday, etc.)
 * @returns Day name
 */
export const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
};

/**
 * Generate attendance record key for a specific event and date
 * @param eventId - Event ID
 * @param date - Date object
 * @returns Unique key for attendance record
 */
export const getAttendanceKey = (eventId: string, date: Date): string => {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${eventId}_${dateStr}`;
};
