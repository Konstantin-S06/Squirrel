import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import styles from './BattlePage.module.css';

const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const [shieldTime, setShieldTime] = useState<number>(0); // Shield timer in seconds
  const [resetTime, setResetTime] = useState<number>(0); // Battle reset timer in seconds

  // Shield timer logic (24 hours = 86400 seconds)
  useEffect(() => {
    const loadShieldTimer = () => {
      const savedTime = localStorage.getItem('shieldEndTime');
      if (savedTime) {
        const endTime = parseInt(savedTime, 10);
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setShieldTime(remaining);
      }
    };

    loadShieldTimer();
    const interval = setInterval(() => {
      loadShieldTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Battle reset timer logic (24 hours = 86400 seconds)
  useEffect(() => {
    const loadResetTimer = () => {
      const savedTime = localStorage.getItem('battleResetTime');
      if (savedTime) {
        const endTime = parseInt(savedTime, 10);
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setResetTime(remaining);
      }
    };

    loadResetTimer();
    const interval = setInterval(() => {
      loadResetTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBattleRandom = () => {
    console.log('Battle Random clicked');
    // TODO: Implement battle random logic
    // For now, just set timers (24 hours from now)
    const now = Date.now();
    const shieldEndTime = now + (24 * 60 * 60 * 1000); // 24 hours
    const resetEndTime = now + (24 * 60 * 60 * 1000); // 24 hours
    
    localStorage.setItem('shieldEndTime', shieldEndTime.toString());
    localStorage.setItem('battleResetTime', resetEndTime.toString());
    
    setShieldTime(24 * 60 * 60);
    setResetTime(24 * 60 * 60);
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.contentWrapper}>
        {/* Back to Dashboard Button - Top Left */}
        <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
          ← Back to Dashboard
        </button>

        {/* Active Shield Timer - Top Right */}
        <div className={styles.shieldTimer}>
          <div className={styles.timerLabel}>Active Shield</div>
          <div className={styles.timerValue}>
            {shieldTime > 0 ? formatTime(shieldTime) : '00:00:00'}
          </div>
        </div>

        {/* Battle Random Button - Left Side */}
        <div className={styles.battleButtonContainer}>
          <button 
            className={styles.battleRandomButton}
            onClick={handleBattleRandom}
            disabled={resetTime > 0}
          >
            Battle Random
          </button>
        </div>

        {/* Battle Reset Timer - Bottom Left */}
        <div className={styles.resetTimer}>
          <div className={styles.timerLabel}>Battle Reset</div>
          <div className={styles.timerValue}>
            {resetTime > 0 ? formatTime(resetTime) : 'Ready'}
          </div>
        </div>

        {/* Squirrel with Toy Sword - Bottom Right */}
        <div className={styles.squirrelContainer}>
          <div className={styles.squirrelWrapper}>
            <div className={styles.squirrel}>🐿️</div>
            <div className={styles.sword}>⚔️</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlePage;
