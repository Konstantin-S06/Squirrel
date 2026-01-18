import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import Header from '../components/Header';
import styles from './EditAvatarPage.module.css';
import avatar1 from '../assets/avatars/avatar1.png';
import avatar2 from '../assets/avatars/avatar2.png';
import avatar3 from '../assets/avatars/avatar3.png';
import avatar4 from '../assets/avatars/avatar4.png';

const EditAvatarPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState<string>('avatar1.png');
  const [loading, setLoading] = useState<boolean>(false);

  const avatarOptions = [
    { filename: 'avatar1.png', src: avatar1 },
    { filename: 'avatar2.png', src: avatar2 },
    { filename: 'avatar3.png', src: avatar3 },
    { filename: 'avatar4.png', src: avatar4 }
  ];

  useEffect(() => {
    const loadCurrentAvatar = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.avatar) {
            setSelectedAvatar(userData.avatar);
          }
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    };

    loadCurrentAvatar();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        avatar: selectedAvatar
      });
    navigate('/dashboard');
    } catch (error) {
      console.error('Error saving avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <Header />
      <header className={styles.header}>
        <button onClick={handleCancel} className={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h1 className={styles.title}>Edit Avatar</h1>
      </header>

      <main className={styles.main}>
        {/* Preview Section */}
        <div className={styles.previewSection}>
          <div className={styles.previewCard}>
            <h2 className={styles.sectionTitle}>Preview</h2>
            <div className={styles.avatarPreview}>
              <img 
                src={avatarOptions.find(a => a.filename === selectedAvatar)?.src} 
                alt="Avatar preview" 
                className={styles.previewImage}
              />
            </div>
            <p className={styles.previewText}>This is how your avatar will look</p>
          </div>
        </div>

        {/* Avatar Selection */}
        <div className={styles.selectionSection}>
          <h2 className={styles.sectionTitle}>Choose Avatar</h2>
          <div className={styles.avatarGrid}>
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.filename}
                className={`${styles.avatarOption} ${
                  selectedAvatar === avatar.filename ? styles.selected : ''
                }`}
                onClick={() => setSelectedAvatar(avatar.filename)}
              >
                <img 
                  src={avatar.src} 
                  alt={avatar.filename} 
                  className={styles.avatarImage}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} className={styles.saveButton} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditAvatarPage;
