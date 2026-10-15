import React, { useState } from 'react';
import { Award, KeyRound, User, Hash, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

interface QuizAccessCodePageProps {
  onNavigate: (view: string) => void;
}

export const QuizAccessCodePage: React.FC<QuizAccessCodePageProps> = ({ onNavigate }) => {
  const { student, verifyCode, error, clearError } = useQuiz();
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!student) {
    return (
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-md">
          <p className="text-slate-700 text-sm mb-4">No student session found. Please enter your student details first.</p>
          <button
            onClick={() => onNavigate('student-login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Go to Student Login
          </button>
        </div>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    const trimmed = accessCode.trim();
    if (!trimmed) {
      setLocalError('Please enter the Quiz Access Code.');
      return;
    }

    setIsLoading(true);
    const res = await verifyCode(trimmed);
    setIsLoading(false);

    if (res.success) {
      // Navigate to instructions page
      onNavigate('instructions');
    } else {
      setLocalError(res.error || 'Invalid code entered.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 mb-3">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            QUIZZORA — Quiz Access Code
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Please verify your identity and enter the event access code.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
          {/* Verified Student Details Confirmation Box */}
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Verified Student Information
            </p>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs text-slate-500 w-24">Full Name:</span>
                <span className="font-semibold text-slate-900 truncate">{student.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs text-slate-500 w-24">Roll Number:</span>
                <span className="font-mono font-bold text-blue-700">{student.rollNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs text-slate-500 w-24">Email ID:</span>
                <span className="text-slate-700 truncate">{student.email}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Access Code Input Form */}
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label htmlFor="accessCode" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Quiz Access Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="accessCode"
                  type="text"
                  required
                  placeholder="Enter code provided by coordinator"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-base sm:text-sm font-mono tracking-wider bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                The common access code announced by your quiz host (e.g. QUIZ2025).
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </div>
                ) : (
                  <>
                    <span>Verify Code & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back button */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => onNavigate('student-login')}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
