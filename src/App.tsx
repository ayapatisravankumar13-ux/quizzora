/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { QuizAccessCodePage } from './pages/QuizAccessCodePage';
import { QuizInstructionsPage } from './pages/QuizInstructionsPage';
import { ActiveQuizPage } from './pages/ActiveQuizPage';
import { StudentResultPage } from './pages/StudentResultPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { NotFoundPage } from './pages/NotFoundPage';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    return hash || 'home';
  });

  const { student, isTimerRunning, result } = useQuiz();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string) => {
    window.location.hash = `#/${view}`;
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Prevent leaving active quiz unexpectedly
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (isTimerRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [isTimerRunning]);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'student-login':
        return <StudentLoginPage onNavigate={navigateTo} />;
      case 'access-code':
        return <QuizAccessCodePage onNavigate={navigateTo} />;
      case 'instructions':
        return <QuizInstructionsPage onNavigate={navigateTo} />;
      case 'active-quiz':
        return <ActiveQuizPage onNavigate={navigateTo} />;
      case 'student-result':
        return <StudentResultPage onNavigate={navigateTo} />;
      case 'admin-login':
        return <AdminLoginPage onNavigate={navigateTo} />;
      case 'admin-dashboard':
        return <AdminDashboardPage onNavigate={navigateTo} />;
      case 'access-denied':
        return <AccessDeniedPage onNavigate={navigateTo} />;
      default:
        return <NotFoundPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white font-sans">
      <Navbar currentView={currentView} onNavigate={navigateTo} />
      <main className="flex-1 flex flex-col">
        {renderView()}
      </main>
      {currentView !== 'active-quiz' && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <AppContent />
      </QuizProvider>
    </AuthProvider>
  );
}
