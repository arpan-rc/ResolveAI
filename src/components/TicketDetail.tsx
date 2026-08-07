import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Send, 
  RotateCcw, Sparkles, UserCheck, Bot, Clock, Mail, ChevronRight, MessageSquare, 
  History, User, FileText, Check, AlertCircle, Edit3, ArrowUpRight, Zap
} from 'lucide-react';
import { AuditLog, Category, Department, Priority, Ticket } from '../types';

interface TicketDetailProps {
  ticket: Ticket;
  auditLogs: AuditLog[];
  onBack: () => void;
  onApprove: (data: { category: Category; priority: Priority; department: Department; finalResponse: string }) => void;
  onReject: (reason: string) => void;
  onEscalate: (note: string) => void;
  onReAnalyze: (id: string, forceFallback?: boolean) => void;
  isSubmitting: boolean;
  isAnalyzing: boolean;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  auditLogs,
  onBack,
  onApprove,
  onReject,
  onEscalate,
  onReAnalyze,
  isSubmitting,
  isAnalyzing
}) => {
  // Editable Human Decision Form state
  const [category, setCategory] = useState<Category>(ticket.category);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [department, setDepartment] = useState<Department>(ticket.department);
  const [finalResponse, setFinalResponse] = useState<string>('');

  // Modals & UI states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationNote, setEscalationNote] = useState('');
  const [activeTab, setActiveTab] = useState<'review' | 'preview' | 'audit'>('review');

  // Initialize form when ticket changes
  useEffect(() => {
    setCategory(ticket.category);
    setPriority(ticket.priority);
    setDepartment(ticket.department);
    
    // Set response text (human final if present, otherwise AI draft, otherwise empty)
    if (ticket.humanReview?.finalResponse) {
      setFinalResponse(ticket.humanReview.finalResponse);
    } else if (ticket.aiAnalysis?.draftResponse) {
      setFinalResponse(ticket.aiAnalysis.draftResponse);
    } else {
      setFinalResponse('');
    }
  }, [ticket]);

  const isEdited = 
    ticket.aiAnalysis &&
    (category !== ticket.aiAnalysis.category ||
     priority !== ticket.aiAnalysis.priority ||
     department !== ticket.aiAnalysis.department ||
     finalResponse.trim() !== ticket.aiAnalysis.draftResponse.trim());

  const handleInsertSnippet = (snippet: string) => {
    setFinalResponse((prev) => prev ? `${prev}\n\n${snippet}` : snippet);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-black text-indigo-400">{ticket.id}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {ticket.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-base font-bold text-white mt-0.5">{ticket.subject}</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onReAnalyze(ticket.id, false)}
            disabled={isAnalyzing}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Re-trigger AI Analysis"
          >
            <RotateCcw className={`h-3.5 w-3.5 text-indigo-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-Analyze</span>
          </button>
          <button
            onClick={() => onReAnalyze(ticket.id, true)}
            disabled={isAnalyzing}
            className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Force Deterministic Fallback Mode for Testing"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Force Fallback</span>
          </button>
        </div>
      </div>

      {/* Progress Workflow Bar & Decision Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
        {/* Explicit Flow Callout Banner */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono font-bold tracking-wider text-slate-300 bg-slate-950/80 py-1.5 px-3 rounded-lg border border-slate-800">
          <span className="text-indigo-400">AI RECOMMENDATION</span>
          <span className="text-slate-500">↓</span>
          <span className="text-purple-400">HUMAN VERIFICATION</span>
          <span className="text-slate-500">↓</span>
          <span className="text-emerald-400">FINAL DECISION</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-lg shadow-indigo-600/30 mb-1">
              1
            </div>
            <span className="font-semibold text-slate-200">Ticket Submitted</span>
            <span className="text-[10px] text-slate-400">By Customer</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs mb-1 ${
              ticket.aiAnalysis 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'bg-slate-800 text-slate-500'
            }`}>
              2
            </div>
            <span className={`font-semibold ${ticket.aiAnalysis ? 'text-slate-200' : 'text-slate-500'}`}>
              AI Recommendation
            </span>
            <span className="text-[10px] text-slate-400">
              {ticket.aiAnalysis ? ticket.aiAnalysis.providerName : 'Pending'}
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs mb-1 ${
              ticket.status === 'AWAITING_HUMAN_REVIEW'
                ? 'bg-purple-600 text-white ring-4 ring-purple-500/20 animate-pulse'
                : ticket.humanReview
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-500'
            }`}>
              3
            </div>
            <span className="font-semibold text-slate-200">Human Verification</span>
            <span className="text-[10px] text-slate-400">Agent Oversight</span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs mb-1 ${
              ticket.status === 'APPROVED' || ticket.status === 'EDITED_APPROVED' || ticket.status === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : ticket.status === 'REJECTED'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-500'
            }`}>
              4
            </div>
            <span className="font-semibold text-slate-200">Action & Dispatch</span>
            <span className="text-[10px] text-slate-400">Customer Resolution</span>
          </div>

        </div>
      </div>

      {/* Mandatory Safeguard Warnings */}
      {ticket.isHighRisk && (
        <div className="bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-900 border-2 border-rose-500/50 rounded-xl p-4 shadow-xl flex items-start gap-3.5">
          <ShieldAlert className="h-6 w-6 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded">
                🔴 HIGH-RISK ACTION
              </span>
              <span className="text-sm font-bold text-rose-200">
                Mandatory Human Approval Required
              </span>
            </div>
            <p className="text-xs text-rose-300 mt-1 leading-relaxed">
              This ticket involves financial refunds, security credentials, or fraud verification ({ticket.aiAnalysis?.riskReason || 'Sensitive action'}). 
              <strong className="text-white"> AI cannot automatically execute or send this action without verified human agent sign-off.</strong>
            </p>
          </div>
        </div>
      )}

      {ticket.aiAnalysis && ticket.aiAnalysis.confidence < 75 && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-4 shadow-lg flex items-start gap-3.5">
          <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                ⚠️ LOW AI CONFIDENCE ({ticket.aiAnalysis.confidence}%)
              </span>
            </div>
            <p className="text-xs text-amber-200 mt-1">
              The AI model is uncertain regarding classification. Please carefully verify the category and department before approving.
            </p>
          </div>
        </div>
      )}

      {/* Main Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Customer Ticket Details & AI Analysis (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Customer Ticket Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Customer Submission</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(ticket.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Name:</span>
                <span className="font-semibold text-slate-200">{ticket.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Email:</span>
                <span className="font-mono text-slate-300">{ticket.customerEmail}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Description
              </label>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">AI Analysis & Recommendation</h3>
              </div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {ticket.aiAnalysis?.providerName || 'AI Engine'}
              </span>
            </div>

            {ticket.aiAnalysis ? (
              <div className="space-y-4 text-xs">
                
                {/* Categorization Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Suggested Category</span>
                    <span className="font-bold text-slate-200 text-sm mt-0.5 block">{ticket.aiAnalysis.category}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Suggested Priority</span>
                    <span className="font-bold text-amber-400 text-sm mt-0.5 block">{ticket.aiAnalysis.priority}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Assigned Dept</span>
                    <span className="font-bold text-slate-200 text-sm mt-0.5 block">{ticket.aiAnalysis.department}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customer Sentiment</span>
                    <span className="font-bold text-purple-300 text-sm mt-0.5 block">{ticket.aiAnalysis.sentiment}</span>
                  </div>
                </div>

                {/* AI Confidence Breakdown */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-300">AI Confidence Score</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{ticket.aiAnalysis.confidence}%</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${ticket.aiAnalysis.confidence}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 pt-1 text-center font-mono">
                    <div>Category: {ticket.aiAnalysis.confidenceScores?.category || 90}%</div>
                    <div>Priority: {ticket.aiAnalysis.confidenceScores?.priority || 85}%</div>
                    <div>Dept: {ticket.aiAnalysis.confidenceScores?.department || 88}%</div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    AI Summary
                  </span>
                  <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    {ticket.aiAnalysis.summary}
                  </p>
                </div>

                {/* Suggested Action */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Suggested Recommended Action
                  </span>
                  <p className="text-indigo-300 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-500/20 font-medium">
                    {ticket.aiAnalysis.suggestedAction}
                  </p>
                </div>

                {/* Safe Decision Reasoning */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Decision Reasoning Logic
                  </span>
                  <p className="text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] italic">
                    "{ticket.aiAnalysis.decisionReasoning}"
                  </p>
                </div>

                {/* Original AI Draft Response */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    AI Drafted Response
                  </span>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {ticket.aiAnalysis.draftResponse}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                AI Analysis pending or disabled. Click "Re-Analyze" above.
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Human Decision Workspace & Final Action (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tabs for Review vs Preview vs Audit */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex gap-1">
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'review'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Human Review Workspace</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Customer Response Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
          </div>

          {/* TAB 1: Human Review Workspace */}
          {activeTab === 'review' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-indigo-400" />
                    <span>Agent Final Decision & Override</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verify or override AI recommendations before dispatching response.
                  </p>
                </div>

                {isEdited && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" />
                    Human Overrides Applied
                  </span>
                )}
              </div>

              {/* Editable Categorization Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Category Dropdown */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Final Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Billing">Billing</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Fraud/Security">Fraud / Security</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Account Management">Account Management</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                {/* Priority Dropdown */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Final Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                {/* Department Dropdown */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Routing Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Security">Security</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

              </div>

              {/* Quick Macro Snippets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">
                  Quick Response Templates / Macro Inserters
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleInsertSnippet('We have verified your account details and initiated a priority refund review with Finance.')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-indigo-300 font-medium transition-colors"
                  >
                    + Insert Refund Verification
                  </button>
                  <button
                    onClick={() => handleInsertSnippet('Please follow the secure password reset link sent directly to your registered email address.')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-indigo-300 font-medium transition-colors"
                  >
                    + Insert 2FA Reset Link
                  </button>
                  <button
                    onClick={() => handleInsertSnippet('As an added precaution, your active account sessions have been locked while our Security Team investigates.')}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-rose-300 font-medium transition-colors"
                  >
                    + Insert Security Lock Notice
                  </button>
                </div>
              </div>

              {/* Editable Response Text Area */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Final Verified Response to Customer</span>
                    {isEdited && (
                      <span className="text-[10px] text-amber-400 font-mono">(Custom Edited)</span>
                    )}
                  </label>
                  <button
                    onClick={() => setFinalResponse(ticket.aiAnalysis?.draftResponse || '')}
                    className="text-[11px] text-slate-400 hover:text-indigo-400 underline"
                  >
                    Reset to AI Draft
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={finalResponse}
                  onChange={(e) => setFinalResponse(e.target.value)}
                  placeholder="Draft response to customer..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>

              {/* Human Decision Signature */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <span>Verified Reviewer: <strong className="text-slate-200">Agent Sarah Jenkins</strong></span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Authority: Human Agent Level 2</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                
                {/* Rejection & Escalation */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject AI Rec</span>
                  </button>

                  <button
                    onClick={() => setShowEscalateModal(true)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Escalate</span>
                  </button>
                </div>

                {/* Approve & Send */}
                <button
                  onClick={() =>
                    onApprove({
                      category,
                      priority,
                      department,
                      finalResponse
                    })
                  }
                  disabled={isSubmitting || !finalResponse.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 w-full sm:w-auto"
                >
                  <Send className="h-4 w-4" />
                  <span>{isEdited ? 'Approve Edits & Dispatch' : 'Approve & Dispatch Response'}</span>
                </button>

              </div>

            </div>
          )}

          {/* TAB 2: Customer Email Preview Simulator */}
          {activeTab === 'preview' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-400" />
                  <span>Customer Email Preview</span>
                </h3>
                <span className="text-xs text-slate-400">Recipient: {ticket.customerEmail}</span>
              </div>

              {/* Email Container Mock */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs font-sans">
                <div className="border-b border-slate-800 pb-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">From:</span>
                    <span className="text-slate-200 font-semibold">ResolveAI Support &lt;support@resolveai.app&gt;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">To:</span>
                    <span className="text-slate-200 font-mono">{ticket.customerName} &lt;{ticket.customerEmail}&gt;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subject:</span>
                    <span className="text-indigo-300 font-bold">Re: [{ticket.id}] {ticket.subject}</span>
                  </div>
                </div>

                <div className="py-2 text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {finalResponse || ticket.humanReview?.finalResponse || ticket.aiAnalysis?.draftResponse || 'No response drafted yet.'}
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
                  <span>Verified and sent via ResolveAI Human-in-the-Loop Gateway</span>
                  <span className="font-mono text-emerald-400">✓ Cryptographically Signed</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Audit Trail Timeline */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-400" />
                  <span>Complete Audit Trail History</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative group">
                    <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 ${
                      log.actorRole === 'HUMAN_AGENT'
                        ? 'bg-emerald-500 border-slate-900 ring-2 ring-emerald-500/20'
                        : log.actorRole === 'AI_SYSTEM'
                        ? 'bg-indigo-500 border-slate-900 ring-2 ring-indigo-500/20'
                        : 'bg-slate-600 border-slate-900'
                    }`} />

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.actor}</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                            log.actorRole === 'HUMAN_AGENT'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : log.actorRole === 'AI_SYSTEM'
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {log.actorRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-mono">{log.action}</p>
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-400" />
              <span>Reject AI Recommendation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide a reason for rejecting the AI recommendation. The ticket will be returned for manual rework.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. AI misclassified customer intent. Issue requires phone follow-up..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReject(rejectionReason);
                  setShowRejectModal(false);
                }}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESCALATE MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span>Escalate Ticket to Tier-2 / Manager</span>
            </h3>
            <p className="text-xs text-slate-400">
              Escalate this high-risk or ambiguous ticket for secondary manager authorization.
            </p>

            <textarea
              rows={4}
              value={escalationNote}
              onChange={(e) => setEscalationNote(e.target.value)}
              placeholder="e.g. High-value refund request exceeding standard threshold. Requires Tier-2 approval..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEscalate(escalationNote);
                  setShowEscalateModal(false);
                }}
                disabled={!escalationNote.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
