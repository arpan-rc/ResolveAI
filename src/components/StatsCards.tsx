import React from 'react';
import { Ticket, Clock, AlertTriangle, CheckCircle, ShieldAlert, Target } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats | null;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, activeFilter, onFilterChange }) => {
  if (!stats) return null;

  const cards = [
    {
      id: 'all',
      label: 'Total Tickets',
      value: stats.totalTickets,
      subtext: 'In resolution queue',
      icon: Ticket,
      color: 'indigo',
      badge: 'Active'
    },
    {
      id: 'AWAITING_HUMAN_REVIEW',
      label: 'Pending Human Review',
      value: stats.pendingReview,
      subtext: 'Awaiting agent approval',
      icon: Clock,
      color: 'amber',
      badge: 'Action Needed'
    },
    {
      id: 'HIGH_PRIORITY',
      label: 'High & Critical',
      value: stats.highPriority + stats.criticalPriority,
      subtext: `${stats.criticalPriority} Critical urgency`,
      icon: AlertTriangle,
      color: 'rose',
      badge: 'Priority'
    },
    {
      id: 'HIGH_RISK',
      label: 'High-Risk Items',
      value: stats.highRiskCount,
      subtext: 'Refunds, Fraud, Suspensions',
      icon: ShieldAlert,
      color: 'purple',
      badge: 'Mandatory Review'
    },
    {
      id: 'RESOLVED',
      label: 'Approved & Resolved',
      value: stats.resolved,
      subtext: `${stats.approved} Direct / ${stats.editedApproved} Edited`,
      icon: CheckCircle,
      color: 'emerald',
      badge: 'Completed'
    },
    {
      id: 'accuracy',
      label: 'AI Recommendation Match',
      value: `${stats.aiAccuracyPercentage}%`,
      subtext: 'Approved without major edit',
      icon: Target,
      color: 'sky',
      badge: 'Performance'
    }
  ];

  return (
    <div className="grid grid-[#grid] grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = activeFilter === c.id;

        return (
          <button
            key={c.id}
            onClick={() => onFilterChange(c.id)}
            className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden group ${
              isSelected
                ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-slate-300">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg bg-${c.color}-500/10 text-${c.color}-400 border border-${c.color}-500/20`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="text-2xl font-black tracking-tight text-white mb-0.5 font-mono">
              {c.value}
            </div>

            <p className="text-[11px] text-slate-400 truncate">
              {c.subtext}
            </p>
          </button>
        );
      })}
    </div>
  );
};
