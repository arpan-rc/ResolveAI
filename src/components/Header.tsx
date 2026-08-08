import React from 'react';
import { ShieldCheck, Cpu, RefreshCw, LayoutDashboard, BarChart3, LogOut, Sun, Moon, User } from 'lucide-react';
import { AIStatus, UserSession } from '../types';

interface HeaderProps {
  currentView: 'landing' | 'customer' | 'agent' | 'analytics';
  onViewChange: (view: 'landing' | 'customer' | 'agent' | 'analytics') => void;
  instanceMode: 'customer' | 'agent' | 'hub';
  onInstanceModeChange: (mode: 'customer' | 'agent' | 'hub') => void;
  aiStatus: AIStatus | null;
  onOpenAiModal: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  userSession: UserSession | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  instanceMode,
  onInstanceModeChange,
  aiStatus,
  onOpenAiModal,
  onSeedDemo,
  isSeeding,
  theme,
  onToggleTheme,
  userSession,
  onLogout
}) => {
  return (
    <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-md backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <button
            onClick={() => {
              if (userSession?.role === 'customer') {
                onViewChange('customer');
              } else if (userSession?.role === 'agent') {
                onViewChange('agent');
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
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Resolve<span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </span>
                {userSession && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    userSession.role === 'customer'
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                      : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                  }`}>
                    {userSession.role === 'customer' ? 'Customer Portal' : 'Agent Workstation'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {userSession?.role === 'customer'
                  ? 'Customer Support Self-Service Portal'
                  : 'AI recommends. Humans decide.'}
              </p>
            </div>
          </button>

          {/* Role Navigation Tabs (Only for logged in Agents) */}
          {userSession?.role === 'agent' && currentView !== 'landing' && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onViewChange('agent')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'agent'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Agent Queue
              </button>
              <button
                onClick={() => onViewChange('analytics')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics & Audit
              </button>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">

            {/* Theme Switcher Toggle (☀ / 🌙) */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>

            {/* Agent-Only Action Buttons (AI Settings & Seed) */}
            {userSession?.role === 'agent' && (
              <>
                {/* AI Engine Status Pill */}
                <button
                  onClick={onOpenAiModal}
                  title="Click to view AI Engine Status & Test Fallback Modes"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    aiStatus?.forceFallback || !aiStatus?.hasApiKey
                      ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                      : 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                  }`}
                >
                  <Cpu className={`h-3.5 w-3.5 ${aiStatus?.forceFallback || !aiStatus?.hasApiKey ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <span className="hidden sm:inline">
                    {aiStatus?.forceFallback
                      ? 'Fallback Active'
                      : aiStatus?.hasApiKey
                      ? 'AI Active'
                      : 'Fallback Active'}
                  </span>
                </button>

                {/* Seed Demo Data Button */}
                <button
                  onClick={onSeedDemo}
                  disabled={isSeeding}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
                  title="Reset Demo Tickets for Live Presentation"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Reset Demo</span>
                </button>
              </>
            )}

            {/* Authenticated User Session Badge & Logout Button */}
            {userSession ? (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{userSession.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{userSession.email}</span>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 rounded-lg text-xs font-bold transition-all active:scale-95"
                  title="Logout from ResolveAI"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : null}

          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        {userSession?.role === 'agent' && currentView !== 'landing' && (
          <div className="flex md:hidden border-t border-slate-200 dark:border-slate-800 py-2 gap-1 overflow-x-auto">
            <button
              onClick={() => onViewChange('agent')}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                currentView === 'agent' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900'
              }`}
            >
              Agent Queue
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                currentView === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900'
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

