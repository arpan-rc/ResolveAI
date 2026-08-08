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
import { AIStatus, AuditLog, Category, DashboardStats, Department, Priority, Ticket } from './types';

export default function App() {
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
    const init = getInitialInstance();
    if (init === 'customer') return 'customer';
    if (init === 'agent') return 'agent';
    return 'landing';
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

    // Sync URL search query for shareable links
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (mode === 'hub') {
        url.searchParams.delete('instance');
        url.searchParams.delete('mode');
      } else {
        url.searchParams.set('instance', mode);
      }
      window.history.replaceState({}, '', url.toString());
    }
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
      const [aiRes, statsRes, ticketsRes] = await Promise.all([
        fetch('/api/ai/status'),
        fetch('/api/dashboard/stats'),
        fetch('/api/tickets')
      ]);

      if (aiRes.ok) setAiStatus(await aiRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch ticket details when selecting a ticket
  const handleSelectTicket = async (id: string) => {
    setSelectedTicketId(id);
    try {
      const res = await fetch(`/api/tickets/${id}`);
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
      const res = await fetch('/api/demo/seed', { method: 'POST' });
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
      const res = await fetch('/api/ai/toggle-fallback', { method: 'POST' });
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: 'Agent Sarah Jenkins',
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: 'Agent Sarah Jenkins',
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: 'Agent Sarah Jenkins',
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

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header
          currentView={currentView}
          onViewChange={(v) => {
            if (instanceMode === 'customer' && v !== 'customer') return;
            setCurrentView(v);
            if (v === 'agent') setSelectedTicketId(null);
          }}
          instanceMode={instanceMode}
          onInstanceModeChange={handleInstanceChange}
          aiStatus={aiStatus}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onSeedDemo={handleSeedDemo}
          isSeeding={isSeeding}
        />

        {/* Main Content Body */}
        <main className="pb-10">
          {currentView === 'landing' && (
            <RoleSelectionLanding
              onSelectInstance={(inst) => handleInstanceChange(inst)}
            />
          )}

          {currentView === 'agent' && instanceMode !== 'customer' && (
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
                  />
                </>
              )}
            </div>
          )}

          {currentView === 'customer' && (
            <CustomerPortal
              onSubmitTicket={handleSubmitCustomerTicket}
              allTickets={tickets}
              recentSubmittedTicket={recentCustomerTicket}
              isCustomerStandalone={instanceMode === 'customer'}
              onSwitchToAgentRole={() => {
                if (instanceMode !== 'customer') {
                  setCurrentView('agent');
                  setSelectedTicketId(null);
                }
              }}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsPanel
              stats={stats}
              auditLogs={auditLogs}
            />
          )}
        </main>
      </div>

      {/* Bento Grid Status Footer */}
      <footer className="my-4 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto flex flex-col sm:flex-row justify-between items-center px-5 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span>Session: <span className="text-slate-300 font-mono">ResolveAI Demo Session</span></span>
          <span className="text-slate-700">|</span>
          <span>Instance Mode: <span className="text-indigo-400 font-semibold uppercase font-mono">{instanceMode === 'customer' ? 'Customer Machine (Isolated Client)' : instanceMode === 'agent' ? 'Support Agent Workstation' : 'Prototype Navigation Hub'}</span></span>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">HUMAN VERIFICATION ENFORCED</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="font-mono text-[10px] text-slate-400">STATUS: 100% OPERATIONAL</span>
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
