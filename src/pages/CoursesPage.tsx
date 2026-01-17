import React, { useState } from 'react';
import CourseSelector from '../components/CourseSelector';
import QuestsTable from '../components/QuestsTable';
import Leaderboard from '../components/Leaderboard';
import Header from '../components/Header';
import styles from './CoursesPage.module.css';

const CoursesPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('CSC110');

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.layout}>
        <div className={styles.leftColumn}>
          <CourseSelector 
            selectedCourse={selectedCourse} 
            onCourseChange={setSelectedCourse} 
          />
          <Leaderboard courseName={selectedCourse} />
        </div>
        <div className={styles.rightColumn}>
          <QuestsTable courseName={selectedCourse} />
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
