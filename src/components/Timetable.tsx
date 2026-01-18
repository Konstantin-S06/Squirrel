import React, { useState, useRef, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import {
    parseICS,
    TimetableEvent,
    getEventsForDay,
    isEventHappeningNow,
    formatTime,
    getDayName,
    getAttendanceKey,
    AttendanceRecord
} from '../services/icsParser';
import {
    awardAttendanceRewards,
    removeAttendanceRewards,
    getAttendanceStreak,
    AttendanceReward
} from '../services/attendanceRewardService';
import styles from './Timetable.module.css';

const Timetable: React.FC = () => {
    const [events, setEvents] = useState<TimetableEvent[]>([]);
    const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
    const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
    const [loading, setLoading] = useState(true);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [showRewardPopup, setShowRewardPopup] = useState(false);
    const [lastReward, setLastReward] = useState<AttendanceReward | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load all data when user is authenticated
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Load timetable events
                const timetableDoc = await getDoc(doc(db, 'users', user.uid, 'timetable', 'events'));
                if (timetableDoc.exists()) {
                    const data = timetableDoc.data();
                    if (data.events && data.events.length > 0) {
                        // Convert stored dates back to Date objects
                        const parsedEvents = data.events.map((e: any) => ({
                            ...e,
                            startTime: new Date(e.startTime),
                            endTime: new Date(e.endTime)
                        }));
                        setEvents(parsedEvents);
                    }
                }

                // Load attendance records
                const attendanceDoc = await getDoc(doc(db, 'users', user.uid, 'timetable', 'attendance'));
                if (attendanceDoc.exists()) {
                    const data = attendanceDoc.data();
                    const attendanceMap = new Map<string, AttendanceRecord>(Object.entries(data.records || {}));
                    setAttendance(attendanceMap);
                }

                // Load current streak
                const streakData = await getAttendanceStreak(user.uid);
                setCurrentStreak(streakData.currentStreak);
            } catch (error) {
                console.error('Error loading timetable data:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const parsedEvents = parseICS(content);
                setEvents(parsedEvents);

                // Save to Firebase
                const user = auth.currentUser;
                if (user) {
                    await setDoc(doc(db, 'users', user.uid, 'timetable', 'events'), {
                        events: parsedEvents.map(event => ({
                            ...event,
                            startTime: event.startTime.toISOString(),
                            endTime: event.endTime.toISOString()
                        })),
                        uploadedAt: new Date().toISOString()
                    });
                    console.log('Timetable saved successfully!');
                }
            } catch (error) {
                console.error('Error saving timetable:', error);
                alert('Error uploading timetable. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = () => {
            console.error('Error reading file');
            alert('Error reading file. Please try again.');
            setLoading(false);
        };

        reader.readAsText(file);
    };

    const handleAttendanceToggle = async (event: TimetableEvent) => {
        const user = auth.currentUser;
        if (!user) return;

        // Only allow checking off during lecture time
        if (!isEventHappeningNow(event)) {
            alert('You can only mark attendance during the lecture time!');
            return;
        }

        const now = new Date();
        const attendanceKey = getAttendanceKey(event.id, now);

        const newAttendance = new Map(attendance);
        const currentRecord = newAttendance.get(attendanceKey);

        if (currentRecord) {
            // Toggle off - remove rewards
            try {
                await removeAttendanceRewards(user.uid, now.toISOString().split('T')[0]);
                newAttendance.delete(attendanceKey);

                // Reload streak
                const streakData = await getAttendanceStreak(user.uid);
                setCurrentStreak(streakData.currentStreak);
            } catch (error) {
                console.error('Error removing rewards:', error);
                alert('Error removing attendance rewards');
                return;
            }
        } else {
            // Mark as attended - award rewards
            try {
                const reward = await awardAttendanceRewards(user.uid, now.toISOString().split('T')[0]);

                newAttendance.set(attendanceKey, {
                    eventId: event.id,
                    date: now.toISOString().split('T')[0],
                    attended: true,
                    checkedAt: now
                });

                // Update streak display
                setCurrentStreak(reward.currentStreak);

                // Show reward popup
                setLastReward(reward);
                setShowRewardPopup(true);
                setTimeout(() => setShowRewardPopup(false), 5000);
            } catch (error) {
                console.error('Error awarding rewards:', error);
                alert('Error awarding attendance rewards');
                return;
            }
        }

        setAttendance(newAttendance);

        // Save attendance to Firebase
        try {
            const attendanceObj = Object.fromEntries(newAttendance.entries());
            await setDoc(doc(db, 'users', user.uid, 'timetable', 'attendance'), {
                records: attendanceObj,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving attendance:', error);
        }
    };

    const isEventAttended = (event: TimetableEvent): boolean => {
        const today = new Date();
        const attendanceKey = getAttendanceKey(event.id, today);
        return attendance.has(attendanceKey);
    };

    const filteredEvents = getEventsForDay(events, selectedDay);

    const getAttendanceStats = () => {
        const total = filteredEvents.length;
        const attended = filteredEvents.filter(e => isEventAttended(e)).length;
        return { total, attended };
    };

    const stats = getAttendanceStats();

    const weekDays = [
        { num: 1, name: 'Mon' },
        { num: 2, name: 'Tue' },
        { num: 3, name: 'Wed' },
        { num: 4, name: 'Thu' },
        { num: 5, name: 'Fri' }
    ];

    return (
        <div className={styles.timetableContainer}>
            <div className={styles.header}>
                <h3 className={styles.title}>My Timetable</h3>
                <button
                    className={styles.uploadButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : events.length > 0 ? 'Update' : 'Import .ics'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ics"
                    onChange={handleFileUpload}
                    className={styles.hiddenInput}
                />
            </div>

            {events.length > 0 && (
                <>
                    {currentStreak > 0 && (
                        <div className={styles.streakBanner}>
                            🔥 <strong>{currentStreak}</strong> day streak! Keep it up!
                        </div>
                    )}

                    {showRewardPopup && lastReward && (
                        <div className={styles.rewardPopup}>
                            <div className={styles.rewardTitle}>
                                {lastReward.levelUp && `🎉 Level Up! Level ${lastReward.newLevel}!`}
                                {!lastReward.levelUp && '✅ Attendance Marked!'}
                            </div>
                            <div className={styles.rewardDetails}>
                                <div className={styles.rewardItem}>
                                    +{lastReward.acorns} 🌰
                                    {lastReward.streakMultiplier > 1 && (
                                        <span className={styles.multiplier}> ({lastReward.streakMultiplier}x)</span>
                                    )}
                                </div>
                                <div className={styles.rewardItem}>
                                    +{lastReward.xp} XP
                                    {lastReward.streakMultiplier > 1 && (
                                        <span className={styles.multiplier}> ({lastReward.streakMultiplier}x)</span>
                                    )}
                                </div>
                            </div>
                            {lastReward.streakMultiplier > 1 && (
                                <div className={styles.streakLabel}>{lastReward.streakLabel}</div>
                            )}
                        </div>
                    )}

                    <div className={styles.attendanceStats}>
                        Today's Attendance: <strong>{stats.attended}/{stats.total}</strong>
                        {stats.total > 0 && ` (${Math.round((stats.attended / stats.total) * 100)}%)`}
                    </div>

                    <div className={styles.daySelector}>
                        {weekDays.map(day => (
                            <button
                                key={day.num}
                                className={`${styles.dayButton} ${selectedDay === day.num ? styles.active : ''}`}
                                onClick={() => setSelectedDay(day.num)}
                            >
                                {day.name}
                            </button>
                        ))}
                    </div>

                    <div className={styles.eventsList}>
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => {
                                const happening = isEventHappeningNow(event);
                                const attended = isEventAttended(event);

                                return (
                                    <div
                                        key={event.id}
                                        className={`${styles.eventCard} ${happening ? styles.happening : ''} ${attended ? styles.attended : ''}`}
                                    >
                                        <div className={styles.eventHeader}>
                                            <div>
                                                {event.courseCode && (
                                                    <div className={styles.courseCode}>{event.courseCode}</div>
                                                )}
                                                <h4 className={styles.eventTitle}>{event.title}</h4>
                                            </div>
                                            {happening && (
                                                <span className={styles.happeningBadge}>NOW</span>
                                            )}
                                        </div>
                                        <div className={styles.eventTime}>
                                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                        </div>
                                        {event.location && (
                                            <div className={styles.eventLocation}>
                                                📍 {event.location}
                                            </div>
                                        )}
                                        <div className={styles.checkboxContainer}>
                                            <input
                                                type="checkbox"
                                                id={`attendance-${event.id}`}
                                                className={styles.checkbox}
                                                checked={attended}
                                                onChange={() => handleAttendanceToggle(event)}
                                                disabled={!happening}
                                            />
                                            <label
                                                htmlFor={`attendance-${event.id}`}
                                                className={`${styles.checkboxLabel} ${!happening ? styles.disabled : ''}`}
                                            >
                                                {attended ? 'Attended' : 'Mark as attended'}
                                                {!happening && ' (only during class)'}
                                            </label>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.emptyState}>
                                No classes scheduled for {getDayName(selectedDay)}
                            </div>
                        )}
                    </div>
                </>
            )}

            {events.length === 0 && !loading && (
                <div className={styles.emptyState}>
                    <p>Import your Canvas calendar (.ics file) to see your class schedule</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7 }}>
                        Get your .ics file from Canvas → Calendar → Calendar Feed
                    </p>
                </div>
            )}
        </div>
    );
};

export default Timetable;
