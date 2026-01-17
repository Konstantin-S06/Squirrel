import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { isCanvasConnected } from '../services/canvasService';
import styles from './CanvasSetupButton.module.css';

const CanvasSetupButton: React.FC = () => {
    const navigate = useNavigate();
    const [connected, setConnected] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            const user = auth.currentUser;
            if (!user) {
                setConnected(false);
                setLoading(false);
                return;
            }

            try {
                const isConnected = await isCanvasConnected();
                setConnected(isConnected);
            } catch (error) {
                console.error('Error checking Canvas connection:', error);
                setConnected(false);
            } finally {
                setLoading(false);
            }
        };

        checkConnection();

        // Re-check when auth state changes
        const unsubscribe = auth.onAuthStateChanged(() => {
            checkConnection();
        });

        return () => unsubscribe();
    }, []);

    // Don't show button if already connected or still loading
    if (loading || connected) {
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
