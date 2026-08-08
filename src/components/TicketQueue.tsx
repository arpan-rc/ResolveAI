import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, AlertTriangle, ArrowRight, Bot, Clock, CheckCircle2, XCircle, ChevronRight, User, CheckSquare, Square, X, Loader2 } from 'lucide-react';
import { Category, Priority, Ticket, TicketStatus } from '../types';

interface TicketQueueProps {
  tickets: Ticket[];
  onSelectTicket: (id: string) => void;
  selectedStatusTab: string;
  onStatusTabChange: (tab: string) => void;
  onAnalyzeTicket: (id: string) => void;
  isAnalyzingId: string | null;
  onBulkApprove?: (ids: string[]) => Promise<void>;
  onBulkEscalate?: (ids: string[]) => Promise<void>;
}

export const TicketQueue: React.FC<TicketQueueProps> = ({
  tickets,
  onSelectTicket,
  selectedStatusTab,
  onStatusTabChange,
  onAnalyzeTicket,
  isAnalyzingId,
  onBulkApprove,
  onBulkEscalate
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'approve' | 'escalate' | null>(null);

  // Filter list
  const filteredTickets = tickets.filter((t) => {
    // Status tab filter
    if (selectedStatusTab === 'AWAITING_HUMAN_REVIEW' && t.status !== 'AWAITING_HUMAN_REVIEW' && t.status !== 'NEW') return false;
    if (selectedStatusTab === 'HIGH_PRIORITY' && t.priority !== 'HIGH' && t.priority !== 'CRITICAL') return false;
    if (selectedStatusTab === 'HIGH_RISK' && !t.isHighRisk) return false;
    if (selectedStatusTab === 'RESOLVED' && t.status !== 'APPROVED' && t.status !== 'EDITED_APPROVED' && t.status !== 'RESOLVED') return false;
    if (selectedStatusTab === 'REJECTED' && t.status !== 'REJECTED') return false;

    // Category filter
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;

    // Priority filter
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const allFilteredSelected =
    filteredTickets.length > 0 &&
    filteredTickets.every((t) => selectedTicketIds.has(t.id));

  const someFilteredSelected =
    filteredTickets.some((t) => selectedTicketIds.has(t.id)) && !allFilteredSelected;

  const handleToggleSelectAll = () => {
    const next = new Set(selectedTicketIds);
    if (allFilteredSelected) {
      filteredTickets.forEach((t) => next.delete(t.id));
    } else {
      filteredTickets.forEach((t) => next.add(t.id));
    }
    setSelectedTicketIds(next);
  };

  const handleToggleSelectTicket = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedTicketIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTicketIds(next);
  };

  const handleClearSelection = () => {
    setSelectedTicketIds(new Set());
  };

  const selectedTicketList = tickets.filter((t) => selectedTicketIds.has(t.id));
  const hasHighRiskSelected = selectedTicketList.some((t) => t.isHighRisk);

  const handleExecuteBulkApprove = async () => {
    if (selectedTicketIds.size === 0 || !onBulkApprove) return;
    setIsBulkProcessing(true);
    setBulkActionType('approve');
    try {
      await onBulkApprove(Array.from(selectedTicketIds));
      setSelectedTicketIds(new Set());
    } catch (err) {
      console.error('Bulk approval failed:', err);
    } finally {
      setIsBulkProcessing(false);
      setBulkActionType(null);
    }
  };

  const handleExecuteBulkEscalate = async () => {
    if (selectedTicketIds.size === 0 || !onBulkEscalate) return;
    setIsBulkProcessing(true);
    setBulkActionType('escalate');
    try {
      await onBulkEscalate(Array.from(selectedTicketIds));
      setSelectedTicketIds(new Set());
    } catch (err) {
      console.error('Bulk escalation failed:', err);
    } finally {
      setIsBulkProcessing(false);
      setBulkActionType(null);
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 animate-pulse"><AlertTriangle className="h-3 w-3" /> CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">LOW</span>;
    }
  };

  const getStatusBadge = (s: TicketStatus) => {
    switch (s) {
      case 'AWAITING_HUMAN_REVIEW':
      case 'NEW':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5"><Clock className="h-3 w-3 text-purple-400" /> Awaiting Review</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Approved</span>;
      case 'EDITED_APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-teal-400" /> Edited & Approved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5"><XCircle className="h-3 w-3 text-rose-400" /> Rejected</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Resolved</span>;
      case 'ESCALATED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-orange-400" /> Escalated</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden mb-8 relative">
      
      {/* Top Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60">
        
        {/* Title */}
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Ticket Verification Queue</span>
            <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
              {filteredTickets.length} tickets
            </span>
            {selectedTicketIds.size > 0 && (
              <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30">
                {selectedTicketIds.size} selected
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review AI recommendations, check boxes for bulk verification, or inspect individually.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Billing">Billing</option>
            <option value="Account Access">Account Access</option>
            <option value="Fraud/Security">Fraud / Security</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Account Management">Account Management</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 overflow-x-auto">
        {[
          { id: 'all', label: 'All Tickets' },
          { id: 'AWAITING_HUMAN_REVIEW', label: 'Pending Review' },
          { id: 'HIGH_PRIORITY', label: 'High Priority' },
          { id: 'HIGH_RISK', label: 'High-Risk Action' },
          { id: 'RESOLVED', label: 'Resolved' },
          { id: 'REJECTED', label: 'Rejected' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onStatusTabChange(tab.id)}
            className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              selectedStatusTab === tab.id
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-3 py-3 w-10 text-center">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center justify-center p-0.5"
                  title={allFilteredSelected ? 'Deselect All Filtered' : 'Select All Filtered'}
                >
                  {allFilteredSelected ? (
                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                  ) : someFilteredSelected ? (
                    <CheckSquare className="h-4 w-4 text-indigo-300/60" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3">Ticket ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Subject & Summary</th>
              <th className="px-4 py-3">Category & Dept</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">AI Confidence</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                  No tickets match the current filters.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicketIds.has(t.id);

                return (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    className={`hover:bg-slate-800/50 cursor-pointer transition-colors group ${
                      isSelected ? 'bg-indigo-950/30 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <td className="px-3 py-3.5 text-center" onClick={(e) => handleToggleSelectTicket(t.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* Ticket ID */}
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">
                      {t.id}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{t.customerName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{t.customerEmail}</div>
                    </td>

                    {/* Subject & Summary */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {t.aiAnalysis?.summary || t.description}
                      </div>
                      {t.isHighRisk && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 w-max">
                          <ShieldAlert className="h-3 w-3" />
                          <span>HIGH-RISK ACTION</span>
                        </div>
                      )}
                    </td>

                    {/* Category & Dept */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-200">{t.category}</div>
                      <div className="text-[11px] text-slate-500">{t.department}</div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      {getPriorityBadge(t.priority)}
                    </td>

                    {/* AI Confidence */}
                    <td className="px-4 py-3.5">
                      {t.aiAnalysis ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                t.aiAnalysis.confidence >= 85
                                  ? 'bg-emerald-500'
                                  : t.aiAnalysis.confidence >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${t.aiAnalysis.confidence}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-300">
                            {t.aiAnalysis.confidence}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unanalyzed</span>
                      )}
                      {t.aiAnalysis?.usedFallback && (
                        <span className="text-[9px] block text-amber-400 font-mono">
                          (Fallback)
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {getStatusBadge(t.status)}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(t.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all group-hover:translate-x-0.5"
                      >
                        <span>Review</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Action Bar for Bulk Selection */}
      {selectedTicketIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl bg-slate-900/95 border border-indigo-500/50 rounded-2xl shadow-2xl p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Left Info */}
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs shadow-md shadow-indigo-600/30">
              {selectedTicketIds.size} Selected
            </span>

            {hasHighRiskSelected && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/40 animate-pulse">
                <ShieldAlert className="h-3 w-3 text-rose-400" />
                High-Risk Selected
              </span>
            )}

            <button
              onClick={handleClearSelection}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 underline-offset-2 hover:underline ml-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Deselect</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Bulk Escalate */}
            <button
              onClick={handleExecuteBulkEscalate}
              disabled={isBulkProcessing || !onBulkEscalate}
              className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Escalate all selected tickets to Tier-2 Operations Lead"
            >
              {isBulkProcessing && bulkActionType === 'escalate' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              <span>Bulk Escalate</span>
            </button>

            {/* Bulk Approve */}
            <button
              onClick={handleExecuteBulkApprove}
              disabled={isBulkProcessing || !onBulkApprove}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 border border-emerald-400/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Verify and approve AI recommendations for all selected tickets"
            >
              {isBulkProcessing && bulkActionType === 'approve' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>Bulk Approve</span>
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

