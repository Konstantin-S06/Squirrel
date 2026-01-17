import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EditAvatarPage.module.css';

const EditAvatarPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🐿️');
  const [selectedColor, setSelectedColor] = useState<string>('#2d5f3f');

  // Avatar options - can be expanded in the future
  const avatarOptions = [
    '🐿️', '🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐨',
    '🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧'
  ];

  // Color options - can be expanded in the future
  const colorOptions = [
    '#2d5f3f', '#667eea', '#f093fb', '#f5576c',
    '#4facfe', '#43e97b', '#fa709a', '#fee140',
    '#30cfd0', '#330867', '#a8edea', '#fed6e3'
  ];

  const handleSave = () => {
    // TODO: Save avatar settings to backend/localStorage
    localStorage.setItem('selectedAvatar', selectedAvatar);
    localStorage.setItem('selectedColor', selectedColor);
    console.log('Avatar saved:', { avatar: selectedAvatar, color: selectedColor });
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
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
            <div 
              className={styles.avatarPreview}
              style={{ backgroundColor: selectedColor }}
            >
              <span className={styles.previewEmoji}>{selectedAvatar}</span>
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
                key={avatar}
                className={`${styles.avatarOption} ${
                  selectedAvatar === avatar ? styles.selected : ''
                }`}
                onClick={() => setSelectedAvatar(avatar)}
              >
                <span className={styles.avatarEmoji}>{avatar}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className={styles.selectionSection}>
          <h2 className={styles.sectionTitle}>Choose Background Color</h2>
          <div className={styles.colorGrid}>
            {colorOptions.map((color) => (
              <button
                key={color}
                className={`${styles.colorOption} ${
                  selectedColor === color ? styles.selected : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                title={color}
              >
                {selectedColor === color && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditAvatarPage;
