import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, LogIn, KeyRound, Mail, CheckCircle2, Users, Smartphone, Laptop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginPageProps {
  onNavigate: (view: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, adminEmail, adminName, loading, signInWithGoogle, signInWithPasskey, signOutAdmin } = useAuth();

  const [activeMode, setActiveMode] = useState<'passkey' | 'google'>('passkey');
  const [emailInput, setEmailInput] = useState('');
  const [passkeyInput, setPasskeyInput] = useState('ADMIN2025');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in and authorized
  if (isAdmin && (user || adminEmail)) {
    onNavigate('admin-dashboard');
    return null;
  }

  // If signed in via Google but not authorized
  if (user && !isAdmin && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            You are signed in as <span className="font-semibold text-slate-800">{user.email}</span>, which is not registered among the 10 authorized committee members.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={async () => {
                await signOutAdmin();
              }}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Sign Out & Try Authorized Member Email
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

  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = emailInput.trim();
    const trimmedPasskey = passkeyInput.trim();

    if (!trimmedEmail) {
      setErrorMsg('Please enter your authorized admin email address.');
      return;
    }
    if (!trimmedPasskey) {
      setErrorMsg('Please enter the Admin Security Passkey.');
      return;
    }

    setIsSubmitting(true);
    const res = await signInWithPasskey(trimmedEmail, trimmedPasskey);
    setIsSubmitting(false);

    if (res.success) {
      onNavigate('admin-dashboard');
    } else {
      setErrorMsg(res.error || 'Authorization failed. Check your email or passkey.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('Your mobile browser blocked the Google popup. Please use the "Member Passkey" tab below for instant mobile access!');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-700 to-blue-700 text-white shadow-lg shadow-purple-200 mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Access restricted to the 10 authorized faculty & committee organizers.
          </p>

          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-indigo-600" /> Laptop Ready
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-purple-600" /> Mobile Optimized
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-8">
          {/* Method Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveMode('passkey');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'passkey'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span>Member Passkey (Mobile & PC)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('google');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'google'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google Sign-In</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode 1: Passkey / Member Email Login (100% reliable on all mobile phones) */}
          {activeMode === 'passkey' ? (
            <form onSubmit={handlePasskeySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Authorized Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ayapatisravankumar13@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Enter any of the 10 registered member emails</span>
                  <button
                    type="button"
                    onClick={() => setEmailInput('ayapatisravankumar13@gmail.com')}
                    className="text-purple-600 hover:underline font-semibold"
                  >
                    Use Host Email
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Security Passkey
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Admin passkey"
                    value={passkeyInput}
                    onChange={(e) => setPasskeyInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-base sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default passkey: <code className="font-mono font-bold text-purple-700">ADMIN2025</code> (Configurable in Settings).
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 hover:from-purple-800 hover:to-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Committee Credentials...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Log In to Admin Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Mode 2: Google Sign-In with Firebase Auth */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900 leading-relaxed">
                Sign in with the Google account associated with one of the 10 authorized committee members (<code className="font-mono text-purple-800">ayapatisravankumar13@gmail.com</code>).
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 hover:from-purple-800 hover:to-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting with Google...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Quick Notice about the 10 member committee */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Authorized for 10 faculty & proctor members. Manage roster from dashboard.</span>
          </div>

          {/* Return Links */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
