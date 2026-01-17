import React from 'react';
import styles from './AvatarCircle.module.css';

const AvatarCircle: React.FC = () => {
  return (
    <div className={styles.circle} role="img" aria-label="Player avatar">
      <div className={styles.placeholder}>
        <span className={styles.placeholderIcon}>🐿️</span>
      </div>
    </div>
  );
};

export default AvatarCircle;
