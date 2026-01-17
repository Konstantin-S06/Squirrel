import React from 'react';
import LoginButton from './LoginButton';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <LoginButton />
    </header>
  );
};

export default Header;
