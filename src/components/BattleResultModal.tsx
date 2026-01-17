import React from 'react';
import styles from './BattleResultModal.module.css';

interface BattleResultModalProps {
  isOpen: boolean;
  won: boolean;
  xpGained: number;
  acornsChange: number;
  opponentData: {
    name: string;
    level: number;
    xp: number;
    avatarUrl: string;
  };
  onClose: () => void;
}

const BattleResultModal: React.FC<BattleResultModalProps> = ({
  isOpen,
  won,
  xpGained,
  acornsChange,
  opponentData,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Result Header */}
        <div className={won ? styles.headerWin : styles.headerLose}>
          <h1 className={styles.resultTitle}>
            {won ? '🎉 VICTORY! 🎉' : '💔 DEFEAT 💔'}
          </h1>
        </div>

        {/* Rewards Section */}
        <div className={styles.rewardsSection}>
          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>⭐</span>
            <span className={styles.rewardLabel}>XP Gained:</span>
            <span className={styles.rewardValue}>+{xpGained}</span>
          </div>

          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>🌰</span>
            <span className={styles.rewardLabel}>Acorns:</span>
            <span
              className={
                acornsChange >= 0 ? styles.rewardValuePositive : styles.rewardValueNegative
              }
            >
              {acornsChange >= 0 ? '+' : ''}{acornsChange}
            </span>
          </div>
        </div>

        {/* Opponent Info */}
        <div className={styles.opponentSection}>
          <h2 className={styles.sectionTitle}>Opponent</h2>
          <div className={styles.opponentCard}>
            <div className={styles.opponentAvatar}>
              {opponentData.avatarUrl ? (
                <img src={opponentData.avatarUrl} alt={opponentData.name} />
              ) : (
                <div className={styles.defaultAvatar}>🐿️</div>
              )}
            </div>
            <div className={styles.opponentInfo}>
              <div className={styles.opponentName}>{opponentData.name}</div>
              <div className={styles.opponentStats}>
                Level {opponentData.level} • {opponentData.xp} XP
              </div>
            </div>
          </div>
        </div>

        {/* Common Ground Section - TODO */}
        <div className={styles.commonGroundSection}>
          <h2 className={styles.sectionTitle}>Common Ground</h2>
          <div className={styles.placeholder}>
            <p>Coming soon...</p>
            <p className={styles.placeholderText}>
              We'll show shared courses and stats here once Canvas integration is complete!
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>
          Back to Battle
        </button>
      </div>
    </div>
  );
};

export default BattleResultModal;
