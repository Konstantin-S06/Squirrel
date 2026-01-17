import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AboutPage.module.css';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          ← Back to Home
        </button>
        <h1 className={styles.title}>About Squirrel</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.iconSection}>
            <span className={styles.squirrelIcon}>🐿️</span>
          </div>

          <div className={styles.textSection}>
            <h2 className={styles.subtitle}>What is Squirrel?</h2>
            <p className={styles.paragraph}>
              Squirrel is a gamified academic productivity platform designed specifically for 
              University of Toronto students. We transform the overwhelming challenge of managing 
              coursework into an engaging, motivating experience by breaking down assignments into 
              manageable daily milestones, rewarding consistent progress with XP and achievements, 
              and fostering friendly competition through course-based leaderboards and battles.
            </p>

            <h2 className={styles.subtitle}>Why We Exist</h2>
            <p className={styles.paragraph}>
              University life is demanding. Between multiple courses, overlapping deadlines, and 
              the pressure to excel, students often struggle to maintain consistent study habits 
              and stay motivated throughout the semester. Traditional productivity tools feel like 
              work, not inspiration. Squirrel exists to change that. We believe that learning 
              should feel rewarding, not stressful. By gamifying the academic journey, we help 
              students build sustainable habits, celebrate small wins, and find joy in their 
              progress—turning the daily grind into a game worth playing. Our mission is to make 
              academic success feel achievable, one milestone at a time.
            </p>

            <div className={styles.features}>
              <h2 className={styles.subtitle}>Key Features</h2>
              <ul className={styles.featureList}>
                <li>📝 <strong>Auto-Generated Milestones</strong> - Break assignments into manageable daily tasks</li>
                <li>⚡ <strong>XP & Leveling System</strong> - Earn experience points and level up as you progress</li>
                <li>🔥 <strong>Streak Tracking</strong> - Build daily habits with streak multipliers</li>
                <li>🏆 <strong>Course Leaderboards</strong> - Compete with classmates in your courses</li>
                <li>⚔️ <strong>Battle System</strong> - Challenge friends in auto-resolved battles</li>
                <li>👥 <strong>Social Features</strong> - Connect with study partners and friends</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
