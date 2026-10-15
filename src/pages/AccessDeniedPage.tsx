import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccessDeniedPageProps {
  onNavigate: (view: string) => void;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ onNavigate }) => {
  const { user, signOutAdmin } = useAuth();

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h1>
        <p className="text-sm text-slate-600 mb-6">
          You do not have administrative privileges to view this portal.
          {user?.email && (
            <span className="block mt-2 font-mono text-xs bg-slate-100 p-2 rounded text-slate-700">
              Account: {user.email}
            </span>
          )}
        </p>

        <div className="space-y-2">
          {user && (
            <button
              onClick={async () => {
                await signOutAdmin();
                onNavigate('admin-login');
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Sign In With Different Account
            </button>
          )}

          <button
            onClick={() => onNavigate('home')}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Competition Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
