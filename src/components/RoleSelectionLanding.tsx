import React, { useState } from 'react';
import { ShieldCheck, User, UserCheck, Bot, ArrowRight, Lock, Zap, KeyRound, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface RoleSelectionLandingProps {
  onLogin: (session: UserSession) => void;
  preselectedRole?: UserRole | null;
}

export const RoleSelectionLanding: React.FC<RoleSelectionLandingProps> = ({ onLogin, preselectedRole }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(preselectedRole || null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'customer') {
      setEmail('aarav.sharma@example.com');
      setPassword('customer123');
    } else {
      setEmail('agent.sarah@resolveai.com');
      setPassword('agent123');
    }
  };

  const handleQuickSelectDemo = (demoEmail: string, demoRole: UserRole) => {
    setSelectedRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoRole === 'customer' ? 'customer123' : 'agent123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Authentication failed');
      }

      const data = await res.json();
      onLogin(data.user);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        
        {/* Brand Hero Heading */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold shadow-inner">
            <ShieldCheck className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span>Human-in-the-Loop AI Automation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            RESOLVE<span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto">
            "AI-powered support automation with mandatory human verification."
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold font-mono tracking-wide uppercase">
            AI recommends. Humans decide.
          </p>
        </div>

        {/* Auth / Role Selection Container Card */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-left space-y-6">
          
          {!selectedRole ? (
            /* STEP 1: ROLE SELECTION SCREEN */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Welcome to ResolveAI Authentication
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Please select your target portal role to proceed to authentication.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Role 1: Customer */}
                <button
                  onClick={() => handleSelectRole('customer')}
                  className="group relative bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-xl flex flex-col justify-between space-y-4 active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <User className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      Customer Portal
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                      [ Customer ]
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Submit support tickets, view live SLA progress, inspect AI responses, and download resolution PDFs.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500">
                    <span>Login as Customer</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Role 2: Support Agent */}
                <button
                  onClick={() => handleSelectRole('agent')}
                  className="group relative bg-slate-50 dark:bg-slate-950 hover:bg-purple-50/50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-purple-500 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-xl flex flex-col justify-between space-y-4 active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                      Agent Workstation
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                      [ Support Agent ]
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Verify AI triage, review draft responses, approve/reject tickets, perform bulk actions, and view audit logs.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-500">
                    <span>Login as Support Agent</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

              </div>
            </div>
          ) : (
            /* STEP 2: ROLE-SPECIFIC LOGIN FORM */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Change Selected Role</span>
                </button>

                <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider uppercase border ${
                  selectedRole === 'customer'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                    : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                }`}>
                  Authenticating as: {selectedRole === 'customer' ? 'Customer' : 'Support Agent'}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {selectedRole === 'customer' ? 'Customer Account Email' : 'Support Agent Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === 'customer' ? 'aarav.sharma@example.com' : 'agent.sarah@resolveai.com'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                    selectedRole === 'customer'
                      ? 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-500/20'
                      : 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-purple-500/20'
                  }`}
                >
                  {loading ? 'Authenticating...' : `Sign In as ${selectedRole === 'customer' ? 'Customer' : 'Support Agent'}`}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Quick Demo Fill Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quick Demo Login Accounts:
                </p>

                {selectedRole === 'customer' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickSelectDemo('aarav.sharma@example.com', 'customer')}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-left border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200">Aarav Sharma</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">aarav.sharma@example.com</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSelectDemo('priya.patel@example.com', 'customer')}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-left border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200">Priya Patel</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">priya.patel@example.com</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSelectDemo('rohan.mehta@example.com', 'customer')}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-left border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200">Rohan Mehta</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">rohan.mehta@example.com</div>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickSelectDemo('agent.sarah@resolveai.com', 'agent')}
                      className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-purple-100 dark:hover:bg-purple-950 text-left border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200">Agent Sarah Jenkins</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">agent.sarah@resolveai.com</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSelectDemo('agent.marcus@resolveai.com', 'agent')}
                      className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-purple-100 dark:hover:bg-purple-950 text-left border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200">Agent Marcus Vance</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">agent.marcus@resolveai.com</div>
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Feature Badges Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3.5 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
            <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Support Triage Agent</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Automated category & SLA priority</div>
            </div>
          </div>

          <div className="p-3.5 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
            <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">High-Risk Safeguards</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Mandatory agent sign-off on refunds</div>
            </div>
          </div>

          <div className="p-3.5 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Deterministic Fallback</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">100% uptime with zero AI key lock-in</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

