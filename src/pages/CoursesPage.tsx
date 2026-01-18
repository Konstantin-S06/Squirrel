import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseSelector from '../components/CourseSelector';
import QuestsTable from '../components/QuestsTable';
import Leaderboard from '../components/Leaderboard';
import Header from '../components/Header';
import { useCanvasData } from '../hooks/useCanvasData';
import { CanvasCourse } from '../services/canvasConfig';
import styles from './CoursesPage.module.css';

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState('CSC110');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [canvasCourses, setCanvasCourses] = useState<CanvasCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCourses, isConnected, error } = useCanvasData();

  useEffect(() => {
    const loadCourses = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      try {
        const courses = await getCourses();
        setCanvasCourses(courses);
        if (courses.length > 0) {
          const firstCourse = courses[0];
          setSelectedCourse(firstCourse.course_code || firstCourse.name);
          setSelectedCourseId(firstCourse.id);
        }
      } catch (err) {
        console.error('Error loading Canvas courses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [isConnected]);

  return (
    <div className={styles.container}>
      <Header />
      {loading ? (
        <div className={styles.loading}>Loading courses...</div>
      ) : error || !isConnected ? (
        <div className={styles.error}>
          <p>Canvas not connected. Please connect your Canvas account to see your courses.</p>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.leftColumn}>
            <CourseSelector
              selectedCourse={selectedCourse}
              onCourseChange={(courseCodeOrName: string) => {
                setSelectedCourse(courseCodeOrName);
                const course = canvasCourses.find(
                  c => c.course_code === courseCodeOrName || c.name === courseCodeOrName
                );
                setSelectedCourseId(course?.id || null);
              }}
              courses={canvasCourses}
            />
            <Leaderboard courseName={selectedCourse} />
          </div>
          <div className={styles.rightColumn}>
            <QuestsTable courseName={selectedCourse} courseId={selectedCourseId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
