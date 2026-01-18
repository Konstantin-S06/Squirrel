import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { auth, db } from '../firebase/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { fetchUserData, findRandomOpponent, executeBattle } from '../services/battleService';
import { getShieldTimeRemaining } from '../utils/battleUtils';
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

interface BattleLogEntry {
  id: string;
  opponentName: string;
  opponentAvatarUrl?: string;
  role: 'attacker' | 'defender';
  won: boolean;
  xpGained: number;
  acornsChange: number;
  timestamp: Date;
}

const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const [shieldTime, setShieldTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<BattleResultData | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState<boolean>(false);

  // Load shield timer from Firestore
  useEffect(() => {
    const loadTimers = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userData = await fetchUserData(user.uid);
      if (!userData) return;

      const shieldRemaining = getShieldTimeRemaining(userData.shieldEndTime);
      setShieldTime(shieldRemaining);
    };

    loadTimers();

    // Update shield timer every second
    const interval = setInterval(() => {
      setShieldTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadBattleLog();
  }, []);

  const loadBattleLog = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('loadBattleLog: No user found');
      return;
    }

    setLoadingLog(true);
    try {
      const battlesRef = collection(db, 'battles');
      
      console.log('loadBattleLog: Querying battles for user:', user.uid);
      
      const attackerQuery = query(
        battlesRef,
        where('attackerId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );

      const defenderQuery = query(
        battlesRef,
        where('defenderId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );

      let attackerSnapshot, defenderSnapshot;
      
      try {
        attackerSnapshot = await getDocs(attackerQuery);
        console.log('loadBattleLog: Attacker battles found:', attackerSnapshot.docs.length);
      } catch (attackerError: any) {
        console.error('loadBattleLog: Error querying attacker battles:', attackerError);
        // If index error, try without orderBy
        if (attackerError?.code === 'failed-precondition') {
          console.log('loadBattleLog: Retrying attacker query without orderBy');
          const attackerQueryNoOrder = query(
            battlesRef,
            where('attackerId', '==', user.uid)
          );
          attackerSnapshot = await getDocs(attackerQueryNoOrder);
          console.log('loadBattleLog: Attacker battles found (no orderBy):', attackerSnapshot.docs.length);
        } else {
          attackerSnapshot = { docs: [] };
        }
      }

      try {
        defenderSnapshot = await getDocs(defenderQuery);
        console.log('loadBattleLog: Defender battles found:', defenderSnapshot.docs.length);
      } catch (defenderError: any) {
        console.error('loadBattleLog: Error querying defender battles:', defenderError);
        // If index error, try without orderBy
        if (defenderError?.code === 'failed-precondition') {
          console.log('loadBattleLog: Retrying defender query without orderBy');
          const defenderQueryNoOrder = query(
            battlesRef,
            where('defenderId', '==', user.uid)
          );
          defenderSnapshot = await getDocs(defenderQueryNoOrder);
          console.log('loadBattleLog: Defender battles found (no orderBy):', defenderSnapshot.docs.length);
        } else {
          defenderSnapshot = { docs: [] };
        }
      }

      const battles: BattleLogEntry[] = [];

      attackerSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log('loadBattleLog: Processing attacker battle:', doc.id, data);
        const timestamp = data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate() 
          : new Date(data.timestamp?.seconds * 1000 || Date.now());
        
        battles.push({
          id: doc.id,
          opponentName: data.defenderStats?.nameAtBattle || 'Unknown',
          opponentAvatarUrl: data.defenderStats?.avatarUrl,
          role: 'attacker',
          won: data.winnerId === user.uid,
          xpGained: data.attackerStats?.xpGained || 0,
          acornsChange: data.attackerStats?.acornsChange || 0,
          timestamp,
        });
      });

      defenderSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log('loadBattleLog: Processing defender battle:', doc.id, data);
        const timestamp = data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate() 
          : new Date(data.timestamp?.seconds * 1000 || Date.now());
        
        battles.push({
          id: doc.id,
          opponentName: data.attackerStats?.nameAtBattle || 'Unknown',
          opponentAvatarUrl: data.attackerStats?.avatarUrl,
          role: 'defender',
          won: data.winnerId === user.uid,
          xpGained: data.defenderStats?.xpGained || 0,
          acornsChange: data.defenderStats?.acornsChange || 0,
          timestamp,
        });
      });

      battles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      console.log('loadBattleLog: Total battles processed:', battles.length);
      setBattleLog(battles);
    } catch (err) {
      console.error('Error loading battle log:', err);
    } finally {
      setLoadingLog(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBattleDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

      // Show results modal
      setShowResultModal(true);
      setIsLoading(false);
      // Reload battle log after battle
      loadBattleLog();
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

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <Header />
      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h1 className={styles.title}>Battle</h1>
      </header>

      <main className={styles.main}>
        {/* Shield Status Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Active Shield</h2>
          <div className={styles.shieldTimer}>
            <div className={styles.timerValue}>
              {shieldTime > 0 ? formatTime(shieldTime) : '00:00:00'}
            </div>
          </div>
        </div>

        {/* Battle Action Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Start Battle</h2>
          <button
            className={styles.battleRandomButton}
            onClick={handleBattleRandom}
            disabled={isLoading}
          >
            {isLoading ? 'Battling...' : 'Battle Random'}
          </button>
        </div>

        {/* Battle Log Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Battle Log</h2>
          {loadingLog ? (
            <div className={styles.battleLogLoading}>Loading...</div>
          ) : battleLog.length === 0 ? (
            <div className={styles.battleLogEmpty}>No battles yet</div>
          ) : (
            <div className={styles.battleLogList}>
              {battleLog.map((battle) => (
                <div key={battle.id} className={styles.battleLogEntry}>
                  <div className={styles.battleLogHeader}>
                    <div className={styles.battleLogOpponent}>
                      {battle.opponentAvatarUrl ? (
                        <img 
                          src={battle.opponentAvatarUrl} 
                          alt={battle.opponentName}
                          className={styles.battleLogAvatar}
                        />
                      ) : (
                        <span className={styles.battleLogAvatarEmoji}>🐿️</span>
                      )}
                      <span className={styles.battleLogOpponentName}>{battle.opponentName}</span>
                    </div>
                    <span className={`${styles.battleLogResult} ${battle.won ? styles.win : styles.loss}`}>
                      {battle.won ? 'Win' : 'Loss'}
                    </span>
                  </div>
                  <div className={styles.battleLogDetails}>
                    <span className={styles.battleLogRole}>{battle.role === 'attacker' ? '⚔️ Attacker' : '🛡️ Defender'}</span>
                    <span className={styles.battleLogXP}>+{battle.xpGained} XP</span>
                    <span className={`${styles.battleLogAcorns} ${battle.acornsChange >= 0 ? styles.acornsGain : styles.acornsLoss}`}>
                      {battle.acornsChange >= 0 ? '+' : ''}{battle.acornsChange} acorns
                    </span>
                  </div>
                  <div className={styles.battleLogTimestamp}>{formatBattleDate(battle.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        {error && <div className={styles.errorMessage}>{error}</div>}
      </main>

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
