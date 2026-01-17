import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import styles from './FriendsPage.module.css';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  status: 'online' | 'offline';
}

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const [friends] = useState<Friend[]>([
    // Example friends - replace with actual data
    { id: '1', name: 'Friend One', level: 5, status: 'online' },
    { id: '2', name: 'Friend Two', level: 3, status: 'offline' },
    { id: '3', name: 'Friend Three', level: 7, status: 'online' },
  ]);

  const handleAddFriend = () => {
    // Placeholder - does nothing for now
    console.log('Add friend clicked');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <Header />
      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h1 className={styles.title}>Friends</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.friendsList}>
          {friends.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No friends yet. Add some friends to get started!</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className={styles.friendCard}>
                <div className={styles.friendAvatar}>
                  <span className={styles.avatarEmoji}>🐿️</span>
                  <span className={`${styles.statusIndicator} ${styles[friend.status]}`}></span>
                </div>
                <div className={styles.friendInfo}>
                  <div className={styles.friendName}>{friend.name}</div>
                  <div className={styles.friendLevel}>Level {friend.level}</div>
                </div>
                <div className={styles.friendStatus}>
                  {friend.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                </div>
              </div>
            ))
          )}
        </div>

        <button onClick={handleAddFriend} className={styles.addFriendButton}>
          + Add Friend
        </button>
      </main>
    </div>
  );
};

export default FriendsPage;
