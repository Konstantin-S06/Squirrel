import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
  courseName: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
}

interface UserDoc {
  name: string;
  xp: number;
  courses?: string[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ courseName }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!courseName) {
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('courses', 'array-contains', courseName));
        const querySnapshot = await getDocs(q);

        const users: UserDoc[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as UserDoc;
          users.push({
            name: data.name || 'Anonymous',
            xp: data.xp || 0,
            courses: data.courses || []
          });
        });

        const sortedUsers = users
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 5)
          .map((user, index) => ({
            rank: index + 1,
            username: user.name,
            xp: user.xp
          }));

        setLeaderboardData(sortedUsers);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [courseName]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Leaderboard</h2>
      <div className={styles.list}>
        {loading ? (
          <div className={styles.placeholder}>Loading...</div>
        ) : leaderboardData.length === 0 ? (
          <div className={styles.placeholder}>No users enrolled in this course</div>
        ) : (
          leaderboardData.map((entry) => (
            <div key={entry.rank} className={styles.entry}>
              <div className={styles.rank}>#{entry.rank}</div>
              <div className={styles.info}>
                <div className={styles.username}>{entry.username}</div>
                <div className={styles.stats}>
                  {entry.xp} XP
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
