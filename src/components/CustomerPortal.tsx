import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Clock, ShieldCheck, Sparkles, User, Mail, MessageSquare, ArrowRight, FileText, Lock, ChevronRight, Download } from 'lucide-react';
import { Category, Ticket, UserSession } from '../types';
import { generateInvoicePDF, isFinancialTicket } from '../utils/pdfGenerator';

interface CustomerPortalProps {
  onSubmitTicket: (data: {
    customerName: string;
    customerEmail: string;
    subject: string;
    description: string;
    suggestedCategory?: Category;
  }) => Promise<Ticket | null>;
  allTickets: Ticket[];
  recentSubmittedTicket: Ticket | null;
  userSession?: UserSession | null;
  onSwitchToAgentRole?: () => void;
  isCustomerStandalone?: boolean;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  onSubmitTicket,
  allTickets,
  recentSubmittedTicket,
  userSession,
  onSwitchToAgentRole,
  isCustomerStandalone = false
}) => {
  const [customerName, setCustomerName] = useState(userSession?.name || 'Alex Johnson');
  const [customerEmail, setCustomerEmail] = useState(userSession?.email || 'alex.johnson@example.com');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'my-tickets'>('submit');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(recentSubmittedTicket);

  useEffect(() => {
    if (userSession) {
      setCustomerName(userSession.name);
      setCustomerEmail(userSession.email);
    }
  }, [userSession]);

  // Filter tickets matching customer email strictly
  const customerTickets = allTickets.filter(
    (t) => t.customerEmail.toLowerCase() === customerEmail.toLowerCase() || (selectedTicket && t.id === selectedTicket.id)
  );

  const presets = [
    {
      label: '1. Duplicate Charge (Billing)',
      name: userSession?.name || 'Aarav Sharma',
      email: userSession?.email || 'aarav.sharma@example.com',
      subject: 'I was charged twice for my subscription renewal',
      description: 'I noticed two separate debits for $49.00 on my credit card statement today for the monthly subscription renewal. Please refund one of the duplicate charges.',
      category: 'Billing' as Category
    },
    {
      label: '2. Login / Password Reset',
      name: userSession?.name || 'Aarav Sharma',
      email: userSession?.email || 'aarav.sharma@example.com',
      subject: 'I cannot log into my account and 2FA is failing',
      description: 'I updated my password yesterday and now I cannot log into my account. The 2FA reset code is not arriving in my inbox.',
      category: 'Account Access' as Category
    },
    {
      label: '3. Security / Fraud Alert',
      name: userSession?.name || 'Aarav Sharma',
      email: userSession?.email || 'aarav.sharma@example.com',
      subject: 'Unauthorized login detected from unknown location',
      description: 'I received an email notification for an unauthorized password change attempt on my account. Please freeze my account and investigate immediately!',
      category: 'Fraud/Security' as Category
    },
    {
      label: '4. Change Email Request',
      name: userSession?.name || 'Aarav Sharma',
      email: userSession?.email || 'aarav.sharma@example.com',
      subject: 'How can I update my registered account email address?',
      description: 'I recently changed my business domain name and would like to update my registered support email address.',
      category: 'Account Management' as Category
    },
    {
      label: '5. Technical App Crash',
      name: userSession?.name || 'Aarav Sharma',
      email: userSession?.email || 'aarav.sharma@example.com',
      subject: 'The app crashes every time I upload a document',
      description: 'Whenever I try uploading an attachment in the web application, the page freezes and displays an error code.',
      category: 'Technical Support' as Category
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSubject(p.subject);
    setDescription(p.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !subject || !description) return;

    setIsSubmitting(true);
    const created = await onSubmitTicket({
      customerName,
      customerEmail,
      subject,
      description
    });
    setIsSubmitting(false);

    if (created) {
      setSelectedTicket(created);
      setSubject('');
      setDescription('');
      setActiveTab('my-tickets');
    }
  };

  const handleDownloadInvoice = (ticket: Ticket) => {
    generateInvoicePDF(ticket);
  };

  const getCustomerStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'AI_ANALYZING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 flex items-center gap-1.5 animate-pulse">
            <Clock className="h-3.5 w-3.5 text-indigo-500" /> AI ANALYZING
          </span>
        );
      case 'AWAITING_HUMAN_REVIEW':
      case 'ESCALATED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-purple-500" /> AWAITING HUMAN REVIEW
          </span>
        );
      case 'APPROVED':
      case 'EDITED_APPROVED':
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> APPROVED / RESOLVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-rose-500" /> REJECTED / REWORK
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Customer Header Banner */}
      <div className="text-center space-y-3 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden transition-colors">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>ResolveAI Customer Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome, {customerName}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Submit your support request below. Every response is triaged by AI and verified by a human specialist before delivery.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'submit'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Submit New Support Request</span>
        </button>
        <button
          onClick={() => setActiveTab('my-tickets')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'my-tickets'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>My Submitted Tickets ({customerTickets.length})</span>
        </button>
      </div>

      {activeTab === 'submit' && (
        <div className="space-y-6">
          {/* Preset Quick Loader Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-md space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              ⚡ Demo Test Templates (Click to Auto-Fill):
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form & Sidebar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-500" />
                  <span>New Support Request</span>
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">Human Oversight Guaranteed</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Customer Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="e.g. alex@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject / Short Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. I was charged twice for my subscription"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Problem Description *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe what happened in detail..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Ticket...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Sidebar Guide */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  <span>How Our Support Flow Works</span>
                </h3>

                <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold shrink-0 flex items-center justify-center text-xs">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">Instant Ticket Creation</strong>
                      You receive a unique Ticket ID as soon as you submit your request.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold shrink-0 flex items-center justify-center text-xs">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">AI Triage & Classification</strong>
                      Our system analyzes your issue to assign priority and department routing.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold shrink-0 flex items-center justify-center text-xs">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">Human Agent Review</strong>
                      A human specialist verifies every response before it is delivered to you.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold shrink-0 flex items-center justify-center text-xs">
                      4
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">Resolution & PDF Export</strong>
                      Inspect your response and download official invoice PDFs directly from your portal.
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* MY TICKETS TAB */}
      {activeTab === 'my-tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Ticket List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span>Your Support Tickets</span>
              <span className="text-xs text-slate-500 font-mono">{customerTickets.length} found</span>
            </h3>

            {customerTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-xs">No tickets found for {customerEmail}.</p>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Submit a ticket now
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {customerTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-50 dark:bg-slate-800 border-indigo-500 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">{t.id}</span>
                        {getCustomerStatusBadge(t.status)}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">{t.subject}</h4>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex justify-between items-center">
                        <span>Submitted {new Date(t.createdAt).toLocaleDateString()}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ticket Detail Inspection (7 cols) */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-black text-indigo-600 dark:text-indigo-400">{selectedTicket.id}</span>
                      {getCustomerStatusBadge(selectedTicket.status)}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">{selectedTicket.subject}</h2>
                  </div>
                  
                  {/* Download PDF Button */}
                  <button
                    onClick={() => handleDownloadInvoice(selectedTicket)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition-all active:scale-95 shrink-0"
                    title="Download Official Record PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>
                      {isFinancialTicket(selectedTicket) ? 'Download Invoice PDF' : 'Download Support Resolution PDF'}
                    </span>
                  </button>
                </div>

                {/* Problem Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Your Submitted Description:
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Status Explanation Card */}
                {selectedTicket.status === 'AWAITING_HUMAN_REVIEW' || selectedTicket.status === 'NEW' ? (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span>Status: AWAITING HUMAN REVIEW</span>
                    </div>
                    <p className="text-purple-900 dark:text-purple-200/90 leading-relaxed">
                      Your ticket has been triaged by AI and is currently queued for review by a human support agent.
                    </p>
                  </div>
                ) : null}

                {/* Final Response Card */}
                {selectedTicket.status === 'APPROVED' || selectedTicket.status === 'EDITED_APPROVED' || selectedTicket.status === 'RESOLVED' ? (
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/40 rounded-xl space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Official Support Team Resolution</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/20">
                        Human Verified
                      </span>
                    </div>

                    <div className="text-xs text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed py-1 font-sans">
                      {selectedTicket.humanReview?.finalResponse || selectedTicket.aiAnalysis?.draftResponse}
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Reviewed & Approved by Support Specialist</span>
                      <button
                        onClick={() => handleDownloadInvoice(selectedTicket)}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>
                          {isFinancialTicket(selectedTicket) ? 'Download Official Invoice' : 'Download Resolution Record'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Rejection Notification */}
                {selectedTicket.status === 'REJECTED' && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                      <Clock className="h-4 w-4 text-rose-500" />
                      <span>Status: Under Rework</span>
                    </div>
                    <p className="text-rose-900 dark:text-rose-200/90 leading-relaxed">
                      Our support team requested additional internal review for this request. An agent will follow up shortly.
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
                <FileText className="h-10 w-10 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold">Select a ticket on the left to view details, resolution status, and download invoice PDF.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

