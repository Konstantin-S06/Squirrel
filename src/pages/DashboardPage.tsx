import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { fetchUserData, awardAssignmentReward } from '../services/battleService';
import { useCanvasData } from '../hooks/useCanvasData';
import { CanvasAssignment, CanvasCourse } from '../services/canvasConfig';
import PlayerStats from '../components/PlayerStats';
import AvatarCircle from '../components/AvatarCircle';
import ActionButton from '../components/ActionButton';
import AcornCounter from '../components/AcornCounter';
import ActivityJournal from '../components/ActivityJournal';
import Timetable from '../components/Timetable';
import Header from '../components/Header';
import styles from './DashboardPage.module.css';

interface Activity {
  id: string;
  message: string;
  timestamp: Date;
  courseCode?: string;
  dueDate?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [acorns, setAcorns] = useState<number>(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [level, setLevel] = useState<number>(1);
  const [currentXP, setCurrentXP] = useState<number>(0);
  const [maxXP, setMaxXP] = useState<number>(100);
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(false);
  const { getCourses, getCourseAssignments, isConnected } = useCanvasData();

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Load user stats from Firebase
        const userData = await fetchUserData(user.uid);
        if (userData) {
          setAcorns(userData.acorns);
          setLevel(userData.level);
          
          // Calculate current XP and max XP based on level
          // Level 1: 0-99 XP, Level 2: 100-199 XP, etc.
          const baseXP = (userData.level - 1) * 100;
          const xpInCurrentLevel = userData.xp - baseXP;
          setCurrentXP(xpInCurrentLevel);
          setMaxXP(100); // 100 XP per level
        }

        // Load incomplete assignments from Canvas
        if (isConnected) {
          await loadIncompleteAssignments(user.uid);
        } else {
          setActivities([{
            id: 'canvas-not-connected',
            message: 'Connect Canvas to see your assignments',
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadUserData();
    });

    return () => unsubscribe();
  }, [isConnected]);

  const loadIncompleteAssignments = async (uid: string) => {
    setLoadingAssignments(true);
    try {
      // Get user's courses from Firestore
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        setActivities([]);
        return;
      }

      const userData = userSnap.data();
      const userCourses: string[] = userData.courses || [];

      if (userCourses.length === 0) {
        setActivities([{
          id: 'no-courses',
          message: 'No courses found. Your courses will sync automatically.',
          timestamp: new Date(),
        }]);
        return;
      }

      // Get all Canvas courses
      const allCanvasCourses: CanvasCourse[] = await getCourses();
      
      // Filter courses to only those in user's courses array
      const enrolledCourses = allCanvasCourses.filter(course =>
        userCourses.includes(course.course_code)
      );

      if (enrolledCourses.length === 0) {
        setActivities([{
          id: 'no-matching-courses',
          message: 'No matching Canvas courses found',
          timestamp: new Date(),
        }]);
        return;
      }

      // Fetch assignments for each course in parallel
      const assignmentPromises = enrolledCourses.map(async (course) => {
        try {
          const assignments = await getCourseAssignments(course.id);
          return assignments.map(assignment => ({
            ...assignment,
            course_code: course.course_code,
            course_name: course.name
          }));
        } catch (error) {
          console.error(`Error fetching assignments for course ${course.course_code}:`, error);
          return [];
        }
      });

      const assignmentArrays = await Promise.all(assignmentPromises);
      const allAssignments = assignmentArrays.flat();

      // Get previously rewarded assignments from Firestore
      const completedAssignments: number[] = userData.completedAssignments || [];

      // Check for newly completed assignments and award rewards
      for (const assignment of allAssignments) {
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
            await awardAssignmentReward(uid, assignment.id);
            // Reload user data to update acorns and XP
            const updatedUserData = await fetchUserData(uid);
            if (updatedUserData) {
              setAcorns(updatedUserData.acorns);
              setLevel(updatedUserData.level);
              const baseXP = (updatedUserData.level - 1) * 100;
              const xpInCurrentLevel = updatedUserData.xp - baseXP;
              setCurrentXP(xpInCurrentLevel);
            }
          } catch (error) {
            // If already rewarded or error, continue
            console.warn(`Assignment ${assignment.id} reward already given or error:`, error);
          }
        }
      }

