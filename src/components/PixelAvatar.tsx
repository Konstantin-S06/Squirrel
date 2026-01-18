import React from 'react';
import { AvatarParts } from '../types/avatar';
import styles from './PixelAvatar.module.css';

interface PixelAvatarProps {
  parts: AvatarParts;
  size?: number;
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({ parts, size = 64 }) => {

  // Render body based on type - designed to look like actual squirrels
  const renderBody = () => {
    switch (parts.body) {
      case 'body_chubby':
        return (
          <>
            {/* Big bushy tail - rendered first so it's behind */}
            <path d="M8,24 Q2,20 1,12 Q0,8 2,5 Q4,3 6,5 Q8,9 10,14 Q12,20 11,26 L12,32 Q11,29 10,26 Q9,24 8,24 Z" fill="#A0522D" />
            {/* Tail fluff overlay */}
            <ellipse cx="5" cy="15" rx="5" ry="8" fill="#CD853F" opacity="0.6" />
            <ellipse cx="6" cy="12" rx="4" ry="6" fill="#D2691E" opacity="0.4" />

            {/* Head */}
            <ellipse cx="20" cy="13" rx="7" ry="6" fill="#8B4513" />
            {/* Ears */}
            <ellipse cx="15" cy="9" rx="2" ry="3" fill="#8B4513" />
            <ellipse cx="25" cy="9" rx="2" ry="3" fill="#8B4513" />
            {/* Body - chubby round */}
            <ellipse cx="20" cy="24" rx="9" ry="11" fill="#8B4513" />
            {/* Belly */}
            <ellipse cx="20" cy="25" rx="6" ry="8" fill="#F4A460" />
            {/* Arms */}
            <ellipse cx="14" cy="22" rx="2" ry="4" fill="#A0522D" />
            <ellipse cx="26" cy="22" rx="2" ry="4" fill="#A0522D" />
            {/* Feet */}
            <ellipse cx="17" cy="33" rx="2" ry="2" fill="#8B4513" />
            <ellipse cx="23" cy="33" rx="2" ry="2" fill="#8B4513" />
          </>
        );
      case 'body_athletic':
        return (
          <>
            {/* Sleek athletic tail */}
            <path d="M10,23 Q5,19 3,12 Q2,8 4,6 Q6,8 8,12 Q10,18 11,24 L12,31 Q11,27 10,23 Z" fill="#A0522D" />
            <path d="M8,20 Q5,16 4,11 Q5,13 7,16 Q8,19 9,22 Z" fill="#CD853F" opacity="0.5" />

            {/* Head */}
            <ellipse cx="20" cy="12" rx="6" ry="5" fill="#8B4513" />
            {/* Pointy ears */}
            <path d="M15,8 L14,5 L16,7 Z" fill="#8B4513" />
            <path d="M25,8 L26,5 L24,7 Z" fill="#8B4513" />
            {/* Athletic lean body */}
            <ellipse cx="20" cy="23" rx="7" ry="10" fill="#8B4513" />
            {/* Belly */}
            <ellipse cx="20" cy="24" rx="5" ry="7" fill="#F4A460" />
            {/* Arms - muscular */}
            <ellipse cx="14" cy="21" rx="2.5" ry="5" fill="#A0522D" />
            <ellipse cx="26" cy="21" rx="2.5" ry="5" fill="#A0522D" />
            {/* Strong legs */}
            <ellipse cx="17" cy="32" rx="2" ry="3" fill="#8B4513" />
            <ellipse cx="23" cy="32" rx="2" ry="3" fill="#8B4513" />
          </>
        );
      case 'body_fluffy':
        return (
          <>
            {/* Massive ultra-bushy tail */}
            <path d="M6,24 Q0,20 -1,10 Q-2,5 0,3 Q3,0 6,3 Q9,7 11,13 Q13,20 12,26 L13,34 Q12,30 11,26 Q9,24 6,24 Z" fill="#CD853F" />
            <path d="M8,22 Q3,18 2,11 Q3,13 5,16 Q7,20 8,24 L10,31 Q9,27 8,22 Z" fill="#A0522D" />
            {/* Extra fluff layers */}
            <ellipse cx="4" cy="16" rx="6" ry="9" fill="#DEB887" opacity="0.5" />
            <ellipse cx="6" cy="13" rx="5" ry="7" fill="#F5DEB3" opacity="0.4" />

            {/* Fluffy head */}
            <ellipse cx="20" cy="12" rx="8" ry="7" fill="#CD853F" />
            <ellipse cx="20" cy="12" rx="7" ry="6" fill="#8B4513" />
            {/* Big fluffy ears */}
            <ellipse cx="14" cy="8" rx="3" ry="4" fill="#CD853F" />
            <ellipse cx="26" cy="8" rx="3" ry="4" fill="#CD853F" />
            {/* Ultra fluffy body */}
            <ellipse cx="20" cy="24" rx="11" ry="12" fill="#CD853F" />
            <ellipse cx="20" cy="24" rx="9" ry="10" fill="#8B4513" />
            {/* Fluffy belly */}
            <ellipse cx="20" cy="25" rx="7" ry="9" fill="#F4A460" />
            {/* Fluffy paws */}
            <ellipse cx="14" cy="23" rx="3" ry="4" fill="#CD853F" />
            <ellipse cx="26" cy="23" rx="3" ry="4" fill="#CD853F" />
          </>
        );
      case 'body_ninja':
        return (
          <>
            {/* Shadow ninja tail */}
            <path d="M10,23 Q6,19 5,12 Q4,8 6,6 Q8,8 9,12 Q11,18 11,24 L12,31 Q11,27 10,23 Z" fill="#0A0A0A" opacity="0.9" />
            <path d="M9,20 Q6,16 5,11 Q6,14 8,17 Z" fill="#1A1A1A" opacity="0.7" />

            {/* Ninja head with mask */}
            <ellipse cx="20" cy="12" rx="6" ry="5" fill="#1A1A1A" />
            {/* Ninja ears */}
            <ellipse cx="15" cy="9" rx="2" ry="3" fill="#1A1A1A" />
            <ellipse cx="25" cy="9" rx="2" ry="3" fill="#1A1A1A" />
            {/* Ninja headband */}
            <rect x="14" y="11" width="12" height="2" fill="#FF0000" />
            {/* Sleek ninja body */}
            <ellipse cx="20" cy="23" rx="7" ry="9" fill="#1A1A1A" />
            {/* Dark belt */}
            <rect x="14" y="20" width="12" height="2" fill="#FF0000" />
            {/* Ninja arms */}
            <ellipse cx="14" cy="21" rx="2" ry="5" fill="#1A1A1A" />
            <ellipse cx="26" cy="21" rx="2" ry="5" fill="#1A1A1A" />
            {/* Ninja feet */}
            <ellipse cx="17" cy="31" rx="2" ry="2" fill="#1A1A1A" />
            <ellipse cx="23" cy="31" rx="2" ry="2" fill="#1A1A1A" />
          </>
        );
      default: // body_default - classic squirrel
        return (
          <>
            {/* Classic bushy tail - curved upward behind squirrel */}
            <path d="M9,24 Q4,20 3,12 Q2,8 4,6 Q6,8 8,11 Q10,16 10,22 L11,30 Q10,27 9,24 Z" fill="#A0522D" />
            {/* Tail highlights for bushiness */}
            <path d="M7,20 Q5,16 4,11 Q5,14 6,17 Q7,19 8,22 Z" fill="#CD853F" opacity="0.6" />
            <ellipse cx="5" cy="14" rx="3" ry="6" fill="#D2691E" opacity="0.4" />

            {/* Head */}
            <ellipse cx="20" cy="13" rx="6" ry="5" fill="#8B4513" />
            {/* Ears */}
            <ellipse cx="16" cy="9" rx="2" ry="3" fill="#8B4513" />
            <ellipse cx="24" cy="9" rx="2" ry="3" fill="#8B4513" />
            {/* Body */}
            <ellipse cx="20" cy="24" rx="8" ry="10" fill="#8B4513" />
            {/* Belly */}
            <ellipse cx="20" cy="25" rx="5" ry="7" fill="#F4A460" />
            {/* Arms */}
            <ellipse cx="15" cy="22" rx="2" ry="4" fill="#A0522D" />
            <ellipse cx="25" cy="22" rx="2" ry="4" fill="#A0522D" />
            {/* Feet */}
            <ellipse cx="17" cy="32" rx="2" ry="2" fill="#8B4513" />
            <ellipse cx="23" cy="32" rx="2" ry="2" fill="#8B4513" />
          </>
        );
    }
  };

  // Render eyes based on type - squirrel-like eyes
  const renderEyes = () => {
    switch (parts.eyes) {
      case 'eyes_happy':
        return (
          <>
            {/* Big happy squirrel eyes */}
            <ellipse cx="17" cy="13" rx="2" ry="2.5" fill="#000" />
            <ellipse cx="23" cy="13" rx="2" ry="2.5" fill="#000" />
            {/* White shine dots */}
            <circle cx="17.5" cy="12.5" r="0.8" fill="#FFF" />
            <circle cx="23.5" cy="12.5" r="0.8" fill="#FFF" />
            {/* Happy curve */}
            <path d="M16,14.5 Q17,15.5 18,14.5" stroke="#000" strokeWidth="0.5" fill="none" />
            <path d="M22,14.5 Q23,15.5 24,14.5" stroke="#000" strokeWidth="0.5" fill="none" />
          </>
        );
      case 'eyes_sparkle':
        return (
          <>
            {/* Large sparkly eyes */}
            <circle cx="17" cy="13" r="2.5" fill="#2F4F4F" />
            <circle cx="23" cy="13" r="2.5" fill="#2F4F4F" />
            <circle cx="17" cy="13" r="1.5" fill="#000" />
            <circle cx="23" cy="13" r="1.5" fill="#000" />
            {/* Big sparkle highlights */}
            <circle cx="17.7" cy="12.3" r="1" fill="#FFF" />
            <circle cx="23.7" cy="12.3" r="1" fill="#FFF" />
            {/* Star sparkles */}
            <path d="M17,10 L17.3,11 L18,11 L17.5,11.5 L17.7,12 L17,11.7 L16.3,12 L16.5,11.5 L16,11 L16.7,11 Z" fill="#FFD700" />
            <path d="M23,10 L23.3,11 L24,11 L23.5,11.5 L23.7,12 L23,11.7 L22.3,12 L22.5,11.5 L22,11 L22.7,11 Z" fill="#FFD700" />
          </>
        );
      case 'eyes_laser':
        return (
          <>
            {/* Intense squirrel laser eyes */}
            <ellipse cx="17" cy="13" rx="2" ry="1.5" fill="#FF0000" />
            <ellipse cx="23" cy="13" rx="2" ry="1.5" fill="#FF0000" />
            <ellipse cx="17" cy="13" rx="1" ry="0.8" fill="#FF6666" />
            <ellipse cx="23" cy="13" rx="1" ry="0.8" fill="#FF6666" />
            {/* Laser beams */}
            <line x1="19" y1="13" x2="35" y2="13" stroke="#FF0000" strokeWidth="1.5" opacity="0.7" />
            <line x1="25" y1="13" x2="35" y2="13" stroke="#FF0000" strokeWidth="1.5" opacity="0.7" />
            <circle cx="19" cy="13" r="0.5" fill="#FFF" />
            <circle cx="25" cy="13" r="0.5" fill="#FFF" />
          </>
        );
      case 'eyes_star':
        return (
          <>
            {/* Star-shaped eyes */}
            <path d="M17,11 L17.5,12 L18.5,12.3 L17.8,13 L18,14 L17,13.5 L16,14 L16.2,13 L15.5,12.3 L16.5,12 Z" fill="#FFD700" />
            <path d="M23,11 L23.5,12 L24.5,12.3 L23.8,13 L24,14 L23,13.5 L22,14 L22.2,13 L21.5,12.3 L22.5,12 Z" fill="#FFD700" />
            {/* Glow effect */}
            <circle cx="17" cy="12.5" r="2.5" fill="#FFD700" opacity="0.3" />
            <circle cx="23" cy="12.5" r="2.5" fill="#FFD700" opacity="0.3" />
          </>
        );
      default: // eyes_normal - realistic squirrel eyes
        return (
          <>
            {/* Big round squirrel eyes */}
            <circle cx="17" cy="13" r="2" fill="#000" />
            <circle cx="23" cy="13" r="2" fill="#000" />
            {/* White highlights for life-like effect */}
            <circle cx="17.5" cy="12.5" r="0.7" fill="#FFF" />
            <circle cx="23.5" cy="12.5" r="0.7" fill="#FFF" />
          </>
        );
    }
  };

  // Render mouth based on type - squirrel snouts and expressions
  const renderMouth = () => {
    switch (parts.mouth) {
      case 'mouth_grin':
        return (
          <>
            {/* Cute squirrel nose */}
            <ellipse cx="20" cy="15" rx="1" ry="0.8" fill="#000" />
            {/* Big happy grin with cheeks */}
            <path d="M16,17 Q20,19 24,17" stroke="#8B4513" strokeWidth="1" fill="none" />
            <ellipse cx="15" cy="16" rx="1.5" ry="1" fill="#FFB6C1" opacity="0.5" />
            <ellipse cx="25" cy="16" rx="1.5" ry="1" fill="#FFB6C1" opacity="0.5" />
            {/* Buck teeth */}
            <rect x="19" y="17" width="1" height="2" fill="#FFF" rx="0.3" />
            <rect x="20" y="17" width="1" height="2" fill="#FFF" rx="0.3" />
          </>
        );
      case 'mouth_tongue':
        return (
          <>
            {/* Squirrel nose */}
            <ellipse cx="20" cy="15" rx="1" ry="0.8" fill="#000" />
            {/* Open mouth */}
            <path d="M17,17 Q20,18.5 23,17" stroke="#8B4513" strokeWidth="1" fill="#8B4513" />
            {/* Tongue sticking out */}
            <ellipse cx="20" cy="18.5" rx="2" ry="1.5" fill="#FF69B4" />
            {/* Small front teeth visible */}
            <rect x="19" y="16.5" width="0.8" height="1" fill="#FFF" rx="0.2" />
            <rect x="20.2" y="16.5" width="0.8" height="1" fill="#FFF" rx="0.2" />
          </>
        );
      case 'mouth_fangs':
        return (
          <>
            {/* Squirrel nose */}
            <ellipse cx="20" cy="15" rx="1" ry="0.8" fill="#000" />
            {/* Fierce mouth */}
            <path d="M17,17 L20,18 L23,17" stroke="#8B4513" strokeWidth="1" fill="none" />
            {/* Sharp fangs */}
            <path d="M18,17 L18,19.5" stroke="#FFF" strokeWidth="1.5" />
            <path d="M22,17 L22,19.5" stroke="#FFF" strokeWidth="1.5" />
            {/* Intimidating look */}
            <path d="M16,16 L17,16.5" stroke="#8B4513" strokeWidth="0.5" />
            <path d="M24,16 L23,16.5" stroke="#8B4513" strokeWidth="0.5" />
          </>
        );
      default: // mouth_smile - classic squirrel face
        return (
          <>
            {/* Cute button nose */}
            <ellipse cx="20" cy="15" rx="1" ry="0.8" fill="#000" />
            {/* Small squirrel smile */}
            <path d="M18,17 Q20,18 22,17" stroke="#8B4513" strokeWidth="0.8" fill="none" />
            {/* Whisker dots (optional detail) */}
            <circle cx="16" cy="15.5" r="0.3" fill="#000" opacity="0.4" />
            <circle cx="24" cy="15.5" r="0.3" fill="#000" opacity="0.4" />
            {/* Tiny front teeth peeking */}
            <rect x="19.5" y="16.5" width="0.5" height="1" fill="#FFF" rx="0.2" />
            <rect x="20" y="16.5" width="0.5" height="1" fill="#FFF" rx="0.2" />
          </>
        );
    }
  };

  // Render accessory based on type - sized for squirrel heads
  const renderAccessory = () => {
    switch (parts.accessory) {
      case 'acc_cap':
        return (
          <>
            {/* Baseball cap bill */}
            <ellipse cx="20" cy="8" rx="7" ry="2" fill="#FF0000" />
            {/* Cap top */}
            <ellipse cx="20" cy="7" rx="6" ry="3" fill="#FF0000" />
            {/* Cap button */}
            <circle cx="20" cy="6" r="0.8" fill="#FFD700" />
            {/* Brim shadow */}
            <ellipse cx="20" cy="8.5" rx="6" ry="0.5" fill="#8B0000" opacity="0.5" />
          </>
        );
      case 'acc_crown':
        return (
          <>
            {/* Royal crown for squirrel king */}
            <path d="M13,7 L15,9 L17,6 L20,9 L23,6 L25,9 L27,7 L27,10 L13,10 Z" fill="#FFD700" />
            {/* Crown jewels */}
            <circle cx="15" cy="8" r="0.8" fill="#FF0000" />
            <circle cx="20" cy="7" r="1" fill="#FF0000" />
            <circle cx="25" cy="8" r="0.8" fill="#FF0000" />
            {/* Crown shine */}
            <path d="M14,8 L16,9" stroke="#FFF" strokeWidth="0.5" opacity="0.7" />
          </>
        );
      case 'acc_wizard':
        return (
          <>
            {/* Wizard hat cone */}
            <path d="M20,3 L15,10 L25,10 Z" fill="#4B0082" />
            {/* Hat brim */}
            <ellipse cx="20" cy="10" rx="7" ry="1.5" fill="#4B0082" />
            {/* Stars on hat */}
            <path d="M20,6 L20.3,6.8 L21,7 L20.5,7.5 L20.6,8 L20,7.7 L19.4,8 L19.5,7.5 L19,7 L19.7,6.8 Z" fill="#FFD700" />
            <circle cx="18" cy="8" r="0.3" fill="#FFD700" />
            <circle cx="22" cy="8" r="0.3" fill="#FFD700" />
            {/* Hat curl at tip */}
            <path d="M20,3 Q22,2 23,4" stroke="#4B0082" strokeWidth="1" fill="none" />
          </>
        );
      case 'acc_halo':
        return (
          <>
            {/* Angel halo floating above squirrel */}
            <ellipse cx="20" cy="4" rx="6" ry="1.5" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.9" />
            {/* Halo glow */}
            <ellipse cx="20" cy="4" rx="7" ry="2" fill="#FFD700" opacity="0.2" />
            {/* Sparkles around halo */}
            <circle cx="14" cy="4" r="0.5" fill="#FFD700" />
            <circle cx="26" cy="4" r="0.5" fill="#FFD700" />
            <circle cx="20" cy="2" r="0.4" fill="#FFF" />
          </>
        );
      case 'acc_headphones':
        return (
          <>
            {/* Headphone band over squirrel head */}
            <path d="M13,10 Q20,6 27,10" stroke="#1A1A1A" strokeWidth="2" fill="none" />
            {/* Left ear cup */}
            <ellipse cx="13" cy="13" rx="2.5" ry="3" fill="#1A1A1A" />
            <ellipse cx="13" cy="13" rx="1.5" ry="2" fill="#4169E1" />
            {/* Right ear cup */}
            <ellipse cx="27" cy="13" rx="2.5" ry="3" fill="#1A1A1A" />
            <ellipse cx="27" cy="13" rx="1.5" ry="2" fill="#4169E1" />
            {/* Headphone details */}
            <rect x="12.5" y="12" width="1" height="2" fill="#00FF00" />
            <rect x="26.5" y="12" width="1" height="2" fill="#00FF00" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={styles.pixelAvatar}
      style={{ imageRendering: 'pixelated' }}
    >

      {/* Body */}
      <g id="body">
        {renderBody()}
      </g>

      {/* Eyes */}
      <g id="eyes">
        {renderEyes()}
      </g>

      {/* Mouth */}
      <g id="mouth">
        {renderMouth()}
      </g>

      {/* Accessory (on top) */}
      <g id="accessory">
        {renderAccessory()}
      </g>
    </svg>
  );
};

export default PixelAvatar;
