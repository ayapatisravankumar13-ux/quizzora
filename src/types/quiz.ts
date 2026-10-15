export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  codeSnippet?: string;
  options: QuestionOption[];
}

export interface QuizQuestionWithAnswer extends QuizQuestion {
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface StudentProfile {
  name: string;
  rollNumber: string;
  email: string;
}

export type AttemptStatus = 'in_progress' | 'submitted' | 'expired';

export interface QuizAttempt {
  attemptId: string;
  studentRoll: string;
  studentName: string;
  studentEmail: string;
  startTime: number; // Unix ms
  deadline: number; // Unix ms
  durationSeconds: number;
  status: AttemptStatus;
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  score?: number;
  percentage?: number;
  correctCount?: number;
  incorrectCount?: number;
  unansweredCount?: number;
  timeTakenSeconds?: number;
  submittedAt?: number;
  submissionReceipt?: string;
  isAutoSubmitted?: boolean;
  quizTitle?: string;
  totalQuestions?: number;
}

export interface QuizSettings {
  quizTitle: string;
  accessCode: string;
  isOpen: boolean;
  durationMinutes: number;
  allowReviewAfterClose: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
}
