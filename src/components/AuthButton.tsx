import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import styles from './AuthButton.module.css';

const AuthButton: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log('User logged in:', currentUser);
      } else {
        console.log('User logged out');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Authenticated user:', result.user);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (user) {
    return (
      <div className={styles.container}>
        <span className={styles.username}>{user.displayName}</span>
        <button
          className={styles.button}
          onClick={handleLogout}
          aria-label="Logout from your account"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      className={styles.button}
      onClick={handleLogin}
      aria-label="Login to your account"
    >
      Login
    </button>
  );
};

export default AuthButton;
