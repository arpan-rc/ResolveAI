import React from 'react';
import { BarChart3, ShieldCheck, Target, Clock, CheckCircle2, AlertTriangle, History, TrendingUp, Cpu } from 'lucide-react';
import { AuditLog, DashboardStats } from '../types';

interface AnalyticsPanelProps {
  stats: DashboardStats | null;
  auditLogs: AuditLog[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats, auditLogs }) => {
  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Human-in-the-Loop Performance Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry measuring AI recommendation accuracy, agent overrides, and security safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Human Verification Enforced</span>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AI Accuracy (Direct Approval)</span>
            <Target className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {stats.aiAccuracyPercentage}%
          </div>
          <p className="text-[11px] text-slate-400">
            Tickets approved without human category or priority modification
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Human Override Rate</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">
            {100 - stats.aiAccuracyPercentage}%
          </div>
          <p className="text-[11px] text-slate-400">
            Tickets where agent modified priority, dept, or draft response
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Resolution Time</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black font-mono text-indigo-300">
            {stats.avgResolutionTimeMinutes}m
          </div>
          <p className="text-[11px] text-slate-400">
            From customer submission to verified dispatch
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>High-Risk Interventions</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black font-mono text-rose-400">
            {stats.highRiskCount}
          </div>
          <p className="text-[11px] text-slate-400">
            Financial & security actions requiring mandatory review
          </p>
        </div>

      </div>

      {/* Global Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            <span>Global System Audit Log Feed</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">{auditLogs.length} total events</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                  log.actorRole === 'HUMAN_AGENT'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : log.actorRole === 'AI_SYSTEM'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {log.actorRole}
                </span>
                <div>
                  <span className="font-mono font-bold text-indigo-400 mr-2">{log.ticketId}</span>
                  <span className="font-semibold text-slate-200">{log.action}: </span>
                  <span className="text-slate-400">{log.details}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
