import React from 'react';
import { ShieldCheck, Bot, UserCheck, RefreshCw, Cpu, LayoutDashboard, User, BarChart3, LogOut, Sparkles } from 'lucide-react';
import { AIStatus } from '../types';

interface HeaderProps {
  currentView: 'landing' | 'customer' | 'agent' | 'analytics';
  onViewChange: (view: 'landing' | 'customer' | 'agent' | 'analytics') => void;
  instanceMode: 'customer' | 'agent' | 'hub';
  onInstanceModeChange: (mode: 'customer' | 'agent' | 'hub') => void;
  aiStatus: AIStatus | null;
  onOpenAiModal: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  instanceMode,
  onInstanceModeChange,
  aiStatus,
  onOpenAiModal,
  onSeedDemo,
  isSeeding
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <button
            onClick={() => {
              if (instanceMode === 'customer') {
                onViewChange('customer');
              } else {
                onViewChange('landing');
              }
            }}
            className="flex items-center gap-3 text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  ResolveAI
                </span>
                {instanceMode === 'customer' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Client Machine
                  </span>
                )}
                {instanceMode === 'agent' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Agent Workstation
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                {instanceMode === 'customer'
                  ? 'Customer Support Self-Service Portal'
                  : 'AI recommends. Humans decide.'}
              </p>
            </div>
          </button>

          {/* Role Navigation Tabs (Only shown if NOT in isolated customer mode) */}
          {instanceMode !== 'customer' && currentView !== 'landing' && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => onViewChange('agent')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'agent'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Agent Queue
              </button>
              <button
                onClick={() => onViewChange('analytics')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics & Audit
              </button>
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">

            {/* Instance Switcher Selector Pill */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
              <span className="text-slate-400 font-bold px-1.5 hidden xl:inline">Instance Mode:</span>
              <button
                onClick={() => onInstanceModeChange('customer')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  instanceMode === 'customer'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Run as isolated Customer Machine view"
              >
                Client
              </button>
              <button
                onClick={() => onInstanceModeChange('agent')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  instanceMode === 'agent'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Run as Support Agent Workstation"
              >
                Agent
              </button>
              <button
                onClick={() => onInstanceModeChange('hub')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  instanceMode === 'hub'
                    ? 'bg-slate-800 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full Prototype Navigation Hub"
              >
                Hub
              </button>
            </div>

            {/* Agent-Only Action Buttons (AI Settings & Seed) */}
            {instanceMode !== 'customer' && (
              <>
                {/* AI Engine Status Pill */}
                <button
                  onClick={onOpenAiModal}
                  title="Click to view AI Engine Status & Test Fallback Modes"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    aiStatus?.forceFallback || !aiStatus?.hasApiKey
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/50'
                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                >
                  <Cpu className={`h-3.5 w-3.5 ${aiStatus?.forceFallback || !aiStatus?.hasApiKey ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
                  <span className="hidden sm:inline">
                    {aiStatus?.forceFallback
                      ? 'Fallback Engine Active'
                      : aiStatus?.hasApiKey
                      ? 'AI Engine Active'
                      : 'Fallback Engine (Demo)'}
                  </span>
                </button>

                {/* Seed Demo Data Button */}
                <button
                  onClick={onSeedDemo}
                  disabled={isSeeding}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
                  title="Reset Demo Tickets for Live Presentation"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Reset Demo</span>
                </button>
              </>
            )}

          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        {instanceMode !== 'customer' && currentView !== 'landing' && (
          <div className="flex md:hidden border-t border-slate-800 py-2 gap-1 overflow-x-auto">
            <button
              onClick={() => onViewChange('agent')}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                currentView === 'agent' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
              }`}
            >
              Agent Queue
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                currentView === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
              }`}
            >
              Analytics
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
