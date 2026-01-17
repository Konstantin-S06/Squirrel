import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { fetchUserData } from '../services/battleService';
import { calculateLevel } from '../utils/battleUtils';
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load user data from Firebase
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchUserData(user.uid);
        if (userData) {
          // Get level and XP from Firebase
          const userLevel = userData.level || calculateLevel(userData.xp || 0);
          const userXP = userData.xp || 0;
          
          setLevel(userLevel);
          
          // Display XP progress: show total XP / XP needed for next level
          // Level 1 (0-99 XP): show 0-99 / 100 (XP needed for level 2)
          // Level 2 (100-199 XP): show 100-199 / 200 (XP needed for level 3)
          // Formula: XP needed for next level = currentLevel * 100
          setCurrentXP(userXP);
          setMaxXP(userLevel * 100);
          
          // Update acorns from Firebase if available
          if (userData.acorns !== undefined) {
            setAcorns(userData.acorns);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Load activities from localStorage or initialize with default
    const savedActivities = localStorage.getItem('activities');
    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities);
        setActivities(parsed.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        })));
      } catch (e) {
        console.error('Error parsing activities:', e);
      }
    } else {
      // Initialize with default activities
      const defaultActivities: Activity[] = [
        {
          id: '1',
          message: 'Welcome to Squirrel!',
          timestamp: new Date(),
        },
      ];
      setActivities(defaultActivities);
      localStorage.setItem('activities', JSON.stringify(defaultActivities));
    }
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
          {loading ? (
            <PlayerStats level="Loading..." currentXP="..." maxXP="..." />
          ) : (
            <PlayerStats level={level} currentXP={currentXP} maxXP={maxXP} />
          )}
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
