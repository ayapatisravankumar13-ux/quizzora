import React, { useState } from 'react';
import { User, Mail, Hash, ArrowRight, AlertCircle, Award, CheckCircle2 } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

interface StudentLoginPageProps {
  onNavigate: (view: string) => void;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onNavigate }) => {
  const { validateStudent, error, clearError, result } = useQuiz();

  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localValidationMessage, setLocalValidationMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalValidationMessage(null);

    // Front-end sanity checks
    const trimmedName = fullName.trim();
    const trimmedRoll = rollNumber.trim();
    const trimmedEmail = emailId.trim();

    if (!trimmedName) {
      setLocalValidationMessage('Please enter your Full Name.');
      return;
    }
    if (!trimmedRoll) {
      setLocalValidationMessage('Please enter your College Roll Number.');
      return;
    }
    if (!trimmedEmail) {
      setLocalValidationMessage('Please enter your Email ID.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLocalValidationMessage('Please enter a valid email format (e.g., student@college.edu).');
      return;
    }

    setIsLoading(true);
    const res = await validateStudent(trimmedName, trimmedRoll, trimmedEmail);
    setIsLoading(false);

    if (res.success) {
      // Direct navigation to Quiz Access Code page
      onNavigate('access-code');
    } else if (res.alreadySubmitted) {
      // Student already completed quiz
      setLocalValidationMessage(res.error || 'You have already completed this quiz.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 mb-4">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Quiz Login
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Enter your details below to proceed to the quiz access code verification.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
          {/* Error alerts */}
          {(localValidationMessage || error) && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{localValidationMessage || error}</p>
                {result?.submissionReceipt && (
                  <button
                    type="button"
                    onClick={() => onNavigate('student-result')}
                    className="mt-2 text-xs font-bold text-rose-700 underline flex items-center gap-1 hover:text-rose-900"
                  >
                    View your submitted result receipt ({result.submissionReceipt})
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Field 2: College Roll Number */}
            <div>
              <label htmlFor="rollNumber" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. College Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="rollNumber"
                  type="text"
                  required
                  placeholder="e.g. 21CS042"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 text-sm font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Your unique institutional ID. Only 1 attempt per roll number is permitted.
              </p>
            </div>

            {/* Field 3: Email ID */}
            <div>
              <label htmlFor="emailId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Email ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="emailId"
                  type="email"
                  required
                  placeholder="e.g. student@college.edu"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Validating Student...</span>
                  </div>
                ) : (
                  <>
                    <span>Continue to Quiz Access Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Separation Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Are you a faculty organizer?</span>
            <button
              onClick={() => onNavigate('admin-login')}
              className="text-purple-600 font-semibold hover:text-purple-800 transition-colors"
            >
              Admin Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
