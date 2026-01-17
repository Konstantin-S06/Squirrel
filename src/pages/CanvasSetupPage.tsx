import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import styles from './CanvasSetupPage.module.css';

const CanvasSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const user = auth.currentUser;
            if (!user) {
                setError('You must be logged in');
                return;
            }

            await setDoc(doc(db, 'users', user.uid), {
                canvasApiKey: apiKey,
                updatedAt: new Date()
            }, { merge: true });

            navigate('/dashboard');
            setSuccess(true);
            setApiKey('');
        } catch (err) {
            setError('Failed to save Canvas credentials');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
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
    );
};

export default CanvasSetupPage;
