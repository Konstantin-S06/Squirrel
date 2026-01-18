import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { fetchCanvasCourses, CanvasCourse } from '../services/canvasConfig';

export const syncUserCourses = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error('User document does not exist');
      return;
    }

    const userData = userSnap.data();
    const canvasApiKey = userData.canvasApiKey;

    if (!canvasApiKey || canvasApiKey === '') {
      console.log('Canvas API key not set, skipping course sync');
      await updateDoc(userRef, {
        courses: []
      });
      return;
    }

    const canvasCourses = await fetchCanvasCourses(canvasApiKey);

    const filteredCourses = canvasCourses.filter(
      (course: CanvasCourse) =>
        course.enrollment_term_id === 357 || course.enrollment_term_id === 358
    );

    const courseCodes = filteredCourses
      .map((course: CanvasCourse) => course.course_code)
      .filter((code): code is string => !!code);

    const uniqueCourseCodes = Array.from(new Set(courseCodes));

    await updateDoc(userRef, {
      courses: uniqueCourseCodes
    });

    console.log('User courses synced successfully:', uniqueCourseCodes);
  } catch (error) {
    console.error('Error syncing user courses:', error);
  }
};
