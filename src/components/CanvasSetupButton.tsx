import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import styles from './CanvasSetupButton.module.css';

const CanvasSetupButton: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    if (!user) {
        return null;
    }

    return (
        <button
            onClick={() => navigate('/canvas-setup')}
            className={styles.button}
        >
            Connect Canvas
        </button>
    );
};

export default CanvasSetupButton;