      // Filter to only incomplete assignments
      const incompleteAssignments = allAssignments.filter(assignment => {
        // Check submission status
        if (assignment.submission) {
          const submission = assignment.submission;
          // If submitted, it's complete
          if (submission.submitted_at || 
              submission.workflow_state === 'submitted' || 
              submission.workflow_state === 'graded') {
            return false;
          }
        }
        return true;
      });

      // Filter out past-due assignments
      const now = new Date();
      const upcomingIncompleteAssignments = incompleteAssignments.filter(assignment => {
        if (!assignment.due_at) {
          return true;
        }
        try {
          const dueDate = new Date(assignment.due_at);
          return dueDate >= now;
        } catch (error) {
          return true;
        }
      });

      // Convert to Activity format and sort by due date
      const assignmentActivities: Activity[] = upcomingIncompleteAssignments
        .map(assignment => {
          let dueDate = 'No deadline';
          let timestamp = new Date();
          
          if (assignment.due_at) {
            const due = new Date(assignment.due_at);
            timestamp = due;
            const year = due.getFullYear();
            const month = String(due.getMonth() + 1).padStart(2, '0');
            const day = String(due.getDate()).padStart(2, '0');
            dueDate = `${year}-${month}-${day}`;
          }

          return {
            id: `assignment-${assignment.id}`,
            message: assignment.name,
            timestamp,
            courseCode: assignment.course_code,
            dueDate
          };
        })
        .sort((a, b) => {
          // Sort by timestamp (soonest first)
          if (a.dueDate === 'No deadline' && b.dueDate !== 'No deadline') return 1;
          if (b.dueDate === 'No deadline' && a.dueDate !== 'No deadline') return -1;
          if (a.dueDate === 'No deadline' && b.dueDate === 'No deadline') return 0;
          return a.timestamp.getTime() - b.timestamp.getTime();
        });

      if (assignmentActivities.length === 0) {
        setActivities([{
          id: 'all-complete',
          message: 'All assignments complete! Great work! 🎉',
          timestamp: new Date(),
        }]);
      } else {
        setActivities(assignmentActivities);
      }
    } catch (error) {
      console.error('Error loading incomplete assignments:', error);
      setActivities([{
        id: 'error',
        message: 'Error loading assignments',
        timestamp: new Date(),
      }]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleEdit = () => {
    navigate('/edit-avatar');
  };

  const handleBattle = () => {
    navigate('/battle');
  };

  const handleFriends = () => {
    navigate('/friends');
  };

  const handleCourses = () => {
    navigate('/courses');
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <Header />
      </div>
      <div className={styles.contentWrapper}>
        {/* Left Section: Friends & Courses */}
        <div className={styles.leftSection}>
          <button onClick={handleFriends} className={styles.friendsButton}>
            👥 Friends
          </button>
          <button onClick={handleCourses} className={styles.coursesButton}>
            📚 Courses
          </button>
          <Timetable />
        </div>

        {/* Top Right Section: Acorn Counter & Journal */}
        <div className={styles.topRightSection}>
          <AcornCounter acorns={acorns} />
          <ActivityJournal activities={activities} />
        </div>

        <main className={styles.main}>
          <PlayerStats level={level} currentXP={currentXP} maxXP={maxXP} />
          <AvatarCircle />
          <div className={styles.actions}>
            <ActionButton label="Edit Avatar" onClick={handleEdit} variant="primary" />
          </div>
        </main>

        {/* Battle Button - Bottom Right */}
        <div className={styles.battleButtonContainer}>
          <ActionButton label="Battle ⚔️" onClick={handleBattle} variant="danger" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
