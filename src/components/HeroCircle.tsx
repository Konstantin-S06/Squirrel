import React from 'react';
import styles from './HeroCircle.module.css';
import squirrelImage from '../assets/icons/guy.gif';

const HeroCircle: React.FC = () => {
  return (
    <div className={styles.imageContainer} role="img" aria-label="Game character">
      <img src={squirrelImage} alt="Squirrel character" className={styles.image} />
    </div>
  );
};

export default HeroCircle;
