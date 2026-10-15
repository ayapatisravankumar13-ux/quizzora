import React from 'react';
import { FileQuestion, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (view: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">404 — Page Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          The requested page does not exist or has been relocated.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Competition Home</span>
        </button>
      </div>
    </div>
  );
};
