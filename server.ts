import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { QUIZ_QUESTIONS, getSanitizedQuestions } from './src/data/quizQuestions.ts';
import { QuizAttempt, QuizSettings, AuditLogEntry } from './src/types/quiz.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// In-memory persistent state (synced with storage)
const globalSettings: QuizSettings = {
  quizTitle: 'Quizzora Python & Technology Quiz',
  accessCode: 'QUIZ2025',
  adminPasskey: 'ADMIN2025',
  isOpen: true,
  durationMinutes: 30,
  allowReviewAfterClose: false,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

// Attempts keyed by attemptId
const attemptsStore = new Map<string, QuizAttempt>();
// Student roll to active or submitted attempt ID
const studentAttemptMap = new Map<string, string>();
// Registered students directory
const studentDirectory = new Map<string, { name: string; rollNumber: string; email: string; createdAt: string }>();
// Audit logs
const auditLogs: AuditLogEntry[] = [
  {
    id: 'log-init-1',
    action: 'SYSTEM_BOOT',
    details: 'Quizzora Competition Server initialized with default access code QUIZ2025',
    performedBy: 'system',
    timestamp: new Date().toISOString()
  }
];

// Rate limiting for access code attempts
const accessCodeRateLimits = new Map<string, { count: number; resetAt: number }>();

export interface AdminMemberRecord {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  addedAt: string;
}

// Exactly 10 Authorized Admin Members
const adminMembersList: AdminMemberRecord[] = [
  {
    id: 'admin-1',
    email: 'ayapatisravankumar13@gmail.com',
    name: 'Sravan Kumar (Lead Organizer)',
    role: 'super_admin',
    addedAt: new Date().toISOString()
  },
  {
    id: 'admin-2',
    email: 'coordinator1@quizzora.edu',
    name: 'Quiz Coordinator 1',
    role: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: 'admin-3',
    email: 'coordinator2@quizzora.edu',
    name: 'Quiz Coordinator 2',
    role: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: 'admin-4',
    email: 'evaluator1@quizzora.edu',
    name: 'Technical Evaluator 1',
    role: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: 'admin-5',
    email: 'evaluator2@quizzora.edu',
    name: 'Technical Evaluator 2',
    role: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: 'admin-6',
    email: 'faculty1@quizzora.edu',
    name: 'Faculty Incharge 1',
    role: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: 'admin-7',
    email: 'faculty2@quizzora.edu',
    name: 'Faculty Incharge 2',
    role: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: 'admin-8',
    email: 'proctor1@quizzora.edu',
    name: 'Exam Proctor 1',
    role: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: 'admin-9',
    email: 'proctor2@quizzora.edu',
    name: 'Exam Proctor 2',
    role: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: 'admin-10',
    email: 'committee@quizzora.edu',
    name: 'Competition Committee',
    role: 'admin',
    addedAt: new Date().toISOString()
  }
];

function isEmailAuthorizedAdmin(email?: string): boolean {
  if (!email) return false;
  const norm = normalizeEmail(email);
  return adminMembersList.some(m => normalizeEmail(m.email) === norm);
}

function normalizeRoll(roll: string): string {
  return roll.trim().toUpperCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeName(name: string): string {
  return name.trim();
}

function logAudit(action: string, details: string, performedBy: string) {
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    details,
    performedBy,
    timestamp: new Date().toISOString()
  };
  auditLogs.unshift(entry);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }
}

