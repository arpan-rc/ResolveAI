import React from 'react';
import { UserCheck, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

export const AIBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-lg mb-6 relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        
        {/* Banner Left */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                Human-In-The-Loop Protocol
              </span>
              <span className="text-xs font-semibold text-slate-300">
                AI RECOMMENDATION — HUMAN VERIFICATION REQUIRED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              ResolveAI analyzes incoming support tickets, categorizes issues, and drafts initial responses. 
              <strong className="text-slate-200"> AI does NOT have final authority.</strong> Every recommendation must be reviewed, edited, or approved by a human agent before action execution.
            </p>
          </div>
        </div>

        {/* Banner Right Badges */}
        <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Human Final Authority</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>High Risk Safeguards</span>
          </div>
        </div>

      </div>
    </div>
  );
};
