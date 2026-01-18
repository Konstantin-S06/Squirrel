import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { validateCanvasToken, fetchCanvasCourses } from '../services/canvasConfig';
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

            // Validate Canvas API token
            const trimmedKey = apiKey.trim();
            const isValid = await validateCanvasToken(trimmedKey);
            if (!isValid) {
                setError('Invalid Canvas API token. Please check your token and try again.');
                return;
            }

            // Fetch courses to verify connectivity
            const courses = await fetchCanvasCourses(apiKey);
            console.log(`Successfully connected! Found ${courses.length} courses.`);

            // Save to Firestore with course data
            await setDoc(doc(db, 'users', user.uid), {
                canvasApiKey: apiKey,
                canvasConnected: true,
                canvasCourseCount: courses.length,
                updatedAt: new Date()
            }, { merge: true });

            setSuccess(true);
            setApiKey('');

            // Navigate after short delay to show success message
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            setError('Failed to connect to Canvas. Please check your token and try again.');
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
