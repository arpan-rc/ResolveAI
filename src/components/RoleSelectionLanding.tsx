import React from 'react';
import { ShieldCheck, User, UserCheck, Bot, ArrowRight, Sparkles, Lock, Zap } from 'lucide-react';

interface RoleSelectionLandingProps {
  onSelectRole: (role: 'customer' | 'agent') => void;
}

export const RoleSelectionLanding: React.FC<RoleSelectionLandingProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        
        {/* Brand Hero Heading */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-inner">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Human-in-the-Loop AI Automation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
            RESOLVE<span className="text-indigo-400">AI</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
            "AI-powered support automation with human oversight."
          </p>
          <p className="text-xs sm:text-sm text-indigo-400 font-semibold font-mono tracking-wide uppercase">
            AI recommends. Humans decide.
          </p>
        </div>

        {/* Role Selection Question Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              How would you like to continue?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your role to explore the interactive customer or support agent workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Role 1: Customer */}
            <button
              onClick={() => onSelectRole('customer')}
              className="group relative bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/60 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between space-y-4 active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <User className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 border border-slate-700">
                  Customer Portal
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                  <span>👤 CUSTOMER</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Submit a support ticket, trigger instant AI triage, and track live ticket resolution status.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Enter Customer Portal</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Role 2: Support Agent */}
            <button
              onClick={() => onSelectRole('agent')}
              className="group relative bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/60 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between space-y-4 active:scale-98"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <UserCheck className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 group-hover:bg-purple-500/20 group-hover:text-purple-300 border border-slate-700">
                  Agent Workspace
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  <span>🧑‍💼 SUPPORT AGENT</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Inspect AI recommendations, verify or edit decisions, handle high-risk tickets, and dispatch responses.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                <span>Enter Agent Dashboard</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>
        </div>

        {/* Feature Badges Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
            <Bot className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">Support Triage Agent</div>
              <div className="text-[11px] text-slate-400">Automated category & SLA priority</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
            <Lock className="h-5 w-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">High-Risk Safeguards</div>
              <div className="text-[11px] text-slate-400">Mandatory agent sign-off on refunds</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">Deterministic Fallback</div>
              <div className="text-[11px] text-slate-400">100% uptime with zero AI key lock-in</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
