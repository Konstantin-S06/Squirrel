// Battle service - handles Firestore operations for battles

import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { UserBattleData, BattleResult, calculateBattle, isShielded } from '../utils/battleUtils';

/**
 * Fetch user data from Firestore
 */
export const fetchUserData = async (uid: string): Promise<UserBattleData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();

    return {
      uid,
      name: data.name || 'Anonymous',
      level: data.level || 1,
      xp: data.xp || 0,
      acorns: data.acorns || 50,
      avatarUrl: data.avatarUrl || '',
      lastBattleTime: data.lastBattleTime ? data.lastBattleTime.toDate() : null,
      shieldEndTime: data.shieldEndTime ? data.shieldEndTime.toDate() : null,
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Find a random opponent (excludes self and shielded users)
 */
export const findRandomOpponent = async (currentUserId: string): Promise<UserBattleData | null> => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    const eligibleOpponents: UserBattleData[] = [];

    usersSnapshot.forEach((doc) => {
      // Skip self
      if (doc.id === currentUserId) return;

      const data = doc.data();
      const shieldEndTime = data.shieldEndTime ? data.shieldEndTime.toDate() : null;

      // Skip shielded users
      if (isShielded(shieldEndTime)) return;

      eligibleOpponents.push({
        uid: doc.id,
        name: data.name || 'Anonymous',
        level: data.level || 1,
        xp: data.xp || 0,
        acorns: data.acorns || 50,
        avatarUrl: data.avatarUrl || '',
        lastBattleTime: data.lastBattleTime ? data.lastBattleTime.toDate() : null,
        shieldEndTime,
      });
    });

    if (eligibleOpponents.length === 0) {
      return null;
    }

    // Pick random opponent
    const randomIndex = Math.floor(Math.random() * eligibleOpponents.length);
    return eligibleOpponents[randomIndex];
  } catch (error) {
    console.error('Error finding opponent:', error);
    return null;
  }
};

/**
 * Execute battle and update Firestore
 */
export const executeBattle = async (
  attackerId: string,
  attacker: UserBattleData,
  defender: UserBattleData
): Promise<BattleResult> => {
  // Calculate battle result
  const result = calculateBattle(attacker, defender);

  // Update Firestore using batch write for atomicity
  const batch = writeBatch(db);

  const now = Timestamp.now();
  const shieldEndTime = Timestamp.fromDate(new Date(Date.now() + 8 * 60 * 60 * 1000)); // +8 hours

  // Update attacker
  const attackerRef = doc(db, 'users', attackerId);
  batch.update(attackerRef, {
    xp: result.attacker.newXP,
    level: result.attacker.newLevel,
    acorns: result.attacker.newAcorns,
    lastBattleTime: now,
  });

  // Update defender (add shield)
  const defenderRef = doc(db, 'users', defender.uid);
  batch.update(defenderRef, {
    xp: result.defender.newXP,
    level: result.defender.newLevel,
    acorns: result.defender.newAcorns,
    shieldEndTime: shieldEndTime,
  });

  // Create battle record
  const battlesRef = collection(db, 'battles');
  const battleRecord = {
    attackerId: attackerId,
    defenderId: defender.uid,
    winnerId: result.won ? attackerId : defender.uid,
    timestamp: now,
    attackerStats: {
      nameAtBattle: attacker.name,
      levelAtBattle: attacker.level,
      xpAtBattle: attacker.xp,
      xpGained: result.attacker.xpGained,
      acornsChange: result.attacker.acornsChange,
      avatarUrl: attacker.avatarUrl,
    },
    defenderStats: {
      nameAtBattle: defender.name,
      levelAtBattle: defender.level,
      xpAtBattle: defender.xp,
      xpGained: result.defender.xpGained,
      acornsChange: result.defender.acornsChange,
      avatarUrl: defender.avatarUrl,
    },
  };

  await batch.commit();
  await addDoc(battlesRef, battleRecord);

  // Create journal entries for both users
  const journalRef = collection(db, 'journal');
  
  // Attacker's journal entry
  const attackerMessage = result.won
    ? `🎉 Won battle against ${defender.name}! Gained ${result.attacker.xpGained} XP and ${result.attacker.acornsChange} acorns.`
    : `💔 Lost battle to ${defender.name}. Gained ${result.attacker.xpGained} XP but lost ${Math.abs(result.attacker.acornsChange)} acorns.`;
  
  await addDoc(journalRef, {
    userId: attackerId,
    message: attackerMessage,
    timestamp: now,
    type: 'battle',
  });

  // Defender's journal entry
  const defenderMessage = !result.won
    ? `🎉 Won battle against ${attacker.name}! Gained ${result.defender.xpGained} XP and ${result.defender.acornsChange} acorns.`
    : `💔 Lost battle to ${attacker.name}. Gained ${result.defender.xpGained} XP but lost ${Math.abs(result.defender.acornsChange)} acorns.`;
  
  await addDoc(journalRef, {
    userId: defender.uid,
    message: defenderMessage,
    timestamp: now,
    type: 'battle',
  });

  return result;
};
