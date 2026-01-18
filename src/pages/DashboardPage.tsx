import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchUserData } from '../services/battleService';
import { useCanvasData } from '../hooks/useCanvasData';
import { CanvasAssignment, CanvasCourse } from '../services/canvasConfig';
import PlayerStats from '../components/PlayerStats';
import AvatarCircle from '../components/AvatarCircle';
import ActionButton from '../components/ActionButton';
import AcornCounter from '../components/AcornCounter';
import UpcomingAssignments from '../components/UpcomingAssignments';
import Header from '../components/Header';
import styles from './DashboardPage.module.css';

interface UpcomingAssignment extends CanvasAssignment {
  courseName: string;
  courseCode?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [acorns, setAcorns] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [currentXP, setCurrentXP] = useState<number>(0);
  const [maxXP, setMaxXP] = useState<number>(100);
  const [upcomingAssignments, setUpcomingAssignments] = useState<UpcomingAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState<boolean>(false);
  const { getCourses, getCourseAssignments, isConnected } = useCanvasData();

  useEffect(() => {
    const loadUserData = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:32',message:'useEffect triggered',data:{isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
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

        // Load upcoming assignments from Canvas courses
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:52',message:'Checking isConnected before assignments fetch',data:{isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (isConnected) {
          setAssignmentsLoading(true);
          try {
            const courses = await getCourses();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:55',message:'Courses fetched',data:{courseCount:courses.length,courseIds:courses.map(c=>c.id),courseNames:courses.map(c=>c.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:57',message:'Today date set for filtering',data:{today:today.toISOString(),todayTimestamp:today.getTime()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
            // #endregion
            
            // Fetch assignments from all courses
            const allAssignmentsPromises = courses.map(course => 
              getCourseAssignments(course.id).catch(err => {
                console.warn(`Error fetching assignments for course ${course.id}:`, err);
                return [];
              })
            );
            
            const allAssignmentsArrays = await Promise.all(allAssignmentsPromises);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:67',message:'All assignments arrays fetched',data:{assignmentArraysCount:allAssignmentsArrays.length,assignmentsPerCourse:allAssignmentsArrays.map(arr=>arr.length),totalAssignments:allAssignmentsArrays.reduce((sum,arr)=>sum+arr.length,0)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            // Flatten and add course information to each assignment
            const assignmentsWithCourse: UpcomingAssignment[] = [];
            allAssignmentsArrays.forEach((assignments, index) => {
              const course = courses[index];
              assignments.forEach(assignment => {
                assignmentsWithCourse.push({
                  ...assignment,
                  courseName: course.name,
                  courseCode: course.course_code
                });
              });
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:81',message:'Assignments with course info flattened',data:{totalAssignments:assignmentsWithCourse.length,assignmentsWithDueDate:assignmentsWithCourse.filter(a=>a.due_at).length,assignmentsWithoutDueDate:assignmentsWithCourse.filter(a=>!a.due_at).length,sampleAssignments:assignmentsWithCourse.slice(0,5).map(a=>({name:a.name,due_at:a.due_at,course:a.courseCode||a.courseName}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            // Filter to only upcoming assignments (due date >= today) and sort by due date
            const upcoming = assignmentsWithCourse
              .filter(assignment => {
                if (!assignment.due_at) {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:85',message:'Assignment filtered out - no due_at',data:{assignmentName:assignment.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                  // #endregion
                  return false;
                }
                const dueDate = new Date(assignment.due_at);
                dueDate.setHours(0, 0, 0, 0);
                const isUpcoming = dueDate >= today;
                if (!isUpcoming) {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:88',message:'Assignment filtered out - past due date',data:{assignmentName:assignment.name,dueDate:dueDate.toISOString(),today:today.toISOString(),daysDiff:Math.floor((dueDate.getTime()-today.getTime())/(1000*60*60*24))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                  // #endregion
                }
                return isUpcoming;
              })
              .sort((a, b) => {
                const dateA = new Date(a.due_at!).getTime();
                const dateB = new Date(b.due_at!).getTime();
                return dateA - dateB;
              });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:95',message:'Filtered upcoming assignments',data:{upcomingCount:upcoming.length,sampleUpcoming:upcoming.slice(0,5).map(a=>({name:a.name,due_at:a.due_at,course:a.courseCode||a.courseName}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            setUpcomingAssignments(upcoming);
          } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:98',message:'Error loading assignments',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            console.error('Error loading Canvas assignments:', error);
            setUpcomingAssignments([]);
          } finally {
            setAssignmentsLoading(false);
          }
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/8eb61584-b0b0-4f36-b4a1-eda3316c4cad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:103',message:'isConnected is false - skipping assignment fetch',data:{isConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
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
        </div>

        {/* Top Right Section: Acorn Counter & Upcoming Assignments */}
        <div className={styles.topRightSection}>
          <AcornCounter acorns={acorns} />
          <UpcomingAssignments assignments={upcomingAssignments} loading={assignmentsLoading} />
        </div>

        <main className={styles.main}>
          <PlayerStats level={level} currentXP={currentXP} maxXP={maxXP} />
          <AvatarCircle />
          <div className={styles.actions}>
            <ActionButton label="Edit" onClick={handleEdit} variant="primary" />
            <ActionButton label="Battle" onClick={handleBattle} variant="danger" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
