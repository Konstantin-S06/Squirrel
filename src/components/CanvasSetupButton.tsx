import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CanvasSetupButton.module.css';

const CanvasSetupButton: React.FC = () => {
    const navigate = useNavigate();

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
