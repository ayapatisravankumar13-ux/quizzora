import React, { useState } from 'react';
import { Award, Clock, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Play, ArrowLeft } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

interface QuizInstructionsPageProps {
  onNavigate: (view: string) => void;
}

export const QuizInstructionsPage: React.FC<QuizInstructionsPageProps> = ({ onNavigate }) => {
  const { student, startQuiz, error, clearError } = useQuiz();
  const [isStarting, setIsStarting] = useState(false);
  const [understood, setUnderstood] = useState(false);

  if (!student) {
    onNavigate('student-login');
    return null;
  }

  const handleStart = async () => {
    clearError();
    setIsStarting(true);
    // Common access code verified in previous step; server starts the 30-minute timer
    const res = await startQuiz('QUIZ2025');
    setIsStarting(false);

    if (res.success) {
      onNavigate('active-quiz');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-blue-200">
                  Competition Instructions
                </span>
                <h1 className="text-xl sm:text-2xl font-black">
                  Quizzora Python & Technology Quiz
                </h1>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Candidate bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500">Candidate: </span>
                <span className="font-bold text-slate-800">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Roll No: </span>
                <span className="font-mono font-bold text-blue-700">{student.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">Email: </span>
                <span className="text-slate-700">{student.email}</span>
              </div>
            </div>

            {/* Core Rules Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Questions</p>
                <p className="text-lg font-black text-blue-900">30 MCQs</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Duration</p>
                <p className="text-lg font-black text-purple-900">30 Minutes</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Max Marks</p>
                <p className="text-lg font-black text-emerald-900">30 Marks</p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Neg. Marking</p>
                <p className="text-lg font-black text-indigo-900">None (0)</p>
              </div>
            </div>

            {/* Instruction Points */}
            <div className="space-y-3 text-sm text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Mandatory Guidelines:
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1 mark</strong> will be awarded for each correct answer. No marks are deducted for incorrect or unanswered questions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Strict Single Attempt:</strong> Only one finalized attempt is allowed per student roll number.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Timer Initialization:</strong> The 30-minute timer starts the moment you click the <strong>Start Quiz</strong> button below.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Continuous Autosave:</strong> Your selected answers are automatically saved to the backend database as you click.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Automatic Submission:</strong> When the 30-minute countdown expires, your quiz will automatically finalize and submit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Ensure a stable internet connection. If the page is accidentally refreshed, your in-progress session will automatically resume without resetting the timer.</span>
                </li>
              </ul>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  I have read and understood all the competition instructions. I am ready to begin the 30-minute examination now.
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {/* Start Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('access-code')}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Access Code</span>
              </button>

              <button
                type="button"
                disabled={!understood || isStarting}
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                {isStarting ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Initializing Exam Portal...</span>
                  </div>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
