import React, { useState } from 'react';
import { Award, Clock, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Send, AlertTriangle, Menu, X, User } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

interface ActiveQuizPageProps {
  onNavigate: (view: string) => void;
}

export const ActiveQuizPage: React.FC<ActiveQuizPageProps> = ({ onNavigate }) => {
  const {
    student,
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    selectAnswer,
    clearAnswer,
    remainingSeconds,
    isSaving,
    isSubmitting,
    submitQuiz
  } = useQuiz();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  if (!student || !questions.length) {
    onNavigate('student-login');
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Timer formatting mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = remainingSeconds <= 300; // < 5 mins
  const isCriticalTime = remainingSeconds <= 60; // < 1 min

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleManualSubmit = async () => {
    setShowSubmitModal(false);
    const res = await submitQuiz(false);
    if (res.success) {
      onNavigate('student-result');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-4rem)]">
      {/* Top Floating Exam Header */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Student metadata */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="lg:hidden px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 border border-slate-200 cursor-pointer text-xs font-bold"
                aria-label="Toggle Question Navigator"
              >
                <Menu className="w-4 h-4 text-indigo-600" />
                <span>Qs {currentQuestionIndex + 1}/30</span>
              </button>

              <div className="hidden sm:block">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Candidate</span>
                <p className="text-sm font-extrabold text-slate-900 truncate max-w-[180px]">
                  {student.name}
                </p>
              </div>
              <div className="hidden md:block pl-3 border-l border-slate-200">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Roll No.</span>
                <p className="text-sm font-mono font-bold text-blue-700">
                  {student.rollNumber}
                </p>
              </div>
            </div>

            {/* Autosave Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
              <span>{isSaving ? 'Saving to cloud...' : 'Answers autosaved'}</span>
            </div>

            {/* Synchronized Countdown Timer */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-black border transition-colors ${
                  isCriticalTime
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : isLowTime
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-800 border-slate-300'
                }`}
              >
                <Clock className={`w-4 h-4 ${isCriticalTime ? 'text-rose-600' : isLowTime ? 'text-amber-600' : 'text-indigo-600'}`} />
                <span>{formattedTime}</span>
              </div>

              {/* Submit Top Button */}
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Quiz</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Progress: {answeredCount} of {totalQuestions} answered ({progressPercent}%)</span>
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Examination View Area */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question & Options Area (8 columns on lg) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col min-h-[500px]">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Question {currentQuestion.id} of {totalQuestions}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                +1 Mark | No Negative Marking
              </span>
            </div>

            {/* Question Text */}
            <div className="py-5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Code Snippet Box (if question contains code) */}
              {currentQuestion.codeSnippet && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto border border-slate-800 shadow-inner">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                    Python Code
                  </div>
                  <pre className="leading-relaxed">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* 4 Selectable Answer Options */}
            <div className="space-y-3 pt-2 pb-6">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => selectAnswer(currentQuestion.id, opt.key)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 group cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 group-hover:border-indigo-400'
                      }`}
                    >
                      {opt.key}
                    </div>
                    <div className="flex-1 text-sm font-medium text-slate-800 pt-0.5 leading-snug">
                      {opt.text}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {answers[currentQuestion.id] && (
                  <button
                    type="button"
                    onClick={() => clearAnswer(currentQuestion.id)}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Response</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigation Grid (4 columns on lg) */}
          <div className="hidden lg:block lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-44">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                Question Navigator
              </h3>
              <span className="text-xs font-bold text-indigo-600">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md border-2 border-indigo-600 bg-white" />
                <span>Current</span>
              </div>
            </div>

            {/* Grid of 1 to 30 */}
            <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 ring-offset-2 font-black ' +
                          (isAnswered ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-indigo-600 text-indigo-700')
                        : isAnswered
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Modal */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Question Navigator</h3>
                <p className="text-[11px] text-indigo-600 font-semibold">{answeredCount} of {totalQuestions} Answered</p>
              </div>
              <button
                onClick={() => setShowMobileNav(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Legend */}
            <div className="grid grid-cols-3 gap-1 mb-3 text-[10px] font-semibold text-slate-600">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                <span>Done</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300" />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm border border-indigo-600 bg-white" />
                <span>Active</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 overflow-y-auto flex-1 pr-1">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setShowMobileNav(false);
                    }}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 ring-offset-1 font-black bg-indigo-50 text-indigo-700 border-2 border-indigo-600'
                        : isAnswered
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 text-center mb-2">
              Ready to Submit Your Quiz?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 text-center mb-6">
              Once submitted, your responses will be locked and automatically evaluated. You cannot modify answers after final submission.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500">Answered Questions</p>
                <p className="text-xl font-black text-indigo-600">{answeredCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Unanswered Questions</p>
                <p className="text-xl font-black text-amber-600">{unansweredCount}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
              >
                Back to Questions
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleManualSubmit}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Yes, Submit Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
