import React from 'react';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
  courseName: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  xp: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ courseName }) => {
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, username: 'SquirrelMaster', level: 12, xp: 2450 },
    { rank: 2, username: 'AcornHoarder', level: 11, xp: 2180 },
    { rank: 3, username: 'NuttyProf', level: 10, xp: 1920 },
    { rank: 4, username: 'TreeClimber', level: 9, xp: 1750 },
    { rank: 5, username: 'StudyNut', level: 9, xp: 1680 },
    { rank: 6, username: 'QuizWhiz', level: 8, xp: 1540 },
    { rank: 7, username: 'MathSquirrel', level: 8, xp: 1490 },
    { rank: 8, username: 'CodeNut', level: 7, xp: 1320 },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Leaderboard</h2>
      <div className={styles.list}>
        {leaderboardData.map((entry) => (
          <div key={entry.rank} className={styles.entry}>
            <div className={styles.rank}>#{entry.rank}</div>
            <div className={styles.info}>
              <div className={styles.username}>{entry.username}</div>
              <div className={styles.stats}>
                Level {entry.level} • {entry.xp} XP
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
