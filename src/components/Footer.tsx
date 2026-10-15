import React from 'react';
import { Award, Shield, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                Q
              </div>
              <span className="font-bold text-white text-base tracking-wide">QUIZZORA</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              College Quiz Competition Portal. Think Fast. Answer Smart. Score High.
            </p>
          </div>

          <div className="flex items-center justify-start md:justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>30 Verified MCQs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Tamper-Proof Scoring</span>
            </div>
          </div>

          <div className="text-left md:text-right text-xs text-slate-500">
            <p>© {new Date().getFullYear()} QUIZZORA Platform. All rights reserved.</p>
            <p className="mt-0.5">Automated Evaluation & Persistent Storage Engine</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
