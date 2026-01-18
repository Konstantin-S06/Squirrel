import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import Header from '../components/Header';
import HeroCircle from '../components/HeroCircle';
import styles from './LandingPage.module.css';
import CanvasSetupButton from "../components/CanvasSetupButton";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Squirrl</h1>
        <HeroCircle />
        <div className={styles.buttonContainer}>
          <CanvasSetupButton />
          {user && (
            <button onClick={() => navigate('/dashboard')} className={styles.dashboardButton}>
              Dashboard
            </button>
          )}
          <button onClick={() => navigate('/about')} className={styles.aboutButton}>
            About Squirrl
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
