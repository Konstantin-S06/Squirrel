import React from 'react';
import styles from './AcornCounter.module.css';

interface AcornCounterProps {
  acorns: number;
}

const AcornCounter: React.FC<AcornCounterProps> = ({ acorns }) => {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>🌰:</span>
      <span className={styles.value}>{acorns}</span>
    </div>
  );
};

export default AcornCounter;
