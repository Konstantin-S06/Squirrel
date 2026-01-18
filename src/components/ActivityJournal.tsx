import React from 'react';
import { CanvasAssignment } from '../services/canvasConfig';
import styles from './ActivityJournal.module.css';

interface Activity {
  id: string;
  message: string;
  timestamp: Date;
}

interface ActivityJournalProps {
  activities: Activity[];
  assignments?: CanvasAssignment[];
}

const ActivityJournal: React.FC<ActivityJournalProps> = ({ activities, assignments = [] }) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

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
      return `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  // Show assignments if available, otherwise show activities
  const showAssignments = assignments.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>📔</span>
        <span className={styles.title}>Journal</span>
      </div>
      <div className={styles.content}>
        {showAssignments ? (
          <div className={styles.activities}>
            {assignments.map((assignment) => (
              <div key={assignment.id} className={styles.activity}>
                <div className={styles.activityMessage}>{assignment.name}</div>
                <div className={styles.activityTime}>
                  {assignment.due_at ? formatDueDate(assignment.due_at) : 'No due date'}
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className={styles.empty}>No recent activity</div>
        ) : (
          <div className={styles.activities}>
            {activities.map((activity) => (
              <div key={activity.id} className={styles.activity}>
                <div className={styles.activityMessage}>{activity.message}</div>
                <div className={styles.activityTime}>
                  {formatDate(activity.timestamp)} • {formatTime(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityJournal;
