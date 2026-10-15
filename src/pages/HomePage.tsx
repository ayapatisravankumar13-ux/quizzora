import React, { useEffect, useState } from 'react';
import { Award, Clock, FileQuestion, ShieldCheck, CheckCircle2, ArrowRight, UserCheck, Lock } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [quizInfo, setQuizInfo] = useState<{
    title: string;
    isOpen: boolean;
    durationMinutes: number;
    totalQuestions: number;
  }>({
    title: 'Quizzora Python & Technology Quiz',
    isOpen: true,
    durationMinutes: 30,
    totalQuestions: 30
  });

  useEffect(() => {
    fetch('/api/quiz/info')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.title) {
          setQuizInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-center py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${
            quizInfo.isOpen 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${quizInfo.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {quizInfo.isOpen ? 'COMPETITION IS LIVE & ACTIVE' : 'COMPETITION IS TEMPORARILY CLOSED'}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-200 mb-6">
            <Award className="w-10 h-10" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 mb-4">
            QUIZZORA
          </h1>
          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Think Fast. Answer Smart. Score High.
          </p>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Welcome to the college online quiz competition. Test your knowledge in Python programming, modern development practices, and core computer science fundamentals.
          </p>

          {/* Action Buttons: Student Login and Admin Login strictly separated */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('student-login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform active:scale-98 transition-all flex items-center justify-center gap-2 group"
            >
              <UserCheck className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
              <span>Student Login</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('admin-login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-base border-2 border-slate-200 hover:border-purple-300 shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 group"
            >
              <ShieldCheck className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <span>Admin Login</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">
            Student entry requires only Full Name, College Roll Number, and Email ID.
          </p>
        </div>

        {/* Competition Specifications Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg mb-1">{quizInfo.totalQuestions} Questions</h2>
            <p className="text-sm text-slate-600">
              Multiple-choice questions covering Python syntax, variables, Git, AI tools, and computer engineering concepts.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> 1 Mark Per Correct Answer
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg mb-1">{quizInfo.durationMinutes} Minutes</h2>
            <p className="text-sm text-slate-600">
              Server-authoritative synchronized countdown. Autosaves your answers and submits automatically when time expires.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-purple-600">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> No Negative Marking
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg mb-1">One Final Attempt</h2>
            <p className="text-sm text-slate-600">
              Strict single-attempt policy. Verified receipt generation ensures individual fair play and authentic college records.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Instant Tamper-Proof Result
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
