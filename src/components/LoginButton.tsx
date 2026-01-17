import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import styles from './LoginButton.module.css';

const LoginButton: React.FC = () => {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Authenticated user:', result.user);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <button
      className={styles.button}
      onClick={handleGoogleLogin}
      aria-label="Login to your account"
    >
      Login
    </button>
  );
};

export default LoginButton;
