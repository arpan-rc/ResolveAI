import React, { useState } from 'react';
import { Send, CheckCircle2, Clock, ShieldCheck, Sparkles, User, Mail, MessageSquare, ArrowRight, Bot, RefreshCw, FileText, Lock, ChevronRight, Check } from 'lucide-react';
import { Category, Ticket } from '../types';

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
  onSwitchToAgentRole?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  onSubmitTicket,
  allTickets,
  recentSubmittedTicket,
  onSwitchToAgentRole
}) => {
  const [customerName, setCustomerName] = useState('Alex Johnson');
  const [customerEmail, setCustomerEmail] = useState('alex.johnson@example.com');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'my-tickets'>('submit');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(recentSubmittedTicket);

  // Filter tickets matching customer email
  const customerTickets = allTickets.filter(
    (t) => t.customerEmail.toLowerCase() === customerEmail.toLowerCase() || (selectedTicket && t.id === selectedTicket.id)
  );

  const presets = [
    {
      label: '1. Duplicate Charge (Billing)',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      subject: 'I was charged twice for my subscription.',
      description: 'I noticed two separate debits for $29.99 on my credit card statement today for the monthly subscription renewal. Please refund one of the duplicate charges.',
      category: 'Billing' as Category
    },
    {
      label: '2. Login Issue',
      name: 'Sarah Connor',
      email: 's.connor@example.com',
      subject: 'I cannot log into my account.',
      description: 'I updated my password yesterday and now I cannot log into my account. The reset code is not arriving in my inbox.',
      category: 'Account Access' as Category
    },
    {
      label: '3. Security / Fraud',
      name: 'Michael Chang',
      email: 'm.chang@example.com',
      subject: 'My account was hacked and I see an unauthorized transaction.',
      description: 'I received an email notification for an unauthorized wire transfer attempt on my account to an unknown recipient. Please freeze my account and investigate immediately!',
      category: 'Fraud/Security' as Category
    },
    {
      label: '4. Change Email',
      name: 'Elena Rostova',
      email: 'elena.r@example.com',
      subject: 'How can I change my email address?',
      description: 'I recently changed my domain name and would like to update my registered email address to elena@newdomain.com.',
      category: 'Account Management' as Category
    },
    {
      label: '5. App Crash',
      name: 'David Miller',
      email: 'd.miller@example.com',
      subject: 'The app crashes every time I upload a photo.',
      description: 'Whenever I try uploading an image attachment in the web application, the page freezes and displays a HTTP 500 error.',
      category: 'Technical Support' as Category
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setCustomerName(p.name);
    setCustomerEmail(p.email);
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

  const getCustomerStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'AI_ANALYZING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 animate-pulse">
            <Clock className="h-3.5 w-3.5 text-indigo-400" /> AI ANALYZING
          </span>
        );
      case 'AWAITING_HUMAN_REVIEW':
      case 'ESCALATED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-purple-400" /> AWAITING HUMAN REVIEW
          </span>
        );
      case 'APPROVED':
      case 'EDITED_APPROVED':
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> APPROVED / RESOLVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-rose-400" /> REJECTED / REWORK
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Customer Header Banner */}
      <div className="text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 opacity-50 blur-xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>ResolveAI Customer Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          How can we help you today?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Submit your request below. Your issue will be instantly triaged by our system and reviewed by our human support specialists.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'submit'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
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
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>My Submitted Tickets ({customerTickets.length})</span>
        </button>
      </div>

      {activeTab === 'submit' && (
        <div className="space-y-6">
          {/* Preset Quick Loader Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              ⚡ Demo Test Cases (Click to Auto-Fill):
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form & Sidebar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  <span>New Support Request</span>
                </h2>
                <span className="text-xs text-slate-400">Human Oversight Guaranteed</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Customer Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="e.g. alex@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Subject / Short Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. I was charged twice for my subscription"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Problem Description *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe what happened in detail..."
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Ticket...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Sidebar Guide */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span>How Our Support Flow Works</span>
                </h3>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold shrink-0 flex items-center justify-center text-xs">
                      1
                    </div>
                    <div>
                      <strong className="text-white block">Instant Ticket Creation</strong>
                      You receive a unique Ticket ID as soon as you submit your request.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold shrink-0 flex items-center justify-center text-xs">
                      2
                    </div>
                    <div>
                      <strong className="text-white block">AI Triage & Classification</strong>
                      Our system analyzes your issue to assign priority and department routing.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold shrink-0 flex items-center justify-center text-xs">
                      3
                    </div>
                    <div>
                      <strong className="text-white block">Human Support Agent Review</strong>
                      A human specialist verifies every response before it is delivered to you.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold shrink-0 flex items-center justify-center text-xs">
                      4
                    </div>
                    <div>
                      <strong className="text-white block">Final Resolution</strong>
                      You can view the final verified response directly in your Customer Portal.
                    </div>
                  </div>
                </div>

                {onSwitchToAgentRole && (
                  <div className="pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={onSwitchToAgentRole}
                      className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-indigo-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Switch to Support Agent View</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

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
            <h3 className="text-sm font-bold text-white flex items-center justify-between pb-2 border-b border-slate-800">
              <span>Your Support Tickets</span>
              <span className="text-xs text-slate-400 font-mono">{customerTickets.length} found</span>
            </h3>

            {customerTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs">No tickets found for {customerEmail}.</p>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="text-xs font-bold text-indigo-400 hover:underline"
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
                          ? 'bg-slate-800 border-indigo-500 shadow-lg'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-indigo-400 text-xs">{t.id}</span>
                        {getCustomerStatusBadge(t.status)}
                      </div>
                      <h4 className="text-xs font-bold text-white truncate mt-1">{t.subject}</h4>
                      <div className="text-[10px] text-slate-400 mt-2 flex justify-between items-center">
                        <span>Submitted {new Date(t.createdAt).toLocaleDateString()}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-black text-indigo-400">{selectedTicket.id}</span>
                      {getCustomerStatusBadge(selectedTicket.status)}
                    </div>
                    <h2 className="text-base font-bold text-white mt-1">{selectedTicket.subject}</h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(selectedTicket.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Problem Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Your Submitted Description:
                  </label>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Status Explanation Card */}
                {selectedTicket.status === 'AWAITING_HUMAN_REVIEW' || selectedTicket.status === 'NEW' ? (
                  <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-purple-300">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <span>Status: AWAITING HUMAN REVIEW</span>
                    </div>
                    <p className="text-purple-200/90 leading-relaxed">
                      Your ticket has been analyzed by our automated triage system and is currently queued for review by a human support specialist.
                    </p>
                  </div>
                ) : null}

                {/* Final Response Card */}
                {selectedTicket.status === 'APPROVED' || selectedTicket.status === 'EDITED_APPROVED' || selectedTicket.status === 'RESOLVED' ? (
                  <div className="p-5 bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/40 rounded-xl space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Official Support Team Resolution</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Human Verified
                      </span>
                    </div>

                    <div className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed py-1 font-sans">
                      {selectedTicket.humanReview?.finalResponse || selectedTicket.aiAnalysis?.draftResponse}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Reviewed & Approved by Support Specialist</span>
                      <span className="text-emerald-400 font-semibold font-mono">Status: RESOLVED</span>
                    </div>
                  </div>
                ) : null}

                {/* Rejection Notification */}
                {selectedTicket.status === 'REJECTED' && (
                  <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-rose-300">
                      <Clock className="h-4 w-4 text-rose-400" />
                      <span>Status: Under Rework</span>
                    </div>
                    <p className="text-rose-200/90 leading-relaxed">
                      Our support team requested additional internal review for this request. An agent will follow up shortly.
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
                <FileText className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold">Select a ticket on the left to view details and resolution status.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
