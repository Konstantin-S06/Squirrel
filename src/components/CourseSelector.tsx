import React from 'react';
import styles from './CourseSelector.module.css';

interface CourseSelectorProps {
  selectedCourse: string;
  onCourseChange: (course: string) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ selectedCourse, onCourseChange }) => {
  const courses = ['CSC110', 'MAT137', 'PHY131', 'CHM135', 'BIO120', 'CSC148'];

  return (
    <div className={styles.container}>
      <label htmlFor="course-select" className={styles.label}>
        Select Course
      </label>
      <select
        id="course-select"
        className={styles.select}
        value={selectedCourse}
        onChange={(e) => onCourseChange(e.target.value)}
      >
        {courses.map((course) => (
          <option key={course} value={course}>
            {course}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CourseSelector;
