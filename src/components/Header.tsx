import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await createUserIfNotExists(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const createUserIfNotExists = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || 'Anonymous',
          level: 1,
          xp: 0,
          acorns: 50,
          friends: [],
          avatar: user.photoURL || '',
          canvasAPIKey: '',
          shieldEndTime: null,
          lastBattleTime: null,
        });
        console.log('User document created');
      }
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {user && <span className={styles.username}>{user.displayName}</span>}
      </div>
      <div className={styles.right}>
        {user ? (
          <button
            className={styles.button}
            onClick={handleLogout}
            aria-label="Logout from your account"
          >
            Logout
          </button>
        ) : (
          <button
            className={styles.button}
            onClick={handleLogin}
            aria-label="Login to your account"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
