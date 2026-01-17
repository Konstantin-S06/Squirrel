import React, { useState } from 'react';
import CourseSelector from '../components/CourseSelector';
import QuestsTable from '../components/QuestsTable';
import Leaderboard from '../components/Leaderboard';
<<<<<<< HEAD:src/pages/CourseQuestsPage.tsx
import AppHeader from '../components/AppHeader';
import styles from './CourseQuestsPage.module.css';
=======
import styles from './CoursesPage.module.css';
>>>>>>> d55640114ba0d96709a3dcfad41f06643b05df4c:src/pages/CoursesPage.tsx

const CoursesPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('CSC110');

  return (
    <div className={styles.container}>
      <AppHeader />
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
