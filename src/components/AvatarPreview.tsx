import React from 'react';
import styles from './AvatarPreview.module.css';

interface AvatarPreviewProps {
  squirrelColor: string;
  gloveColor: string;
  accessories: {
    glasses: boolean;
    hat: boolean;
    scarf: boolean;
    badge: boolean;
  };
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  squirrelColor,
  gloveColor,
  accessories,
}) => {
  // Convert hex color to HSL for hue rotation
  const squirrelHue = hexToHue(squirrelColor);
  const gloveHue = hexToHue(gloveColor);

  return (
    <div className={styles.container}>
      <div className={styles.avatarWrapper}>
        {/* Base Squirrel Image with Color Filters */}
        <div className={styles.imageContainer}>
          {/* Squirrel body color filter */}
          <img
            src="/squirrel-boxing.png"
            alt="Squirrel Avatar"
            className={styles.baseSquirrel}
            onError={(e) => {
              // Fallback to emoji if image not found
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display = 'block';
              }
            }}
            style={{
              filter: `hue-rotate(${squirrelHue}deg) saturate(1.2)`,
            }}
          />
          
          {/* Fallback emoji */}
          <span className={styles.fallbackEmoji} style={{ display: 'none' }}>
            🐿️
          </span>
          
          {/* Gloves color overlay using CSS blend modes */}
          <div
            className={styles.glovesOverlay}
            style={{
              backgroundColor: gloveColor,
            }}
          />
        </div>

        {/* Accessories */}
        {accessories.glasses && (
          <div className={`${styles.accessory} ${styles.glasses}`}>
            <span className={styles.glassesIcon}>🕶️</span>
          </div>
        )}
        {accessories.hat && (
          <div className={`${styles.accessory} ${styles.hat}`}>
            <span className={styles.hatIcon}>🎩</span>
          </div>
        )}
        {accessories.scarf && (
          <div className={`${styles.accessory} ${styles.scarf}`}>
            <span className={styles.scarfIcon}>🧣</span>
          </div>
        )}
        {accessories.badge && (
          <div className={`${styles.accessory} ${styles.badge}`}>
            <span className={styles.badgeIcon}>🏅</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Convert hex color to hue value for CSS hue-rotate filter
function hexToHue(hex: string): number {
  if (!hex.startsWith('#')) return 0;
  
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
  }

  hue = Math.round(hue * 60);
  return hue < 0 ? hue + 360 : hue;
}

export default AvatarPreview;
