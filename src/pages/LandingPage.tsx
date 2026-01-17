import React from 'react';
import Header from '../components/Header';
import HeroCircle from '../components/HeroCircle';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Squirrel</h1>
        <HeroCircle />
      </main>
    </div>
  );
};

export default LandingPage;
