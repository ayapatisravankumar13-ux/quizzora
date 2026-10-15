import React, { useEffect } from 'react';
import { Award, CheckCircle2, XCircle, HelpCircle, Clock, Calendar, Hash, User, Mail, Printer, ArrowLeft, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useQuiz } from '../context/QuizContext';

interface StudentResultPageProps {
  onNavigate: (view: string) => void;
}

export const StudentResultPage: React.FC<StudentResultPageProps> = ({ onNavigate }) => {
  const { student, result } = useQuiz();

  const currentResult = result || {
    studentName: student?.name || 'Student Candidate',
    studentRoll: student?.rollNumber || 'N/A',
    studentEmail: student?.email || 'N/A',
    quizTitle: 'Quizzora Python & Technology Quiz',
    totalQuestions: 30,
    score: 0,
    percentage: 0,
    correctCount: 0,
    incorrectCount: 0,
    unansweredCount: 0,
    timeTakenSeconds: 0,
    submittedAt: Date.now(),
    submissionReceipt: 'QZ-RECEIPT-PENDING'
  };

  const score = currentResult.score ?? 0;
  const percentage = currentResult.percentage ?? Number(((score / 30) * 100).toFixed(1));
  const isPass = percentage >= 40;
  const isDistinction = percentage >= 75;

  useEffect(() => {
    if (isPass) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  }, [isPass]);

  const formatSeconds = (sec?: number) => {
    if (!sec) return '0m 0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const formattedDate = currentResult.submittedAt
    ? new Date(currentResult.submittedAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      })
    : new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-2xl mx-auto w-full">
        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              header, footer, .no-print { display: none !important; }
              body { background: white !important; }
              .print-container { border: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
            }
          `
        }} />

        {/* Action bar (no-print) */}
        <div className="flex items-center justify-between mb-4 no-print">
          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Home</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Printable Result Card */}
        <div className="print-container bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 px-6 sm:px-8 py-8 text-white text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-3">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Official Quiz Examination Result
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 font-medium">
              {currentResult.quizTitle || 'Quizzora Python & Technology Quiz'}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Score Ring / Highlight Card */}
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-100 rounded-2xl p-6 text-center">
              <div className="inline-block relative mb-2">
                <span className="text-5xl sm:text-6xl font-black text-indigo-900 tracking-tight">
                  {score}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-400"> / 30</span>
              </div>
              <p className="text-sm font-extrabold text-indigo-700">
                Score: {percentage}%
              </p>
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isDistinction
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isPass
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {isDistinction ? 'Distinction Pass' : isPass ? 'Qualified' : 'Attempt Completed'}
                </span>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Correct</p>
                <p className="text-2xl font-black text-emerald-900">{currentResult.correctCount ?? 0}</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                <XCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Incorrect</p>
                <p className="text-2xl font-black text-rose-900">{currentResult.incorrectCount ?? 0}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <HelpCircle className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Unanswered</p>
                <p className="text-2xl font-black text-slate-800">{currentResult.unansweredCount ?? 0}</p>
              </div>
            </div>

            {/* Student & Submission Details */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs sm:text-sm">
              <div className="bg-slate-100/70 px-4 py-2.5 font-bold text-slate-700 uppercase tracking-wider text-xs border-b border-slate-200">
                Submission Credentials & Receipt
              </div>
              <div className="divide-y divide-slate-100 text-slate-700">
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <User className="w-4 h-4 text-indigo-600" /> Full Name:
                  </span>
                  <span className="font-bold text-slate-900">{currentResult.studentName}</span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Hash className="w-4 h-4 text-indigo-600" /> College Roll Number:
                  </span>
                  <span className="font-mono font-bold text-blue-700">{currentResult.studentRoll}</span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-4 h-4 text-indigo-600" /> Registered Email:
                  </span>
                  <span className="text-slate-800">{currentResult.studentEmail}</span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4 text-indigo-600" /> Time Taken:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatSeconds(currentResult.timeTakenSeconds)}
                  </span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4 text-indigo-600" /> Submitted At:
                  </span>
                  <span className="text-slate-800">{formattedDate}</span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between bg-indigo-50/40">
                  <span className="flex items-center gap-2 text-slate-500 font-semibold">
                    <Award className="w-4 h-4 text-indigo-600" /> Unique Receipt ID:
                  </span>
                  <span className="font-mono text-xs font-black text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                    {currentResult.submissionReceipt}
                  </span>
                </div>
              </div>
            </div>

            {/* Fair Evaluation Note */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                This is a tamper-proof computerized score report generated by QUIZZORA for college records. The answer keys will remain confidential while the competition window is active.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
