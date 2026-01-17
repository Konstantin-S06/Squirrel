import React from 'react';
import styles from './LoginButton.module.css';

const LoginButton: React.FC = () => {
  const handleClick = () => {
    console.log('Login clicked');
  };

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      aria-label="Login to your account"
    >
      Login
    </button>
  );
};

export default LoginButton;
