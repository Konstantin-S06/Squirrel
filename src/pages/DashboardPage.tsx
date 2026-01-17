import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerStats from '../components/PlayerStats';
import AvatarCircle from '../components/AvatarCircle';
import ActionButton from '../components/ActionButton';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleEdit = () => {
    console.log('Edit clicked');
  };

  const handleBattle = () => {
    navigate('/battle');
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <PlayerStats level="-" currentXP="-" maxXP="-" />
        <AvatarCircle />
        <div className={styles.actions}>
          <ActionButton label="Edit" onClick={handleEdit} variant="primary" />
          <ActionButton label="Battle" onClick={handleBattle} variant="danger" />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
