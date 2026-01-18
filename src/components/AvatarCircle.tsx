import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import styles from './AvatarCircle.module.css';
import avatar1 from '../assets/avatars/avatar1.png';
import avatar2 from '../assets/avatars/avatar2.png';
import avatar3 from '../assets/avatars/avatar3.png';
import avatar4 from '../assets/avatars/avatar4.png';

const AvatarCircle: React.FC = () => {
  const [avatarSrc, setAvatarSrc] = useState<string>(avatar1);

  const avatarMap: { [key: string]: string } = {
    'avatar1.png': avatar1,
    'avatar2.png': avatar2,
    'avatar3.png': avatar3,
    'avatar4.png': avatar4
  };

  useEffect(() => {
    const loadAvatar = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const avatarFilename = userData.avatar || 'avatar1.png';
          setAvatarSrc(avatarMap[avatarFilename] || avatar1);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
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
      <img src={avatarSrc} alt="Player avatar" className={styles.avatarImage} />
    </div>
  );
};

export default AvatarCircle;
