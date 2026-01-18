// Attendance Reward Service - handles acorns, XP, and streak bonuses

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';


// Base rewards for attending a class
const BASE_ACORNS = 5;
const BASE_XP = 10;

// Streak multipliers
const STREAK_MULTIPLIERS = [
    { minStreak: 1, multiplier: 1.0, label: 'First class!' },
    { minStreak: 3, multiplier: 1.2, label: '3-day streak!' },
    { minStreak: 5, multiplier: 1.5, label: '5-day streak!' },
    { minStreak: 7, multiplier: 2.0, label: 'Week streak!' },
    { minStreak: 14, multiplier: 2.5, label: '2-week streak!' },
    { minStreak: 21, multiplier: 3.0, label: '3-week streak!' },
    { minStreak: 30, multiplier: 4.0, label: 'Month streak!' },
];

export interface AttendanceReward {
    acorns: number;
    xp: number;
    baseAcorns: number;
    baseXP: number;
    streakMultiplier: number;
    currentStreak: number;
    streakLabel: string;
    levelUp: boolean;
    newLevel?: number;
}

export interface StreakData {
    currentStreak: number;
    lastAttendanceDate: string; // YYYY-MM-DD
    totalDaysAttended: number;
}

/**
 * Get current attendance streak for a user
 */
export const getAttendanceStreak = async (userId: string): Promise<StreakData> => {
    try {
        const streakDoc = await getDoc(doc(db, 'users', userId, 'timetable', 'streak'));

        if (streakDoc.exists()) {
            const data = streakDoc.data();
            return {
                currentStreak: data.currentStreak || 0,
                lastAttendanceDate: data.lastAttendanceDate || '',
                totalDaysAttended: data.totalDaysAttended || 0
            };
        }

        return {
            currentStreak: 0,
            lastAttendanceDate: '',
            totalDaysAttended: 0
        };
    } catch (error) {
        console.error('Error getting attendance streak:', error);
        return {
            currentStreak: 0,
            lastAttendanceDate: '',
            totalDaysAttended: 0
        };
    }
};

/**
 * Update attendance streak based on attendance date
 */
const updateStreak = async (userId: string, attendanceDate: string): Promise<number> => {
    const streakData = await getAttendanceStreak(userId);
    const today = attendanceDate;
    const lastDate = streakData.lastAttendanceDate;

    let newStreak = 1;

    if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        const diffTime = todayObj.getTime() - lastDateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Same day - maintain current streak
            newStreak = streakData.currentStreak;
        } else if (diffDays === 1) {
            // Consecutive day - increment streak
            newStreak = streakData.currentStreak + 1;
        } else {
            // Streak broken - reset to 1
            newStreak = 1;
        }
    }

    // Save updated streak
    await setDoc(doc(db, 'users', userId, 'timetable', 'streak'), {
        currentStreak: newStreak,
        lastAttendanceDate: today,
        totalDaysAttended: streakData.totalDaysAttended + 1,
        updatedAt: new Date().toISOString()
    });

    return newStreak;
};

/**
 * Get streak multiplier based on current streak
 */
const getStreakMultiplier = (streak: number): { multiplier: number; label: string } => {
    // Find the highest tier the user qualifies for
    let result = STREAK_MULTIPLIERS[0];

    for (const tier of STREAK_MULTIPLIERS) {
        if (streak >= tier.minStreak) {
            result = tier;
        } else {
            break;
        }
    }

    return { multiplier: result.multiplier, label: result.label };
};

/**
 * Calculate level from XP
 */
const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1;
};

/**
 * Award rewards for attending a class
 */
export const awardAttendanceRewards = async (
    userId: string,
    attendanceDate: string
): Promise<AttendanceReward> => {
    try {
        // Update streak
        const currentStreak = await updateStreak(userId, attendanceDate);

        // Get streak multiplier
        const { multiplier, label } = getStreakMultiplier(currentStreak);

        // Calculate rewards
        const acornsEarned = Math.floor(BASE_ACORNS * multiplier);
        const xpEarned = Math.floor(BASE_XP * multiplier);

        // Get current user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        const currentXP = userData?.xp || 0;
        const currentLevel = userData?.level || 1;
        const currentAcorns = userData?.acorns || 0;

        const newXP = currentXP + xpEarned;
        const newLevel = calculateLevel(newXP);
        const levelUp = newLevel > currentLevel;

        // Update user stats
        await updateDoc(doc(db, 'users', userId), {
            acorns: currentAcorns + acornsEarned,
            xp: newXP,
            level: newLevel
        });

        // Add activity log entry
        const journalRef = doc(db, 'journal', `${userId}_${Date.now()}`);
        await setDoc(journalRef, {
            userId,
            message: `Attended class! +${acornsEarned}🌰 +${xpEarned}XP ${multiplier > 1 ? `(${multiplier}x streak bonus!)` : ''}`,
            timestamp: new Date(),
            type: 'attendance'
        });

        return {
            acorns: acornsEarned,
            xp: xpEarned,
            baseAcorns: BASE_ACORNS,
            baseXP: BASE_XP,
            streakMultiplier: multiplier,
            currentStreak,
            streakLabel: label,
            levelUp,
            newLevel: levelUp ? newLevel : undefined
        };
    } catch (error) {
        console.error('Error awarding attendance rewards:', error);
        throw error;
    }
};

/**
 * Remove rewards if attendance is unmarked (undo)
 */
export const removeAttendanceRewards = async (
    userId: string,
    attendanceDate: string
): Promise<void> => {
    try {
        // Get user data to calculate what to subtract
        const streakData = await getAttendanceStreak(userId);
        const { multiplier } = getStreakMultiplier(streakData.currentStreak);

        const acornsToRemove = Math.floor(BASE_ACORNS * multiplier);
        const xpToRemove = Math.floor(BASE_XP * multiplier);

        // Get current user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        const currentXP = userData?.xp || 0;
        const currentAcorns = userData?.acorns || 0;

        const newXP = Math.max(0, currentXP - xpToRemove);
        const newLevel = calculateLevel(newXP);
        const newAcorns = Math.max(0, currentAcorns - acornsToRemove);

        // Update user stats
        await updateDoc(doc(db, 'users', userId), {
            acorns: newAcorns,
            xp: newXP,
            level: newLevel
        });

        // Note: We don't revert the streak since that would be complex
        // and could lead to inconsistencies

    } catch (error) {
        console.error('Error removing attendance rewards:', error);
        throw error;
    }
};
