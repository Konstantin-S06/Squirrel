/**
 * Canvas API Type Definitions
 * 
 * Types for UofT Quercus Canvas API responses
 */

/**
 * Canvas Course
 */
export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  enrollment_term_id?: number;
  start_at?: string | null;
  end_at?: string | null;
  workflow_state?: 'unpublished' | 'available' | 'completed' | 'deleted';
  total_students?: number;
  public_syllabus?: boolean;
}

/**
 * Canvas Assignment
 */
export interface CanvasAssignment {
  id: number;
  name: string;
  description?: string | null;
  due_at: string | null;
  lock_at?: string | null;
  unlock_at?: string | null;
  points_possible: number | null;
  course_id: number;
  submission_types?: string[];
  assignment_group_id?: number;
  grading_type?: 'pass_fail' | 'percent' | 'letter_grade' | 'gpa_scale' | 'points' | 'not_graded';
  workflow_state?: 'published' | 'unpublished' | 'deleted';
}

/**
 * Canvas Submission
 */
export interface CanvasSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string | null;
  score: number | null;
  attempt: number;
  late: boolean;
  workflow_state: 'submitted' | 'unsubmitted' | 'graded' | 'pending_review';
  excused?: boolean;
  missing?: boolean;
}

/**
 * Canvas Submission with Assignment Metadata
 * This is the format returned by the students/submissions endpoint with include[]=assignment
 */
export interface CanvasSubmissionWithAssignment extends CanvasSubmission {
  assignment: CanvasAssignment;
}

/**
 * Processed Course with Toronto times
 */
export interface ProcessedCourse {
  id: number;
  name: string;
  course_code: string;
  start_at: Date | null;
  end_at: Date | null;
  enrollment_term_id?: number;
}

/**
 * Processed Assignment Submission with Toronto times
 */
export interface ProcessedAssignmentSubmission {
  assignment_id: number;
  assignment_name: string;
  due_at: Date | null;
  submitted_at: Date | null;
  score: number | null;
  attempt: number;
  late: boolean;
  workflow_state: string;
  excused?: boolean;
  missing?: boolean;
}
