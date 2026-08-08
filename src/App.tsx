import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AIBanner } from './components/AIBanner';
import { StatsCards } from './components/StatsCards';
import { TicketQueue } from './components/TicketQueue';
import { TicketDetail } from './components/TicketDetail';
import { CustomerPortal } from './components/CustomerPortal';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { AIToggleModal } from './components/AIToggleModal';
import { RoleSelectionLanding } from './components/RoleSelectionLanding';
import { AIStatus, AuditLog, Category, DashboardStats, Department, Priority, Ticket, UserSession } from './types';

export default function App() {
  // 1. Authenticated User Session
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('resolve_ai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Global Theme State (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('resolve_ai_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('resolve_ai_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem('resolve_ai_user', JSON.stringify(session));
    if (session.role === 'customer') {
      setCurrentView('customer');
      setInstanceMode('customer');
    } else {
      setCurrentView('agent');
      setInstanceMode('agent');
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('resolve_ai_user');
    setCurrentView('landing');
  };

  // 3. Instance & View Management
  const getInitialInstance = (): 'customer' | 'agent' | 'hub' => {
    if (typeof window === 'undefined') return 'hub';
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('instance') || params.get('mode');
    if (mode === 'customer' || mode === 'client') return 'customer';
    if (mode === 'agent') return 'agent';
    return 'hub';
  };

  const [instanceMode, setInstanceMode] = useState<'customer' | 'agent' | 'hub'>(getInitialInstance);
  const [currentView, setCurrentView] = useState<'landing' | 'agent' | 'customer' | 'analytics'>(() => {
    if (!userSession) return 'landing';
    return userSession.role === 'customer' ? 'customer' : 'agent';
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Switch Instance Handler
  const handleInstanceChange = (mode: 'customer' | 'agent' | 'hub') => {
    setInstanceMode(mode);
    if (mode === 'customer') {
      setCurrentView('customer');
    } else if (mode === 'agent') {
      setCurrentView('agent');
      setSelectedTicketId(null);
    } else {
      setCurrentView('landing');
    }
  };

  // Helper to build Auth Headers for API calls
  const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = { ...extraHeaders };
    if (userSession) {
      headers['x-user-role'] = userSession.role;
      headers['x-user-email'] = userSession.email;
    }
    return headers;
  };

  // Data states
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  // Status Filters & UI states
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAnalyzingId, setIsAnalyzingId] = useState<string | null>(null);
  const [recentCustomerTicket, setRecentCustomerTicket] = useState<Ticket | null>(null);

  // Initial Fetch Data
  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      const [aiRes, statsRes, ticketsRes] = await Promise.all([
        fetch('/api/ai/status', { headers }),
        fetch('/api/dashboard/stats', { headers }),
        fetch('/api/tickets', { headers })
      ]);

      if (aiRes.ok) setAiStatus(await aiRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    if (userSession) {
      fetchData();
    }
  }, [userSession]);

  // Fetch ticket details when selecting a ticket
  const handleSelectTicket = async (id: string) => {
    setSelectedTicketId(id);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error('Failed to load ticket details:', err);
    }
  };

  // Re-seed demo data
  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/demo/seed', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchData();
        if (selectedTicketId) {
          handleSelectTicket(selectedTicketId);
        }
      }
    } catch (err) {
      console.error('Failed to seed demo:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Toggle fallback mode
  const handleToggleFallback = async () => {
    try {
      const res = await fetch('/api/ai/toggle-fallback', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updated = await res.json();
        setAiStatus(updated);
      }
    } catch (err) {
      console.error('Failed to toggle fallback:', err);
    }
  };

  // Submit new ticket from Customer Portal
  const handleSubmitCustomerTicket = async (data: {
    customerName: string;
    customerEmail: string;
    subject: string;
    description: string;
    suggestedCategory?: Category;
  }): Promise<Ticket | null> => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...data, autoAnalyze: true })
      });

      if (res.ok) {
        const created: Ticket = await res.json();
        setRecentCustomerTicket(created);
        await fetchData();
        return created;
      }
    } catch (err) {
      console.error('Error submitting ticket:', err);
    }
    return null;
  };

  // Trigger Re-Analyze
  const handleReAnalyzeTicket = async (id: string, forceFallback?: boolean) => {
    setIsAnalyzingId(id);
    try {
      const res = await fetch(`/api/tickets/${id}/analyze`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ forceFallback })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setAuditLogs(data.auditLogs);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to analyze ticket:', err);
    } finally {
      setIsAnalyzingId(null);
    }
  };

  // Approve Ticket
  const handleApproveTicket = async (reviewData: {
    category: Category;
    priority: Priority;
    department: Department;
    finalResponse: string;
  }) => {
    if (!selectedTicketId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          reviewer: userSession?.name || 'Agent Sarah Jenkins',
          ...reviewData
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setAuditLogs(data.auditLogs);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to approve ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject Ticket
  const handleRejectTicket = async (rejectionReason: string) => {
    if (!selectedTicketId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          reviewer: userSession?.name || 'Agent Sarah Jenkins',
          rejectionReason
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setAuditLogs(data.auditLogs);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to reject ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Escalate Ticket
  const handleEscalateTicket = async (escalationNote: string) => {
    if (!selectedTicketId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}/escalate`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          reviewer: userSession?.name || 'Agent Sarah Jenkins',
          escalationNote
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setAuditLogs(data.auditLogs);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to escalate ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Approve Tickets
  const handleBulkApproveTickets = async (ticketIds: string[]) => {
    if (!ticketIds || ticketIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets/bulk-approve', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ids: ticketIds,
          reviewer: userSession?.name || 'Agent Sarah Jenkins'
        })
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to bulk approve tickets:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Escalate Tickets
  const handleBulkEscalateTickets = async (ticketIds: string[]) => {
    if (!ticketIds || ticketIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets/bulk-escalate', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ids: ticketIds,
          reviewer: userSession?.name || 'Agent Sarah Jenkins',
          escalationNote: 'Bulk escalated to Operations Lead for human review.'
        })
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to bulk escalate tickets:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 font-sans transition-colors flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header
          currentView={currentView}
          onViewChange={(v) => {
            if (userSession?.role === 'customer' && v !== 'customer') return;
            setCurrentView(v);
            if (v === 'agent') setSelectedTicketId(null);
          }}
          instanceMode={instanceMode}
          onInstanceModeChange={handleInstanceChange}
          aiStatus={aiStatus}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onSeedDemo={handleSeedDemo}
          isSeeding={isSeeding}
          theme={theme}
          onToggleTheme={toggleTheme}
          userSession={userSession}
          onLogout={handleLogout}
        />

        {/* Main Content Body */}
        <main className="pb-10">
          {!userSession || currentView === 'landing' ? (
            <RoleSelectionLanding
              onLogin={handleLogin}
            />
          ) : currentView === 'agent' && userSession.role === 'agent' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {selectedTicketId && selectedTicket ? (
                /* Ticket Detail Inspection Workspace */
                <TicketDetail
                  ticket={selectedTicket}
                  auditLogs={auditLogs}
                  onBack={() => {
                    setSelectedTicketId(null);
                    setSelectedTicket(null);
                  }}
                  onApprove={handleApproveTicket}
                  onReject={handleRejectTicket}
                  onEscalate={handleEscalateTicket}
                  onReAnalyze={handleReAnalyzeTicket}
                  isSubmitting={isSubmitting}
                  isAnalyzing={Boolean(isAnalyzingId)}
                />
              ) : (
                /* Agent Dashboard Queue */
                <>
                  <AIBanner />
                  
                  <StatsCards
                    stats={stats}
                    activeFilter={selectedStatusTab}
                    onFilterChange={(f) => setSelectedStatusTab(f)}
                  />

                  <TicketQueue
                    tickets={tickets}
                    onSelectTicket={handleSelectTicket}
                    selectedStatusTab={selectedStatusTab}
                    onStatusTabChange={(tab) => setSelectedStatusTab(tab)}
                    onAnalyzeTicket={handleReAnalyzeTicket}
                    isAnalyzingId={isAnalyzingId}
                    onBulkApprove={handleBulkApproveTickets}
                    onBulkEscalate={handleBulkEscalateTickets}
                  />
                </>
              )}
            </div>
          ) : (
            <CustomerPortal
              onSubmitTicket={handleSubmitCustomerTicket}
              allTickets={tickets}
              recentSubmittedTicket={recentCustomerTicket}
              userSession={userSession}
              isCustomerStandalone={userSession.role === 'customer'}
            />
          )}

          {currentView === 'analytics' && userSession?.role === 'agent' && (
            <AnalyticsPanel
              stats={stats}
              auditLogs={auditLogs}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="my-4 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto flex flex-col sm:flex-row justify-between items-center px-5 py-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <span>Active User: <strong className="text-slate-800 dark:text-slate-200 font-mono">{userSession ? `${userSession.name} (${userSession.role})` : 'Unauthenticated'}</strong></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>Role Mode: <span className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase font-mono">{userSession?.role || 'Guest'}</span></span>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-slate-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">HUMAN VERIFICATION ENFORCED</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">RESOLVEAI v2.0 ACTIVE</span>
        </div>
      </footer>

      {/* AI Toggle / Test Modal */}
      <AIToggleModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        aiStatus={aiStatus}
        onToggleFallback={handleToggleFallback}
      />
    </div>
  );
}

