/**
 * Test Script: Seed Test Users for Battle System
 *
 * Run this script to create test users in Firestore for testing battles.
 * This is a development helper - delete before production.
 *
 * To use:
 * 1. Import this function somewhere (e.g., a test page)
 * 2. Call seedTestUsers() once
 * 3. Check Firestore console to verify users were created
 */

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface TestUser {
  name: string;
  level: number;
  xp: number;
  acorns: number;
  avatarUrl: string;
  access_token: string;
  friends: string[];
  lastBattleTime: null;
  shieldEndTime: null;
}

const testUsers: TestUser[] = [
  {
    name: 'Alice the Squirrel',
    level: 3,
    xp: 250,
    acorns: 75,
    avatarUrl: '',
    access_token: 'test_token_1',
    friends: [],
    lastBattleTime: null,
    shieldEndTime: null,
  },
  {
    name: 'Bob the Brave',
    level: 5,
    xp: 450,
    acorns: 60,
    avatarUrl: '',
    access_token: 'test_token_2',
    friends: [],
    lastBattleTime: null,
    shieldEndTime: null,
  },
  {
    name: 'Carol the Champion',
    level: 7,
    xp: 680,
    acorns: 120,
    avatarUrl: '',
    access_token: 'test_token_3',
    friends: [],
    lastBattleTime: null,
    shieldEndTime: null,
  },
  {
    name: 'David the Defender',
    level: 2,
    xp: 150,
    acorns: 40,
    avatarUrl: '',
    access_token: 'test_token_4',
    friends: [],
    lastBattleTime: null,
    shieldEndTime: null,
  },
  {
    name: 'Eve the Expert',
    level: 10,
    xp: 980,
    acorns: 200,
    avatarUrl: '',
    access_token: 'test_token_5',
    friends: [],
    lastBattleTime: null,
    shieldEndTime: null,
  },
];

export const seedTestUsers = async (): Promise<void> => {
  try {
    console.log('🌰 Seeding test users...');

    for (let i = 0; i < testUsers.length; i++) {
      const userId = `test_user_${i + 1}`;
      const userRef = doc(db, 'users', userId);

      await setDoc(userRef, testUsers[i]);
      console.log(`✅ Created user: ${testUsers[i].name} (${userId})`);
    }

    console.log('🎉 Test users seeded successfully!');
    console.log('You can now test battles with these users.');
  } catch (error) {
    console.error('❌ Error seeding test users:', error);
  }
};

// Uncomment to run directly (for testing)
// seedTestUsers();
