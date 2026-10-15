import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BOOTSTRAP_ADMIN_EMAIL } from '../lib/firebase';

interface AdminLoginPageProps {
  onNavigate: (view: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, loading, signInWithGoogle, signOutAdmin } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setErrorMsg(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // On successful sign in, AuthContext updates state
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.';
      setErrorMsg(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  // If already logged in and verified as admin
  if (user && isAdmin) {
    onNavigate('admin-dashboard');
    return null;
  }

  // If signed in but not an authorized admin
  if (user && !isAdmin && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-4">
            You are signed in as <span className="font-semibold text-slate-800">{user.email}</span>, which is not an authorized administrator account for this competition.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={async () => {
                await signOutAdmin();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Sign Out & Try Another Account
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Return to Competition Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-700 text-white shadow-lg shadow-purple-200 mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Portal
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Restricted access for authorized quiz organizers and faculty coordinators only.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 mb-1 text-purple-950">
                <Lock className="w-3.5 h-3.5 text-purple-700" />
                Single Sign-On Security
              </p>
              Admins sign in securely with their authorized Google account (<code className="font-mono text-purple-800">{BOOTSTRAP_ADMIN_EMAIL}</code>). Passwords and student codes are never shared.
            </div>

            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 hover:from-purple-800 hover:to-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
            >
              {isSigningIn ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Admin...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => onNavigate('home')}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <button
              onClick={() => onNavigate('student-login')}
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              Student Portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
