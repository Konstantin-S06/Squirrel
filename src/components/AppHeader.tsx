import React from 'react';
import AuthButton from './AuthButton';
import styles from './AppHeader.module.css';

const AppHeader: React.FC = () => {
  return (
    <header className={styles.header}>
      <AuthButton />
    </header>
  );
};

export default AppHeader;
