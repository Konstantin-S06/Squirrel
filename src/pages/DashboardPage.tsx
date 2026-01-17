import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerStats from '../components/PlayerStats';
import AvatarCircle from '../components/AvatarCircle';
import ActionButton from '../components/ActionButton';
import AcornCounter from '../components/AcornCounter';
import ActivityJournal from '../components/ActivityJournal';
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

  useEffect(() => {
    // Load acorns from localStorage or default to 0
    const savedAcorns = localStorage.getItem('acorns');
    if (savedAcorns) {
      setAcorns(parseInt(savedAcorns, 10));
    }

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

  return (
    <div className={styles.container}>
      {/* Friends Button - Top Left */}
      <button onClick={handleFriends} className={styles.friendsButton}>
        👥 Friends
      </button>

      {/* Top Right Section: Acorn Counter & Journal */}
      <div className={styles.topRightSection}>
        <AcornCounter acorns={acorns} />
        <ActivityJournal activities={activities} />
      </div>

      <main className={styles.main}>
        <PlayerStats level="-" currentXP="-" maxXP="-" />
        <AvatarCircle />
        <div className={styles.actions}>
          <ActionButton label="Edit" onClick={handleEdit} variant="primary" />
          <ActionButton label="Battle" onClick={handleBattle} variant="danger" />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