// Evaluate score on server
function gradeAttempt(answers: Record<number, 'A' | 'B' | 'C' | 'D'>) {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  for (const q of QUIZ_QUESTIONS) {
    const studentAns = answers[q.id];
    if (!studentAns) {
      unansweredCount++;
    } else if (studentAns === q.correctAnswer) {
      score += 1;
      correctCount++;
    } else {
      incorrectCount++;
    }
  }

  const percentage = Number(((score / QUIZ_QUESTIONS.length) * 100).toFixed(1));
  return { score, percentage, correctCount, incorrectCount, unansweredCount };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // Public Quiz Info
  // -------------------------------------------------------------
  app.get('/api/quiz/info', (_req: Request, res: Response) => {
    res.json({
      title: globalSettings.quizTitle,
      isOpen: globalSettings.isOpen,
      durationMinutes: globalSettings.durationMinutes,
      totalQuestions: QUIZ_QUESTIONS.length,
      maxMarks: QUIZ_QUESTIONS.length,
      allowReviewAfterClose: globalSettings.allowReviewAfterClose
    });
  });

  // -------------------------------------------------------------
  // Student Login & Validation (Exact 3 fields)
  // -------------------------------------------------------------
  app.post('/api/student/validate', (req: Request, res: Response): any => {
    const { name, rollNumber, email } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Please enter your Full Name.' });
    }
    if (!rollNumber || typeof rollNumber !== 'string' || !rollNumber.trim()) {
      return res.status(400).json({ error: 'Please enter your College Roll Number.' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your Email ID.' });
    }

    const cleanEmail = normalizeEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address format.' });
    }

    const cleanRoll = normalizeRoll(rollNumber);
    const cleanName = normalizeName(name);

    if (cleanRoll.length < 2 || cleanRoll.length > 50) {
      return res.status(400).json({ error: 'Roll number must be between 2 and 50 characters.' });
    }

    // Check if student directory has this roll number
    const existingStudent = studentDirectory.get(cleanRoll);
    if (existingStudent) {
      // Validate that email and name are consistent
      if (existingStudent.email !== cleanEmail) {
        return res.status(403).json({
          error: `Roll Number ${cleanRoll} is already registered with email ending in ...${existingStudent.email.slice(-10)}. If this is your roll number, please use your original email.`
        });
      }
    } else {
      studentDirectory.set(cleanRoll, {
        name: cleanName,
        rollNumber: cleanRoll,
        email: cleanEmail,
        createdAt: new Date().toISOString()
      });
    }

    // Check existing attempt
    const existingAttemptId = studentAttemptMap.get(cleanRoll);
    if (existingAttemptId) {
      const attempt = attemptsStore.get(existingAttemptId);
      if (attempt) {
        if (attempt.status === 'submitted') {
          return res.json({
            eligible: false,
            alreadySubmitted: true,
            message: 'You have already completed and submitted this quiz. Each student is allowed only one finalized attempt.',
            attemptId: attempt.attemptId,
            submissionReceipt: attempt.submissionReceipt,
            score: attempt.score,
            percentage: attempt.percentage
          });
        }

        // Active ongoing attempt: check if deadline expired
        const now = Date.now();
        if (now > attempt.deadline) {
          // Finalize expired attempt automatically
          const grade = gradeAttempt(attempt.answers);
          attempt.status = 'submitted';
          attempt.score = grade.score;
          attempt.percentage = grade.percentage;
          attempt.correctCount = grade.correctCount;
          attempt.incorrectCount = grade.incorrectCount;
          attempt.unansweredCount = grade.unansweredCount;
          attempt.timeTakenSeconds = Math.round((attempt.deadline - attempt.startTime) / 1000);
          attempt.submittedAt = attempt.deadline;
          attempt.submissionReceipt = attempt.submissionReceipt || `QZ-${cleanRoll}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          attempt.isAutoSubmitted = true;

          return res.json({
            eligible: false,
            alreadySubmitted: true,
            message: 'Your quiz duration has expired and your answers have been automatically submitted.',
            attemptId: attempt.attemptId,
            submissionReceipt: attempt.submissionReceipt,
            score: attempt.score,
            percentage: attempt.percentage
          });
        }

        // Still in progress
        return res.json({
          eligible: true,
          student: { name: cleanName, rollNumber: cleanRoll, email: cleanEmail },
          hasActiveAttempt: true,
          attemptId: attempt.attemptId
        });
      }
    }

    if (!globalSettings.isOpen) {
      return res.status(403).json({
        error: 'The quiz competition is currently closed by the administrator. Please contact your coordinator.'
      });
    }

    return res.json({
      eligible: true,
      student: { name: cleanName, rollNumber: cleanRoll, email: cleanEmail },
      hasActiveAttempt: false
    });
  });

  // -------------------------------------------------------------
  // Verify Quiz Access Code
  // -------------------------------------------------------------
  app.post('/api/quiz/verify-code', (req: Request, res: Response): any => {
    const { rollNumber, accessCode } = req.body;

    if (!rollNumber || !accessCode) {
      return res.status(400).json({ error: 'Roll number and access code are required.' });
    }

    const cleanRoll = normalizeRoll(rollNumber);

    // Rate limiting check
    const now = Date.now();
    const rateLimit = accessCodeRateLimits.get(cleanRoll);
    if (rateLimit && rateLimit.resetAt > now) {
      if (rateLimit.count >= 5) {
        const waitSec = Math.ceil((rateLimit.resetAt - now) / 1000);
        return res.status(429).json({
          error: `Too many incorrect access code attempts. Please wait ${waitSec} seconds before trying again.`
        });
      }
    }

    if (!globalSettings.isOpen) {
      return res.status(403).json({ error: 'The quiz competition is currently closed.' });
    }

    const inputCode = String(accessCode).trim();
    if (inputCode.toUpperCase() !== globalSettings.accessCode.trim().toUpperCase()) {
      // Record rate limit failure
      const current = accessCodeRateLimits.get(cleanRoll) || { count: 0, resetAt: now + 5 * 60 * 1000 };
      current.count += 1;
      accessCodeRateLimits.set(cleanRoll, current);

      return res.status(401).json({
        error: 'Invalid Quiz Access Code. Please enter the valid code provided by your event organizer.'
      });
    }

    // Reset rate limit on success
    accessCodeRateLimits.delete(cleanRoll);

    return res.json({
      success: true,
      quiz: {
        title: globalSettings.quizTitle,
        durationMinutes: globalSettings.durationMinutes,
        totalQuestions: QUIZ_QUESTIONS.length
      }
    });
  });

  // -------------------------------------------------------------
  // Start or Resume Quiz Attempt
  // -------------------------------------------------------------
  app.post('/api/quiz/start', (req: Request, res: Response): any => {
    const { rollNumber, name, email, accessCode } = req.body;

    if (!rollNumber || !name || !email) {
      return res.status(400).json({ error: 'Missing student parameters.' });
    }

    const cleanRoll = normalizeRoll(rollNumber);
    const cleanEmail = normalizeEmail(email);
    const cleanName = normalizeName(name);

    if (String(accessCode).trim().toUpperCase() !== globalSettings.accessCode.trim().toUpperCase()) {
      return res.status(401).json({ error: 'Valid access code required to initiate quiz.' });
    }

    const existingAttemptId = studentAttemptMap.get(cleanRoll);
    if (existingAttemptId) {
      const attempt = attemptsStore.get(existingAttemptId);
      if (attempt) {
        if (attempt.status === 'submitted') {
          return res.status(400).json({
            error: 'Quiz has already been submitted.',
            submissionReceipt: attempt.submissionReceipt
          });
        }

        const now = Date.now();
        if (now > attempt.deadline) {
          // Auto finalize expired attempt
          const grade = gradeAttempt(attempt.answers);
          attempt.status = 'submitted';
          attempt.score = grade.score;
          attempt.percentage = grade.percentage;
          attempt.correctCount = grade.correctCount;
          attempt.incorrectCount = grade.incorrectCount;
          attempt.unansweredCount = grade.unansweredCount;
          attempt.timeTakenSeconds = Math.round((attempt.deadline - attempt.startTime) / 1000);
          attempt.submittedAt = attempt.deadline;
          attempt.submissionReceipt = attempt.submissionReceipt || `QZ-${cleanRoll}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          attempt.isAutoSubmitted = true;

          return res.json({
            status: 'submitted',
            result: attempt
          });
        }

        // Resume active attempt
        const remainingSeconds = Math.max(0, Math.round((attempt.deadline - now) / 1000));
        return res.json({
          status: 'resumed',
          attemptId: attempt.attemptId,
          startTime: attempt.startTime,
          deadline: attempt.deadline,
          remainingSeconds,
          durationSeconds: attempt.durationSeconds,
          questions: getSanitizedQuestions(),
          savedAnswers: attempt.answers
        });
      }
    }

    if (!globalSettings.isOpen) {
      return res.status(403).json({ error: 'Quiz is currently closed.' });
    }

    // Create fresh attempt
    const now = Date.now();
    const durationSeconds = globalSettings.durationMinutes * 60;
    const deadline = now + durationSeconds * 1000;
    const attemptId = `att-${cleanRoll}-${now.toString(36)}`;

    const newAttempt: QuizAttempt = {
      attemptId,
      studentRoll: cleanRoll,
      studentName: cleanName,
      studentEmail: cleanEmail,
      startTime: now,
      deadline,
      durationSeconds,
      status: 'in_progress',
      answers: {}
    };

    attemptsStore.set(attemptId, newAttempt);
    studentAttemptMap.set(cleanRoll, attemptId);

    return res.json({
      status: 'started',
      attemptId,
      startTime: now,
      deadline,
      remainingSeconds: durationSeconds,
      durationSeconds,
      questions: getSanitizedQuestions(),
      savedAnswers: {}
    });
  });

  // -------------------------------------------------------------
  // Autosave Answers
  // -------------------------------------------------------------
  app.post('/api/quiz/autosave', (req: Request, res: Response): any => {
    const { attemptId, rollNumber, answers } = req.body;

    if (!attemptId || !rollNumber) {
      return res.status(400).json({ error: 'Missing attempt identification.' });
    }

    const attempt = attemptsStore.get(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    if (attempt.studentRoll !== normalizeRoll(rollNumber)) {
      return res.status(403).json({ error: 'Unauthorized attempt access.' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ error: 'Attempt already finalized. Changes not allowed.' });
    }

    const now = Date.now();
    // 15 second network latency grace
    if (now > attempt.deadline + 15000) {
      return res.status(400).json({ error: 'Timer deadline has expired. Autosave closed.' });
    }

    if (answers && typeof answers === 'object') {
      attempt.answers = { ...attempt.answers, ...answers };
    }

    const remainingSeconds = Math.max(0, Math.round((attempt.deadline - now) / 1000));
    return res.json({
      success: true,
      remainingSeconds,
      savedAt: now
    });
  });

  // -------------------------------------------------------------
  // Submit Quiz (Manual or Automatic)
  // -------------------------------------------------------------
  app.post('/api/quiz/submit', (req: Request, res: Response): any => {
    const { attemptId, rollNumber, answers, isAutoSubmit } = req.body;

    if (!attemptId || !rollNumber) {
      return res.status(400).json({ error: 'Attempt ID and Roll number required.' });
    }

    const cleanRoll = normalizeRoll(rollNumber);
    const attempt = attemptsStore.get(attemptId);

    if (!attempt || attempt.studentRoll !== cleanRoll) {
      return res.status(404).json({ error: 'Valid student attempt not found.' });
    }

    if (attempt.status === 'submitted') {
      return res.json({
        success: true,
        alreadySubmitted: true,
        result: attempt
      });
    }

    const now = Date.now();
    if (answers && typeof answers === 'object') {
      attempt.answers = { ...attempt.answers, ...answers };
    }

    const grade = gradeAttempt(attempt.answers);
    const timeTakenSeconds = Math.min(
      attempt.durationSeconds,
      Math.max(1, Math.round((now - attempt.startTime) / 1000))
    );

    const submissionReceipt = `QZ-${cleanRoll}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

    attempt.status = 'submitted';
    attempt.score = grade.score;
    attempt.percentage = grade.percentage;
    attempt.correctCount = grade.correctCount;
    attempt.incorrectCount = grade.incorrectCount;
    attempt.unansweredCount = grade.unansweredCount;
    attempt.timeTakenSeconds = timeTakenSeconds;
    attempt.submittedAt = now;
    attempt.submissionReceipt = submissionReceipt;
    attempt.isAutoSubmitted = Boolean(isAutoSubmit);

    logAudit(
      'QUIZ_SUBMITTED',
      `Student ${attempt.studentName} (${cleanRoll}) submitted with score ${grade.score}/30 (${grade.percentage}%)`,
      cleanRoll
    );

    return res.json({
      success: true,
      result: attempt
    });
  });

  // -------------------------------------------------------------
  // Fetch Student Result (Protected - matches Roll & Receipt)
  // -------------------------------------------------------------
  app.get('/api/student/result', (req: Request, res: Response): any => {
    const { attemptId, rollNumber, receipt } = req.query;

    if (!rollNumber) {
      return res.status(400).json({ error: 'Roll number required.' });
    }

    const cleanRoll = normalizeRoll(String(rollNumber));
    let targetAttempt: QuizAttempt | undefined;

    if (attemptId) {
      const att = attemptsStore.get(String(attemptId));
      if (att && att.studentRoll === cleanRoll) {
        targetAttempt = att;
      }
    }

    if (!targetAttempt) {
      const registeredId = studentAttemptMap.get(cleanRoll);
      if (registeredId) {
        const att = attemptsStore.get(registeredId);
        if (att) targetAttempt = att;
      }
    }

    if (!targetAttempt || targetAttempt.status !== 'submitted') {
      return res.status(404).json({ error: 'Submitted result not found for this student.' });
    }

    // Receipt verification if provided
    if (receipt && targetAttempt.submissionReceipt && targetAttempt.submissionReceipt !== String(receipt)) {
      return res.status(403).json({ error: 'Receipt verification failed.' });
    }

    return res.json({
      success: true,
      result: {
        studentName: targetAttempt.studentName,
        studentRoll: targetAttempt.studentRoll,
        studentEmail: targetAttempt.studentEmail,
        quizTitle: globalSettings.quizTitle,
        totalQuestions: QUIZ_QUESTIONS.length,
        score: targetAttempt.score,
        percentage: targetAttempt.percentage,
        correctCount: targetAttempt.correctCount,
        incorrectCount: targetAttempt.incorrectCount,
        unansweredCount: targetAttempt.unansweredCount,
        timeTakenSeconds: targetAttempt.timeTakenSeconds,
        submittedAt: targetAttempt.submittedAt,
        submissionReceipt: targetAttempt.submissionReceipt,
        isAutoSubmitted: targetAttempt.isAutoSubmitted
      }
    });
  });

  // -------------------------------------------------------------
  // Admin Operations (Protected)
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // Admin Operations (Protected)
  // -------------------------------------------------------------
  function verifyAdminAuth(req: Request): boolean {
    const adminEmail = req.headers['x-admin-email'] as string;
    if (!adminEmail) return false;
    return isEmailAuthorizedAdmin(adminEmail);
  }

  // Admin Check
  app.post('/api/admin/verify', (req: Request, res: Response): any => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ authorized: false });
    }

    const isAuthorized = isEmailAuthorizedAdmin(email);
    const member = adminMembersList.find(m => normalizeEmail(m.email) === normalizeEmail(email));
    return res.json({
      authorized: isAuthorized,
      role: member ? member.role : (isAuthorized ? 'admin' : 'none'),
      member: member || null
    });
  });

  // Coordinator Passkey Login (Reliable on mobile phones & laptops)
  app.post('/api/admin/login-passkey', (req: Request, res: Response): any => {
    const { email, passkey } = req.body;

    if (!email || !passkey) {
      return res.status(400).json({ error: 'Please enter your Admin Email and Security Passkey.' });
    }

    const cleanEmail = normalizeEmail(email);
    const member = adminMembersList.find(m => normalizeEmail(m.email) === cleanEmail);

    if (!member) {
      return res.status(403).json({
        error: `The email "${cleanEmail}" is not in the list of authorized admin committee members. Please contact the lead coordinator.`
      });
    }

    const expectedPasskey = (globalSettings.adminPasskey || 'ADMIN2025').trim();
    if (String(passkey).trim() !== expectedPasskey) {
      return res.status(401).json({
        error: 'Invalid Admin Passkey. Please verify with your competition coordinator.'
      });
    }

    logAudit(
      'ADMIN_LOGIN',
      `Admin member ${member.name} (${cleanEmail}) logged in successfully`,
      cleanEmail
    );

    return res.json({
      success: true,
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role
      }
    });
  });

  // Get All 10 Admin Members
  app.get('/api/admin/members', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied: Admin authorization required.' });
    }
    return res.json({
      members: adminMembersList,
      maxAllowed: 10,
      currentCount: adminMembersList.length
    });
  });

  // Add/Update Admin Member (Max 10)
  app.post('/api/admin/members/add', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied.' });
    }

    const { email, name, role } = req.body;
    const adminEmail = req.headers['x-admin-email'] as string;

    if (!email || !normalizeEmail(email)) {
      return res.status(400).json({ error: 'Valid email required for admin member.' });
    }

    const cleanEmail = normalizeEmail(email);
    const existingIndex = adminMembersList.findIndex(m => normalizeEmail(m.email) === cleanEmail);

    if (existingIndex >= 0) {
      // Update existing
      adminMembersList[existingIndex].name = name ? String(name).trim() : adminMembersList[existingIndex].name;
      adminMembersList[existingIndex].role = role === 'super_admin' ? 'super_admin' : 'admin';
    } else {
      // Add new if under 10
      if (adminMembersList.length >= 10) {
        return res.status(400).json({
          error: 'Maximum of 10 admin members reached. Please remove or update an existing member.'
        });
      }

      adminMembersList.push({
        id: `admin-${Date.now()}`,
        email: cleanEmail,
        name: name ? String(name).trim() : cleanEmail.split('@')[0],
        role: role === 'super_admin' ? 'super_admin' : 'admin',
        addedAt: new Date().toISOString()
      });
    }

    logAudit(
      'ADMIN_MEMBER_MODIFIED',
      `Admin list updated for ${cleanEmail}`,
      adminEmail || 'admin'
    );

    return res.json({ success: true, members: adminMembersList });
  });

  // Remove Admin Member
  app.post('/api/admin/members/remove', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied.' });
    }

    const { email } = req.body;
    const adminEmail = req.headers['x-admin-email'] as string;

    if (!email) {
      return res.status(400).json({ error: 'Email required.' });
    }

    const cleanEmail = normalizeEmail(email);
    if (cleanEmail === 'ayapatisravankumar13@gmail.com') {
      return res.status(400).json({ error: 'Cannot remove the primary competition organizer.' });
    }

    const idx = adminMembersList.findIndex(m => normalizeEmail(m.email) === cleanEmail);
    if (idx >= 0) {
      adminMembersList.splice(idx, 1);
      logAudit(
        'ADMIN_MEMBER_REMOVED',
        `Admin member ${cleanEmail} removed`,
        adminEmail || 'admin'
      );
    }

    return res.json({ success: true, members: adminMembersList });
  });

  // Admin Overview Stats
  app.get('/api/admin/overview', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied: Admin authorization required.' });
    }

    const allAttempts = Array.from(attemptsStore.values());
    const submittedAttempts = allAttempts.filter(a => a.status === 'submitted');
    const inProgressAttempts = allAttempts.filter(a => a.status === 'in_progress');

    let totalScore = 0;
    let highestScore = 0;

    for (const sub of submittedAttempts) {
      const s = sub.score || 0;
      totalScore += s;
      if (s > highestScore) highestScore = s;
    }

    const averageScore = submittedAttempts.length ? Number((totalScore / submittedAttempts.length).toFixed(1)) : 0;

    return res.json({
      totalRegisteredStudents: studentDirectory.size,
      totalAttempts: allAttempts.length,
      submittedCount: submittedAttempts.length,
      inProgressCount: inProgressAttempts.length,
      averageScore,
      highestScore,
      quizStatus: globalSettings.isOpen ? 'Open' : 'Closed',
      accessCode: globalSettings.accessCode,
      durationMinutes: globalSettings.durationMinutes,
      totalAdminMembers: adminMembersList.length
    });
  });

  // Admin All Submissions with Ranking & Sorting
  app.get('/api/admin/submissions', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied: Admin authorization required.' });
    }

    const { search, status, sortBy } = req.query;
    let list = Array.from(attemptsStore.values());

    if (status && status !== 'all') {
      list = list.filter(a => a.status === status);
    }

    if (search && typeof search === 'string') {
      const query = search.toLowerCase();
      list = list.filter(a =>
        a.studentName.toLowerCase().includes(query) ||
        a.studentRoll.toLowerCase().includes(query) ||
        a.studentEmail.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === 'score_desc' || !sortBy) {
      list.sort((a, b) => {
        const scoreDiff = (b.score ?? -1) - (a.score ?? -1);
        if (scoreDiff !== 0) return scoreDiff;
        return (a.timeTakenSeconds ?? 9999) - (b.timeTakenSeconds ?? 9999);
      });
    } else if (sortBy === 'score_asc') {
      list.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    } else if (sortBy === 'roll') {
      list.sort((a, b) => a.studentRoll.localeCompare(b.studentRoll));
    } else if (sortBy === 'time') {
      list.sort((a, b) => (a.timeTakenSeconds ?? 9999) - (b.timeTakenSeconds ?? 9999));
    } else if (sortBy === 'latest') {
      list.sort((a, b) => (b.submittedAt || b.startTime) - (a.submittedAt || a.startTime));
    }

    // Attach ranks to submitted attempts
    let currentRank = 1;
    const rankedList = list.map((item) => {
      if (item.status === 'submitted') {
        return { ...item, rank: currentRank++ };
      }
      return { ...item, rank: null };
    });

    return res.json({
      submissions: rankedList,
      totalCount: rankedList.length
    });
  });

  // Detailed Question-by-Question Breakdown for Admin Review
  app.get('/api/admin/attempt-details/:attemptId', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied.' });
    }

    const { attemptId } = req.params;
    const attempt = attemptsStore.get(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    const breakdown = QUIZ_QUESTIONS.map(q => {
      const selectedAnswer = attempt.answers[q.id];
      const isCorrect = selectedAnswer === q.correctAnswer;
      return {
        id: q.id,
        question: q.question,
        codeSnippet: q.codeSnippet,
        options: q.options,
        selectedAnswer: selectedAnswer || null,
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    return res.json({
      attempt,
      breakdown
    });
  });

  // Admin Settings Get
  app.get('/api/admin/settings', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied.' });
    }
    return res.json(globalSettings);
  });

  // Admin Settings Update
  app.post('/api/admin/settings', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied.' });
    }

    const { quizTitle, accessCode, adminPasskey, isOpen, durationMinutes, allowReviewAfterClose } = req.body;
    const adminEmail = req.headers['x-admin-email'] as string;

    if (quizTitle !== undefined) globalSettings.quizTitle = String(quizTitle).trim();
    if (accessCode !== undefined && String(accessCode).trim()) {
      globalSettings.accessCode = String(accessCode).trim();
    }
    if (adminPasskey !== undefined && String(adminPasskey).trim()) {
      globalSettings.adminPasskey = String(adminPasskey).trim();
    }
    if (isOpen !== undefined) globalSettings.isOpen = Boolean(isOpen);
    if (durationMinutes !== undefined && Number(durationMinutes) > 0) {
      globalSettings.durationMinutes = Number(durationMinutes);
    }
    if (allowReviewAfterClose !== undefined) {
      globalSettings.allowReviewAfterClose = Boolean(allowReviewAfterClose);
    }

    globalSettings.updatedAt = new Date().toISOString();
    globalSettings.updatedBy = adminEmail || 'admin';

    logAudit(
      'SETTINGS_UPDATE',
      `Updated quiz settings: isOpen=${globalSettings.isOpen}, accessCode=${globalSettings.accessCode}, duration=${globalSettings.durationMinutes}m`,
      adminEmail || 'admin'
    );

    return res.json({ success: true, settings: globalSettings });
  });

  // Admin Reset Attempt
  app.post('/api/admin/reset-attempt', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied.' });
    }

    const { rollNumber, reason } = req.body;
    const adminEmail = req.headers['x-admin-email'] as string;

    if (!rollNumber) {
      return res.status(400).json({ error: 'Roll number required.' });
    }

    const cleanRoll = normalizeRoll(rollNumber);
    const attemptId = studentAttemptMap.get(cleanRoll);

    if (attemptId) {
      attemptsStore.delete(attemptId);
      studentAttemptMap.delete(cleanRoll);
    }

    logAudit(
      'RESET_ATTEMPT',
      `Reset attempt for student ${cleanRoll}. Reason: ${reason || 'Technical fault reset by admin'}`,
      adminEmail || 'admin'
    );

    return res.json({ success: true, message: `Attempt for ${cleanRoll} has been reset.` });
  });

  // Admin Audit Logs
  app.get('/api/admin/audit-logs', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied.' });
    }
    return res.json({ logs: auditLogs });
  });

  // Admin Export CSV
  app.get('/api/admin/export-csv', (req: Request, res: Response): any => {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ error: 'Access Denied.' });
    }

    const allAttempts = Array.from(attemptsStore.values()).filter(a => a.status === 'submitted');
    allAttempts.sort((a, b) => (b.score || 0) - (a.score || 0));

    let csv = 'Roll Number,Full Name,Email,Score (out of 30),Percentage (%),Time Taken (s),Submitted At,Receipt ID,Submission Type\n';
    for (const a of allAttempts) {
      const submittedDate = a.submittedAt ? new Date(a.submittedAt).toISOString() : '';
      const row = [
        `"${a.studentRoll}"`,
        `"${a.studentName.replace(/"/g, '""')}"`,
        `"${a.studentEmail}"`,
        a.score ?? 0,
        `${a.percentage ?? 0}%`,
        a.timeTakenSeconds ?? 0,
        `"${submittedDate}"`,
        `"${a.submissionReceipt || ''}"`,
        a.isAutoSubmitted ? 'Auto Expired' : 'Manual Submit'
      ].join(',');
      csv += row + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Quizzora_Results_${Date.now()}.csv"`);
    return res.send(csv);
  });

  // -------------------------------------------------------------
  // Frontend Mounting
  // -------------------------------------------------------------
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QUIZZORA full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
