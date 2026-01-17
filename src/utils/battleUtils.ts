// Battle utility functions

export interface UserBattleData {
  uid: string;
  name: string;
  level: number;
  xp: number;
  acorns: number;
  avatarUrl: string;
  lastBattleTime: Date | null;
  shieldEndTime: Date | null;
}

export interface BattleResult {
  won: boolean;
  attacker: {
    xpGained: number;
    acornsChange: number;
    newXP: number;
    newLevel: number;
    newAcorns: number;
  };
  defender: {
    xpGained: number;
    acornsChange: number;
    newXP: number;
    newLevel: number;
    newAcorns: number;
  };
  opponentData: {
    name: string;
    level: number;
    xp: number;
    avatarUrl: string;
  };
}

/**
 * Calculate level from XP
 * Level 1: 0-99 XP
 * Level 2: 100-199 XP
 * Level 3: 200-299 XP, etc.
 */
export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

/**
 * Calculate battle power with randomness
 */
const calculatePower = (level: number, xp: number): number => {
  const randomBonus = Math.floor(Math.random() * 201); // 0-200
  return (level * 100) + xp + randomBonus;
};

/**
 * Calculate XP rewards based on opponent level
 */
const calculateXPReward = (opponentLevel: number, isWinner: boolean): number => {
  if (isWinner) {
    return 50 + (opponentLevel * 10);
  } else {
    return 20 + (opponentLevel * 5);
  }
};

/**
 * Calculate acorns stolen based on XP gained by winner
 */
const calculateAcornsStolen = (xpGainedByWinner: number): number => {
  return 2 + Math.floor(xpGainedByWinner / 20);
};

/**
 * Execute battle calculation
 * @param attacker - The user initiating the battle
 * @param defender - The randomly selected opponent
 * @returns BattleResult with all changes
 */
export const calculateBattle = (
  attacker: UserBattleData,
  defender: UserBattleData
): BattleResult => {
  // Calculate battle power
  const attackerPower = calculatePower(attacker.level, attacker.xp);
  const defenderPower = calculatePower(defender.level, defender.xp);

  const attackerWon = attackerPower > defenderPower;

  // Calculate XP rewards
  const attackerXPGained = calculateXPReward(defender.level, attackerWon);
  const defenderXPGained = calculateXPReward(attacker.level, !attackerWon);

  // Calculate acorn changes
  let acornsStolen: number;
  if (attackerWon) {
    const attackerTotalXP = attackerXPGained;
    acornsStolen = calculateAcornsStolen(attackerTotalXP);
  } else {
    const defenderTotalXP = defenderXPGained;
    acornsStolen = calculateAcornsStolen(defenderTotalXP);
  }

  // Calculate new stats for attacker
  const attackerNewXP = attacker.xp + attackerXPGained;
  const attackerNewLevel = calculateLevel(attackerNewXP);
  const attackerAcornsChange = attackerWon ? acornsStolen : -acornsStolen;
  const attackerNewAcorns = Math.max(0, attacker.acorns + attackerAcornsChange);

  // Calculate new stats for defender
  const defenderNewXP = defender.xp + defenderXPGained;
  const defenderNewLevel = calculateLevel(defenderNewXP);
  const defenderAcornsChange = attackerWon ? -acornsStolen : acornsStolen;
  const defenderNewAcorns = Math.max(0, defender.acorns + defenderAcornsChange);

  return {
    won: attackerWon,
    attacker: {
      xpGained: attackerXPGained,
      acornsChange: attackerAcornsChange,
      newXP: attackerNewXP,
      newLevel: attackerNewLevel,
      newAcorns: attackerNewAcorns,
    },
    defender: {
      xpGained: defenderXPGained,
      acornsChange: defenderAcornsChange,
      newXP: defenderNewXP,
      newLevel: defenderNewLevel,
      newAcorns: defenderNewAcorns,
    },
    opponentData: {
      name: defender.name,
      level: defender.level,
      xp: defender.xp,
      avatarUrl: defender.avatarUrl,
    },
  };
};

/**
 * Check if user can battle (8 hour cooldown)
 */
export const canBattle = (lastBattleTime: Date | null): boolean => {
  if (!lastBattleTime) return true;

  const now = new Date();
  const eightHoursInMs = 8 * 60 * 60 * 1000;
  const timeSinceLastBattle = now.getTime() - lastBattleTime.getTime();

  return timeSinceLastBattle >= eightHoursInMs;
};

/**
 * Check if user is currently shielded
 */
export const isShielded = (shieldEndTime: Date | null): boolean => {
  if (!shieldEndTime) return false;

  const now = new Date();
  return now.getTime() < shieldEndTime.getTime();
};

/**
 * Get time remaining until battle cooldown expires
 */
export const getTimeUntilNextBattle = (lastBattleTime: Date | null): number => {
  if (!lastBattleTime) return 0;

  const now = new Date();
  const eightHoursInMs = 8 * 60 * 60 * 1000;
  const nextBattleTime = lastBattleTime.getTime() + eightHoursInMs;
  const remaining = Math.max(0, Math.floor((nextBattleTime - now.getTime()) / 1000));

  return remaining;
};

/**
 * Get time remaining on shield
 */
export const getShieldTimeRemaining = (shieldEndTime: Date | null): number => {
  if (!shieldEndTime) return 0;

  const now = new Date();
  const remaining = Math.max(0, Math.floor((shieldEndTime.getTime() - now.getTime()) / 1000));

  return remaining;
};
