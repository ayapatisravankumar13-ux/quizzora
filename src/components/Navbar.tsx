import React from 'react';
import { Award, User, ShieldCheck, LogOut, BookOpen } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { student, isTimerRunning, resetStudentSession } = useQuiz();
  const { user, isAdmin, adminEmail, signOutAdmin } = useAuth();

  const handleStudentExit = () => {
    if (isTimerRunning) {
      if (!window.confirm('You have an active quiz session in progress. Are you sure you want to return to the home screen? Your timer will continue running.')) {
        return;
      }
    }
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button
            onClick={handleStudentExit}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  QUIZZORA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Think Fast. Answer Smart. Score High.
              </p>
            </div>
          </button>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student session pill */}
            {student && currentView !== 'home' && currentView !== 'admin-dashboard' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold max-w-[120px] truncate">{student.name}</span>
                <span className="text-slate-400">|</span>
                <span className="font-mono text-slate-600">{student.rollNumber}</span>
              </div>
            )}

            {/* Admin session pill */}
            {(user || adminEmail) && isAdmin && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs text-purple-800">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-medium truncate max-w-[150px]">{adminEmail || user?.email}</span>
                <span className="font-semibold px-1 rounded bg-purple-200 text-[10px]">ADMIN</span>
              </div>
            )}

            {/* View Switching */}
            {currentView === 'home' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('student-login')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm transition-all"
                >
                  Student Login
                </button>
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span className="hidden sm:inline">Admin</span> Portal
                </button>
              </div>
            ) : currentView.startsWith('admin') ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('home')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Competition Home
                </button>
                {(user || adminEmail) && (
                  <button
                    onClick={async () => {
                      await signOutAdmin();
                      onNavigate('home');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {student && !isTimerRunning && (
                  <button
                    onClick={() => {
                      resetStudentSession();
                      onNavigate('home');
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Change Student
                  </button>
                )}
                <button
                  onClick={() => onNavigate('home')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                >
                  Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
