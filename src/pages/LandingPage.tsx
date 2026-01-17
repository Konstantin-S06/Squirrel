import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import HeroCircle from '../components/HeroCircle';
import styles from './LandingPage.module.css';
import CanvasSetupButton from "../components/CanvasSetupButton";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <button onClick={() => navigate('/about')} className={styles.aboutButton}>
          About Squirrel
        </button>
        <Header />
      </div>
      <main className={styles.main}>
        <h1 className={styles.title}>Squirrel</h1>
        <HeroCircle />
        <CanvasSetupButton />
      </main>
    </div>
  );
};

export default LandingPage;
