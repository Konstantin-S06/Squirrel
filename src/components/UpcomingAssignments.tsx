import React from 'react';
import { CanvasAssignment, CanvasCourse } from '../services/canvasConfig';
import styles from './UpcomingAssignments.module.css';

interface UpcomingAssignment extends CanvasAssignment {
  courseName: string;
  courseCode?: string;
}

interface UpcomingAssignmentsProps {
  assignments: UpcomingAssignment[];
  loading?: boolean;
}

const UpcomingAssignments: React.FC<UpcomingAssignmentsProps> = ({ assignments, loading = false }) => {
  const formatDueDate = (dueAt: string): string => {
    const dueDate = new Date(dueAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateOnly = new Date(dueDate);
    dueDateOnly.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((dueDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      return 'Due today';
    } else if (daysDiff === 1) {
      return 'Due tomorrow';
    } else if (daysDiff > 1 && daysDiff <= 7) {
      return `Due in ${daysDiff} days`;
    } else {
      return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Upcoming Assignments</span>
      </div>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.empty}>Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className={styles.empty}>No upcoming assignments</div>
        ) : (
          <div className={styles.assignments}>
            {assignments.map((assignment) => (
              <div key={assignment.id} className={styles.assignment}>
                <div className={styles.assignmentName}>{assignment.name}</div>
                <div className={styles.assignmentDetails}>
                  <span className={styles.courseName}>
                    {assignment.courseCode || assignment.courseName}
                  </span>
                  {assignment.due_at && (
                    <span className={styles.dueDate}>
                      {formatDueDate(assignment.due_at)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAssignments;
