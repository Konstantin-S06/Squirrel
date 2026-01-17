import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import HeroCircle from '../components/HeroCircle';
import styles from './LandingPage.module.css';
import CanvasSetupButton from "../components/CanvasSetupButton";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <AppHeader />
      <main className={styles.main}>
        <h1 className={styles.title}>Squirrel</h1>
        <HeroCircle />
        <CanvasSetupButton />
        <button onClick={() => navigate('/about')} className={styles.aboutButton}>
          About Squirrel
        </button>
      </main>
    </div>
  );
};

export default LandingPage;
