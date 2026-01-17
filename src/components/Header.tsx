import React from 'react';
import AuthButton from './AuthButton';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <AuthButton />
    </header>
  );
};

export default Header;
