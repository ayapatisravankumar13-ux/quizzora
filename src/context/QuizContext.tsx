import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { QuizQuestion, StudentProfile, QuizAttempt } from '../types/quiz';

interface QuizContextType {
  student: StudentProfile | null;
  attemptId: string | null;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  remainingSeconds: number;
  isTimerRunning: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  result: Partial<QuizAttempt> | null;
  error: string | null;
  accessCodeVerified: boolean;
  setCurrentQuestionIndex: (idx: number) => void;
  validateStudent: (name: string, rollNumber: string, email: string) => Promise<{ success: boolean; error?: string; alreadySubmitted?: boolean }>;
  verifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  startQuiz: (code: string) => Promise<{ success: boolean; error?: string }>;
  selectAnswer: (questionId: number, optionKey: 'A' | 'B' | 'C' | 'D') => void;
  clearAnswer: (questionId: number) => void;
  submitQuiz: (isAutoSubmit?: boolean) => Promise<{ success: boolean; error?: string }>;
  fetchStudentResult: (rollNumber: string, receipt?: string) => Promise<void>;
  resetStudentSession: () => void;
  clearError: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const STUDENT_STORAGE_KEY = 'quizzora_student_session';
const ATTEMPT_STORAGE_KEY = 'quizzora_attempt_id';

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem(STUDENT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [attemptId, setAttemptId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(ATTEMPT_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<Partial<QuizAttempt> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessCodeVerified, setAccessCodeVerified] = useState<boolean>(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef(false);
  isSubmittingRef.current = isSubmitting;

  const clearError = () => setError(null);

  const resetStudentSession = () => {
    setStudent(null);
    setAttemptId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRemainingSeconds(1800);
    setIsTimerRunning(false);
    setResult(null);
    setError(null);
    setAccessCodeVerified(false);
    try {
      sessionStorage.removeItem(STUDENT_STORAGE_KEY);
      sessionStorage.removeItem(ATTEMPT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Student Validation (3 fields)
  const validateStudent = async (name: string, rollNumber: string, email: string) => {
    setError(null);
    try {
      const res = await fetch('/api/student/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rollNumber, email })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Validation failed');
        return { success: false, error: data.error };
      }

      if (data.alreadySubmitted) {
        setResult({
          studentName: name,
          studentRoll: rollNumber.toUpperCase(),
          studentEmail: email.toLowerCase(),
          submissionReceipt: data.submissionReceipt,
          score: data.score,
          percentage: data.percentage,
          status: 'submitted'
        });
        return {
          success: false,
          alreadySubmitted: true,
          error: data.message
        };
      }

      const verifiedProfile: StudentProfile = {
        name: data.student.name,
        rollNumber: data.student.rollNumber,
        email: data.student.email
      };

      setStudent(verifiedProfile);
      try {
        sessionStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(verifiedProfile));
      } catch {
        // ignore
      }

      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network failure during validation';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Verify Access Code
  const verifyCode = async (code: string) => {
    if (!student) {
      setError('Please provide student credentials first.');
      return { success: false, error: 'Student profile missing' };
    }

    setError(null);
    try {
      const res = await fetch('/api/quiz/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber: student.rollNumber,
          accessCode: code
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Access code verification failed');
        return { success: false, error: data.error };
      }

      setAccessCodeVerified(true);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to verify code';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Start or resume quiz
  const startQuiz = async (code: string) => {
    if (!student) {
      setError('Student details missing');
      return { success: false, error: 'Student details missing' };
    }

    setError(null);
    try {
      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber: student.rollNumber,
          name: student.name,
          email: student.email,
          accessCode: code
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not start quiz');
        return { success: false, error: data.error };
      }

      if (data.status === 'submitted') {
        setResult(data.result);
        setIsTimerRunning(false);
        return { success: true };
      }

      setAttemptId(data.attemptId);
      setQuestions(data.questions || []);
      setAnswers(data.savedAnswers || {});
      setRemainingSeconds(data.remainingSeconds || 1800);
      setIsTimerRunning(true);

      try {
        sessionStorage.setItem(ATTEMPT_STORAGE_KEY, data.attemptId);
      } catch {
        // ignore
      }

      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to launch quiz';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Submit Quiz
  const submitQuiz = useCallback(async (isAutoSubmit = false) => {
    if (!student || !attemptId || isSubmittingRef.current) {
      return { success: false, error: 'No active attempt' };
    }

    setIsSubmitting(true);
    setIsTimerRunning(false);

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          rollNumber: student.rollNumber,
          answers,
          isAutoSubmit
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setResult(data.result);
      try {
        sessionStorage.removeItem(ATTEMPT_STORAGE_KEY);
      } catch {
        // ignore
      }

      setIsSubmitting(false);
      return { success: true };
    } catch (err) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Error submitting quiz';
      setError(msg);
      return { success: false, error: msg };
    }
  }, [student, attemptId, answers]);

  // Answer selection & autosave trigger
  const selectAnswer = (questionId: number, optionKey: 'A' | 'B' | 'C' | 'D') => {
    const updated = { ...answers, [questionId]: optionKey };
    setAnswers(updated);

    // Debounced autosave
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      if (!student || !attemptId) return;
      setIsSaving(true);
      try {
        await fetch('/api/quiz/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            rollNumber: student.rollNumber,
            answers: updated
          })
        });
      } catch {
        // Autosave error tolerated, will retry on next answer or submit
      } finally {
        setIsSaving(false);
      }
    }, 600);
  };

  const clearAnswer = (questionId: number) => {
    const updated = { ...answers };
    delete updated[questionId];
    setAnswers(updated);

    if (student && attemptId) {
      fetch('/api/quiz/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          rollNumber: student.rollNumber,
          answers: updated
        })
      }).catch(() => {});
    }
  };

  // Timer tick down
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            // Time expired -> trigger auto-submit
            submitQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, remainingSeconds, submitQuiz]);

  // Fetch individual verified student result
  const fetchStudentResult = async (rollNumber: string, receipt?: string) => {
    try {
      const url = new URL('/api/student/result', window.location.origin);
      url.searchParams.set('rollNumber', rollNumber);
      if (receipt) url.searchParams.set('receipt', receipt);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok && data.result) {
        setResult(data.result);
      }
    } catch {
      // ignore
    }
  };

  return (
    <QuizContext.Provider
      value={{
        student,
        attemptId,
        questions,
        currentQuestionIndex,
        answers,
        remainingSeconds,
        isTimerRunning,
        isSaving,
        isSubmitting,
        result,
        error,
        accessCodeVerified,
        setCurrentQuestionIndex,
        validateStudent,
        verifyCode,
        startQuiz,
        selectAnswer,
        clearAnswer,
        submitQuiz,
        fetchStudentResult,
        resetStudentSession,
        clearError
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
