import React from 'react';
import styles from './ActionButton.module.css';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'danger';
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  const buttonClass = variant === 'danger' ? styles.danger : styles.primary;

  return (
    <button
      className={`${styles.button} ${buttonClass}`}
      onClick={onClick}
      aria-label={label}
    >
      {label}
    </button>
  );
};

export default ActionButton;
