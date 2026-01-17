import React from 'react';
import styles from './PlayerStats.module.css';

interface PlayerStatsProps {
  level: string | number;
  currentXP: string | number;
  maxXP: string | number;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ level, currentXP, maxXP }) => {
  return (
    <div className={styles.container}>
      <div className={styles.stat}>
        <span className={styles.label}>Level:</span>
        <span className={styles.value}>{level}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>XP:</span>
        <span className={styles.value}>{currentXP}/{maxXP}</span>
      </div>
    </div>
  );
};

export default PlayerStats;
