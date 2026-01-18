import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { AvatarParts, AVATAR_CATALOG, DEFAULT_AVATAR, RARITY_COLORS } from '../types/avatar';
import PixelAvatar from '../components/PixelAvatar';
import Header from '../components/Header';
import styles from './EditAvatarPage.module.css';

const EditAvatarPage: React.FC = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState<AvatarParts>(DEFAULT_AVATAR);
  const [unlockedItems, setUnlockedItems] = useState<string[]>(['body_default', 'eyes_normal', 'mouth_smile', 'acc_none', 'bg_sky']);
  const [acorns, setAcorns] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('body');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAvatar();
  }, []);

  const loadUserAvatar = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.avatarParts) {
          setParts(data.avatarParts);
        }
        if (data.unlockedAvatarItems) {
          setUnlockedItems(data.unlockedAvatarItems);
        }
        setAcorns(data.acorns || 0);
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseItem = async (itemId: string, cost: number) => {
    if (acorns < cost || unlockedItems.includes(itemId)) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      const newAcorns = acorns - cost;
      const newUnlocked = [...unlockedItems, itemId];

      await updateDoc(doc(db, 'users', user.uid), {
        acorns: newAcorns,
        unlockedAvatarItems: newUnlocked
      });

      setAcorns(newAcorns);
      setUnlockedItems(newUnlocked);

      alert(`✅ Unlocked! You now have ${newAcorns}🌰`);
    } catch (error) {
      console.error('Error purchasing item:', error);
      alert('Error purchasing item. Please try again.');
    }
  };

  const selectPart = (itemId: string, category: string) => {
    setParts(prev => ({ ...prev, [category]: itemId }));
  };

  const saveAvatar = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        avatarParts: parts
      });
      alert('✅ Avatar saved successfully!');
    } catch (error) {
      console.error('Error saving avatar:', error);
      alert('Error saving avatar. Please try again.');
    }
  };

  const handleSave = saveAvatar; // Keep for compatibility

  const categories = [
    { id: 'body', label: '🐿️ Body', emoji: '🐿️' },
    { id: 'eyes', label: '👀 Eyes', emoji: '👀' },
    { id: 'mouth', label: '😊 Mouth', emoji: '😊' },
    { id: 'accessory', label: '🎩 Accessory', emoji: '🎩' }
  ];

  const availableItems = AVATAR_CATALOG.filter(
    item => item.category === selectedCategory && unlockedItems.includes(item.id)
  );

  const shopItems = AVATAR_CATALOG.filter(
    item => item.category === selectedCategory && !unlockedItems.includes(item.id)
  );

  if (loading) {
    return <div className={styles.loading}>Loading avatar editor...</div>;
  }

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.content}>
        <h1 className={styles.title}>🎨 Avatar Builder</h1>
        <p className={styles.acorns}>🌰 {acorns} Acorns</p>

        <div className={styles.preview}>
          <PixelAvatar parts={parts} size={200} />
          <button onClick={saveAvatar} className={styles.saveButton}>
            💾 Save Avatar
          </button>
          <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
            ← Back to Dashboard
          </button>
        </div>

        <div className={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`${styles.categoryButton} ${selectedCategory === cat.id ? styles.active : ''}`}
            >
              {cat.emoji} {cat.id}
            </button>
          ))}
        </div>

        <div className={styles.items}>
          {availableItems.length > 0 && (
            <>
              <h3 className={styles.sectionTitle}>Your Items</h3>
              <div className={styles.grid}>
                {availableItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => selectPart(item.id, item.category)}
                    className={`${styles.itemCard} ${parts[item.category] === item.id ? styles.selected : ''}`}
                    style={{ borderColor: RARITY_COLORS[item.rarity] }}
                  >
                    <div className={styles.itemPreview}>
                      <PixelAvatar
                        parts={{...DEFAULT_AVATAR, [item.category]: item.id}}
                        size={64}
                      />
                    </div>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.rarity} style={{ color: RARITY_COLORS[item.rarity] }}>
                      {item.rarity}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {shopItems.length > 0 && (
            <>
              <h3 className={styles.sectionTitle}>🛒 Shop</h3>
              <div className={styles.grid}>
                {shopItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => purchaseItem(item.id, item.cost)}
                    className={styles.shopCard}
                    disabled={acorns < item.cost}
                    style={{ borderColor: RARITY_COLORS[item.rarity] }}
                  >
                    <div className={styles.itemPreview}>
                      <PixelAvatar
                        parts={{...DEFAULT_AVATAR, [item.category]: item.id}}
                        size={64}
                      />
                    </div>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.rarity} style={{ color: RARITY_COLORS[item.rarity] }}>
                      {item.rarity}
                    </span>
                    <span className={styles.cost}>
                      {acorns >= item.cost ? `🌰 ${item.cost}` : `🔒 ${item.cost}`}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditAvatarPage;
