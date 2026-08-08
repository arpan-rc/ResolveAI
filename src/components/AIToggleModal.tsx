import React from 'react';
import { Cpu, ShieldCheck, Zap, X, Check, AlertTriangle, Key } from 'lucide-react';
import { AIStatus } from '../types';

interface AIToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiStatus: AIStatus | null;
  onToggleFallback: () => void;
}

export const AIToggleModal: React.FC<AIToggleModalProps> = ({
  isOpen,
  onClose,
  aiStatus,
  onToggleFallback
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Service & Fallback Control</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ResolveAI Modular Architecture Test Bench</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Status */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Active Provider Engine:
          </span>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              aiStatus?.forceFallback || !aiStatus?.hasApiKey
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
            }`}>
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {aiStatus?.activeProvider || 'Deterministic Fallback Rule Engine'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {aiStatus?.hasApiKey ? 'AI API Keys Configured (Claude / Gemini)' : 'No API Key — Seamless Fallback Active'}
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Force Fallback Mode</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Simulate API outage / rate-limit / timeout for hackathon judge evaluation
              </span>
            </div>

            <button
              onClick={onToggleFallback}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                aiStatus?.forceFallback ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  aiStatus?.forceFallback ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Failure Handling Guarantees */}
        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-slate-200 block">ResolveAI Reliability Guarantees:</span>
          <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Application NEVER crashes or shows blank screens on AI failure</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>8-second timeout guard prevents backend hangs</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Deterministic keyword & rule engine produces structured fallback triage</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Clearly flags fallback usage so human agents maintain context</span>
            </li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30"
          >
            Close Bench
          </button>
        </div>

      </div>
    </div>
  );
};
