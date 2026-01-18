import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { AvatarParts, DEFAULT_AVATAR } from '../types/avatar';
import PixelAvatar from './PixelAvatar';
import styles from './AvatarCircle.module.css';

const AvatarCircle: React.FC = () => {
  const [avatarParts, setAvatarParts] = useState<AvatarParts>(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvatar = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Load custom avatar parts if they exist, otherwise use default
          if (userData.avatarParts) {
            setAvatarParts(userData.avatarParts);
          }
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();

    const unsubscribe = auth.onAuthStateChanged(() => {
      loadAvatar();
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.circle} role="img" aria-label="Player avatar">
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <PixelAvatar parts={avatarParts} size={200} />
      )}
    </div>
  );
};

export default AvatarCircle;
