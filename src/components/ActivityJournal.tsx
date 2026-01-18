import React from 'react';
import styles from './ActivityJournal.module.css';

interface Activity {
  id: string;
  message: string;
  timestamp: Date;
  courseCode?: string;
  dueDate?: string;
}

interface ActivityJournalProps {
  activities: Activity[];
}

const ActivityJournal: React.FC<ActivityJournalProps> = ({ activities }) => {
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>📔</span>
        <span className={styles.title}>Upcoming</span>
      </div>
      <div className={styles.content}>
        {activities.length === 0 ? (
          <div className={styles.empty}>Nothing upcoming</div>
        ) : (
          <div className={styles.activities}>
            {activities.map((activity) => (
              <div key={activity.id} className={styles.activity}>
                <div className={styles.activityMessage}>{activity.message}</div>
                {activity.courseCode && (
                  <div className={styles.activityCourse}>{activity.courseCode}</div>
                )}
                <div className={styles.activityTime}>
                  {activity.dueDate 
                    ? <><span className={styles.dueLabel}>Due:</span> {activity.dueDate}</> 
                    : `${formatDate(activity.timestamp)} • ${formatTime(activity.timestamp)}`
                  }
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
