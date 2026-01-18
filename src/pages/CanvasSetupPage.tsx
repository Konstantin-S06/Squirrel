import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../components/Header';
import styles from './CanvasSetupPage.module.css';

const CanvasSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [hasExistingKey, setHasExistingKey] = useState(false);
    const [checkingKey, setCheckingKey] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        if (data.canvasApiKey && data.canvasApiKey.trim() !== '') {
                            setHasExistingKey(true);
                        }
                    }
                } catch (err) {
                    console.error('Error checking API key:', err);
                }
            }
            setCheckingKey(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const user = auth.currentUser;
            if (!user) {
                setError('You must be logged in');
                setLoading(false);
                return;
            }

            await setDoc(doc(db, 'users', user.uid), {
                canvasApiKey: apiKey,
                updatedAt: new Date()
            }, { merge: true });

            setSuccess(true);
            setApiKey('');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            setError('Failed to save Canvas credentials');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (checkingKey) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.loadingContainer}>
                    <p>Checking connection status...</p>
                </div>
            </div>
        );
    }

    if (hasExistingKey) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.connectedContainer}>
                    <div className={styles.successIcon}>✓</div>
                    <h1>Canvas Already Connected</h1>
                    <p className={styles.subtitle}>Your Canvas LMS account is already connected to Squirrel.</p>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className={styles.dashboardButton}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.formContainer}>
                <h1>Connect Canvas LMS</h1>
                <p className={styles.subtitle}>Connect your University of Toronto Canvas account</p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="apiKey">Canvas API Access Token</label>
                        <input
                            id="apiKey"
                            type="password"
                            placeholder="Enter your Canvas API token"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            required
                        />
                        <small>Get your token from Canvas Account → Settings → New Access Token</small>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                    {success && <div className={styles.success}>Canvas credentials saved successfully!</div>}

                    <button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? 'Saving...' : 'Save Canvas Token'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CanvasSetupPage;
