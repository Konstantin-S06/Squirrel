import React from 'react';
import { CanvasCourse } from '../services/canvasConfig';
import styles from './CourseSelector.module.css';

interface CourseSelectorProps {
  selectedCourse: string;
  onCourseChange: (course: string) => void;
  courses?: CanvasCourse[];
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCourse,
  onCourseChange,
  courses
}) => {
  // Fallback to default courses if no Canvas courses provided
  const defaultCourses = ['CSC110', 'MAT137', 'PHY131', 'CHM135', 'BIO120', 'CSC148'];
  const displayCourses = courses && courses.length > 0 ? courses : null;

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
        {displayCourses ? (
          displayCourses.map((course) => (
            <option key={course.id} value={course.course_code || course.name}>
              {course.course_code ? `${course.course_code} - ${course.name}` : course.name}
            </option>
          ))
        ) : (
          defaultCourses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))
        )}
      </select>
    </div>
  );
};

export default CourseSelector;
