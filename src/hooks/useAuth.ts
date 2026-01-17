import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase';

interface AuthContextValue {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): AuthContextValue => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log('User logged in:', currentUser);
      } else {
        console.log('User logged out');
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Authenticated user:', result.user);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { user, login, logout };
};
