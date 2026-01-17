import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { fetchUserData, findRandomOpponent, executeBattle } from '../services/battleService';
import { getTimeUntilNextBattle, getShieldTimeRemaining, canBattle } from '../utils/battleUtils';
import BattleResultModal from '../components/BattleResultModal';
import styles from './BattlePage.module.css';

interface BattleResultData {
  won: boolean;
  xpGained: number;
  acornsChange: number;
  opponentData: {
    name: string;
    level: number;
    xp: number;
    avatarUrl: string;
  };
}

const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const [shieldTime, setShieldTime] = useState<number>(0); // Shield timer in seconds
  const [resetTime, setResetTime] = useState<number>(0); // Battle reset timer in seconds
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<BattleResultData | null>(null);

  // Load timers from Firestore
  useEffect(() => {
    const loadTimers = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userData = await fetchUserData(user.uid);
      if (!userData) return;

      const shieldRemaining = getShieldTimeRemaining(userData.shieldEndTime);
      const battleRemaining = getTimeUntilNextBattle(userData.lastBattleTime);

      setShieldTime(shieldRemaining);
      setResetTime(battleRemaining);
    };

    loadTimers();

    // Update timers every second
    const interval = setInterval(() => {
      setShieldTime((prev) => Math.max(0, prev - 1));
      setResetTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBattleRandom = async () => {
    setError('');
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to battle');
        setIsLoading(false);
        return;
      }

      // Fetch current user data
      const userData = await fetchUserData(user.uid);
      if (!userData) {
        setError('Could not load your user data');
        setIsLoading(false);
        return;
      }

      // Check if user can battle (8 hour cooldown)
      if (!canBattle(userData.lastBattleTime)) {
        setError('Battle cooldown not expired yet!');
        setIsLoading(false);
        return;
      }

      // Find random opponent
      const opponent = await findRandomOpponent(user.uid);
      if (!opponent) {
        setError('No opponents available. Try again later!');
        setIsLoading(false);
        return;
      }

      // Execute battle
      const result = await executeBattle(user.uid, userData, opponent);

      // Set battle result for modal
      setBattleResult({
        won: result.won,
        xpGained: result.attacker.xpGained,
        acornsChange: result.attacker.acornsChange,
        opponentData: result.opponentData,
      });

      // Update timers (8 hours from now)
      const eightHoursInSeconds = 8 * 60 * 60;
      setResetTime(eightHoursInSeconds);

      // Show results modal
      setShowResultModal(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Battle error:', err);
      setError('An error occurred during battle. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    setBattleResult(null);
  };

  return (
    <div className={styles.container}>
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
          disabled={resetTime > 0 || isLoading}
        >
          {isLoading ? 'Battling...' : 'Battle Random'}
        </button>
        {error && <div className={styles.errorMessage}>{error}</div>}
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

      {/* Battle Result Modal */}
      {battleResult && (
        <BattleResultModal
          isOpen={showResultModal}
          won={battleResult.won}
          xpGained={battleResult.xpGained}
          acornsChange={battleResult.acornsChange}
          opponentData={battleResult.opponentData}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BattlePage;
