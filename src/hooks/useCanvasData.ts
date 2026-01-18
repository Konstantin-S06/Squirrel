// Hook to use Canvas API with user's stored token
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import {
    CanvasCourse,
    CanvasAssignment,
    fetchCanvasCourses,
    fetchAllAssignments,
    fetchUpcomingAssignments,
} from '../services/canvasConfig';

export const useCanvasData = () => {
    const [apiToken, setApiToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApiToken = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    setError('User not authenticated');
                    setLoading(false);
                    return;
                }

                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setApiToken(data.canvasApiKey || null);
                } else {
                    setError('User document not found');
                }
            } catch (err) {
                console.error('Error fetching Canvas API token:', err);
                setError('Failed to load Canvas credentials');
            } finally {
                setLoading(false);
            }
        };

        fetchApiToken();
    }, []);

    const getCourses = async (): Promise<CanvasCourse[]> => {
        if (!apiToken) {
            throw new Error('Canvas API token not available');
        }
        return fetchCanvasCourses(apiToken);
    };

    const getAssignments = async (): Promise<CanvasAssignment[]> => {
        if (!apiToken) {
            throw new Error('Canvas API token not available');
        }
        return fetchAllAssignments(apiToken);
    };

    const getUpcomingAssignments = async (): Promise<CanvasAssignment[]> => {
        if (!apiToken) {
            throw new Error('Canvas API token not available');
        }
        return fetchUpcomingAssignments(apiToken);
    };

    return {
        apiToken,
        loading,
        error,
        isConnected: !!apiToken,
        getCourses,
        getAssignments,
        getUpcomingAssignments,
    };
};
