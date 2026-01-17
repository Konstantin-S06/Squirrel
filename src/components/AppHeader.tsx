import React from 'react';
import { useAuth } from '../hooks/useAuth';
import styles from './AppHeader.module.css';

const AppHeader: React.FC = () => {
  const { user, login, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {user && <span className={styles.username}>Welcome, {user.displayName}</span>}
      </div>
      <div className={styles.right}>
        {user ? (
          <button
            className={styles.button}
            onClick={logout}
            aria-label="Logout from your account"
          >
            Logout
          </button>
        ) : (
          <button
            className={styles.button}
            onClick={login}
            aria-label="Login to your account"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

