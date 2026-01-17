import React from 'react';
import styles from './HeroCircle.module.css';

const HeroCircle: React.FC = () => {
  return (
    <div className={styles.circle} role="img" aria-label="Game character">
      <div className={styles.placeholder}>
        <span className={styles.placeholderText}>🐿️</span>
      </div>
    </div>
  );
};

export default HeroCircle;
