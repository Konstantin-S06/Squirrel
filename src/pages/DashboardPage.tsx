import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { fetchUserData } from '../services/battleService';
import PlayerStats from '../components/PlayerStats';
import AvatarCircle from '../components/AvatarCircle';
import ActionButton from '../components/ActionButton';
import AcornCounter from '../components/AcornCounter';
import ActivityJournal from '../components/ActivityJournal';
import Header from '../components/Header';
import styles from './DashboardPage.module.css';

interface Activity {
  id: string;
  message: string;
  timestamp: Date;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [acorns, setAcorns] = useState<number>(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [level, setLevel] = useState<number>(1);
  const [currentXP, setCurrentXP] = useState<number>(0);
  const [maxXP, setMaxXP] = useState<number>(100);

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Load user stats from Firebase
        const userData = await fetchUserData(user.uid);
        if (userData) {
          setAcorns(userData.acorns);
          setLevel(userData.level);
          
          // Calculate current XP and max XP based on level
          // Level 1: 0-99 XP, Level 2: 100-199 XP, etc.
          const baseXP = (userData.level - 1) * 100;
          const xpInCurrentLevel = userData.xp - baseXP;
          setCurrentXP(xpInCurrentLevel);
          setMaxXP(100); // 100 XP per level
        }

        // Load journal entries from Firebase
        const journalRef = collection(db, 'journal');
        const journalQuery = query(
          journalRef,
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        
        const journalSnapshot = await getDocs(journalQuery);
        const journalEntries: Activity[] = journalSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            message: data.message || '',
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });

        // If no entries, add a welcome message
        if (journalEntries.length === 0) {
          setActivities([{
            id: 'welcome',
            message: 'Welcome to Squirrel!',
            timestamp: new Date(),
          }]);
        } else {
          setActivities(journalEntries);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadUserData();
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = () => {
    navigate('/edit-avatar');
  };

  const handleBattle = () => {
    navigate('/battle');
  };

  const handleFriends = () => {
    navigate('/friends');
  };

  const handleCourses = () => {
    navigate('/courses');
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <Header />
      </div>
      <div className={styles.contentWrapper}>
        {/* Left Section: Friends & Courses */}
        <div className={styles.leftSection}>
          <button onClick={handleFriends} className={styles.friendsButton}>
            👥 Friends
          </button>
          <button onClick={handleCourses} className={styles.coursesButton}>
            📚 Courses
          </button>
        </div>

        {/* Top Right Section: Acorn Counter & Journal */}
        <div className={styles.topRightSection}>
          <AcornCounter acorns={acorns} />
          <ActivityJournal activities={activities} />
        </div>

        <main className={styles.main}>
          <PlayerStats level={level} currentXP={currentXP} maxXP={maxXP} />
          <AvatarCircle />
          <div className={styles.actions}>
            <ActionButton label="Edit" onClick={handleEdit} variant="primary" />
            <ActionButton label="Battle" onClick={handleBattle} variant="danger" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
