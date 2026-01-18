import React, { useState, useEffect } from 'react';
import { useCanvasData } from '../hooks/useCanvasData';
import { CanvasAssignment } from '../services/canvasConfig';
import { awardAssignmentReward } from '../services/battleService';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from './QuestsTable.module.css';

interface QuestsTableProps {
  courseName: string;
  courseId: number | null;
}

interface Quest {
  id: number;
  name: string;
  deadline: string;
  status: 'Complete' | 'Incomplete' | 'Pending';
  reward?: string;
}

const QuestsTable: React.FC<QuestsTableProps> = ({ courseName, courseId }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCourseAssignments, isConnected } = useCanvasData();
  const [rewardedAssignments, setRewardedAssignments] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadAssignments = async () => {
      if (!courseId || !isConnected) {
        setQuests([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const assignments: CanvasAssignment[] = await getCourseAssignments(courseId);
        
        // Check for newly completed assignments and award rewards
        const user = auth.currentUser;
        let claimedAssignments: number[] = [];
        
        if (user) {
          // Get previously rewarded assignments from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const completedAssignments: number[] = userData.completedAssignments || [];
              claimedAssignments = completedAssignments;
              setRewardedAssignments(new Set(completedAssignments));

              for (const assignment of assignments) {
                // Check if assignment is complete
                let isComplete = false;
                if (assignment.submission) {
                  const submission = assignment.submission;
                  if (submission.submitted_at || 
                      submission.workflow_state === 'submitted' || 
                      submission.workflow_state === 'graded') {
                    isComplete = true;
                  }
                }

                // Award reward if completed and not already rewarded
                if (isComplete && !completedAssignments.includes(assignment.id)) {
                  try {
                    await awardAssignmentReward(user.uid, assignment.id);
                    claimedAssignments = [...claimedAssignments, assignment.id];
                    setRewardedAssignments(prev => new Set(prev).add(assignment.id));
                  } catch (error) {
                    // If already rewarded, that's fine - just mark as rewarded locally
                    console.warn(`Assignment ${assignment.id} reward already given or error:`, error);
                    claimedAssignments = [...claimedAssignments, assignment.id];
                    setRewardedAssignments(prev => new Set(prev).add(assignment.id));
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error loading completed assignments:', error);
          }
        }

        // Map Canvas assignments to Quest format
        const mappedQuests: Quest[] = assignments.map((assignment) => {
          // Format due date (YYYY-MM-DD format)
          let deadline = 'No deadline';
          if (assignment.due_at) {
            const dueDate = new Date(assignment.due_at);
            const year = dueDate.getFullYear();
            const month = String(dueDate.getMonth() + 1).padStart(2, '0');
            const day = String(dueDate.getDate()).padStart(2, '0');
            deadline = `${year}-${month}-${day}`;
          }

          // Determine status based on submission
          let status: 'Complete' | 'Incomplete' | 'Pending' = 'Pending';
          if (assignment.submission) {
            const submission = assignment.submission;
            // Check if submitted
            if (submission.submitted_at) {
              status = 'Complete';
            } else if (submission.workflow_state === 'submitted' || submission.workflow_state === 'graded') {
              status = 'Complete';
            } else {
              status = 'Incomplete';
            }
          } else {
            // If no submission data and past due date, mark as incomplete
            if (assignment.due_at) {
              const dueDate = new Date(assignment.due_at);
              const now = new Date();
              if (now > dueDate) {
                status = 'Incomplete';
              } else {
                status = 'Pending';
              }
            } else {
              status = 'Pending';
            }
          }

          // Determine reward display
          // If assignment has been claimed (rewarded), show "Claimed"
          // Otherwise, show the static reward "1 acorn, 10 XP"
          const isClaimed = claimedAssignments.includes(assignment.id);
          const reward = isClaimed ? 'Claimed' : '1 acorn, 10 XP';

          return {
            id: assignment.id,
            name: assignment.name,
            deadline,
            status,
            reward
          };
        });

        // Sort by due date (upcoming first, then no deadline, then past)
        mappedQuests.sort((a, b) => {
          if (a.deadline === 'No deadline' && b.deadline !== 'No deadline') return 1;
          if (b.deadline === 'No deadline' && a.deadline !== 'No deadline') return -1;
          if (a.deadline === 'No deadline' && b.deadline === 'No deadline') return 0;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });

        setQuests(mappedQuests);
      } catch (err) {
        console.error('Error loading assignments:', err);
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [courseId, isConnected]); // Removed getCourseAssignments from deps to avoid infinite loops

  const getStatusClass = (status: Quest['status']) => {
    switch (status) {
      case 'Complete':
        return styles.statusComplete;
      case 'Incomplete':
        return styles.statusIncomplete;
      case 'Pending':
        return styles.statusPending;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{courseName} Quests</h2>
      {loading ? (
        <div className={styles.loading}>Loading assignments...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : !isConnected || !courseId ? (
        <div className={styles.error}>Canvas not connected</div>
      ) : quests.length === 0 ? (
        <div className={styles.empty}>No assignments found for this course.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.headerCell}>Quest</th>
                <th className={styles.headerCell}>Deadline</th>
                <th className={styles.headerCell}>Status</th>
                <th className={styles.headerCell}>Reward</th>
              </tr>
            </thead>
            <tbody>
              {quests.map((quest) => (
                <tr key={quest.id} className={styles.row}>
                  <td className={styles.cell}>{quest.name}</td>
                  <td className={styles.cell}>{quest.deadline}</td>
                  <td className={styles.cell}>
                    <span className={`${styles.status} ${getStatusClass(quest.status)}`}>
                      {quest.status}
                    </span>
                  </td>
                  <td className={styles.cell}>
                    {quest.reward === 'Claimed' ? (
                      <span className={styles.claimed}>{quest.reward}</span>
                    ) : (
                      <span className={styles.reward}>{quest.reward}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuestsTable;
