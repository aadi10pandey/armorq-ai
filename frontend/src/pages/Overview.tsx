import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  ArrowRight,
  Play,
  XCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { SystemMetrics, AuditEvent } from '../types';
import { api } from '../services/api';

interface OverviewProps {
  metrics: SystemMetrics | null;
  recentLogs: AuditEvent[];
  onNavigateToLive: () => void;
  onNavigateToApprovals: () => void;
  onNavigateToAudit: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  metrics,
  recentLogs,
  onNavigateToLive,
  onNavigateToApprovals,
  onNavigateToAudit,
}) => {
  const [isRunningSafe, setIsRunningSafe] = React.useState(false);

  const handleRunSafe = async () => {
    try {
      setIsRunningSafe(true);
      onNavigateToLive();
      await api.runSafeDemo();
    } catch (err) {
      console.error('Error running safe demo', err);
    } finally {
      setIsRunningSafe(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10 border border-white/10 cyber-grid">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Agent Security & Authorization Platform
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Autonomous work. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-purple">
              Human control where it matters.
            </span>
          </h2>

          <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
            Sentinel lets AI agents complete authorized tasks independently while stopping actions that exceed their authority.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleRunSafe}
              disabled={isRunningSafe}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-semibold text-xs transition-all shadow-glow-cyan"
            >
              <Play className="w-4 h-4 fill-black" />
              {isRunningSafe ? 'Starting Workflow...' : 'RUN SAFE DEMO'}
            </button>

            <button
              onClick={onNavigateToLive}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-200 hover:text-white font-semibold text-xs border border-white/10 transition-all"
            >
              VIEW LIVE EXECUTION
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Status Cards (User-Understandable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Authorized Actions */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Authorized Actions
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {metrics?.authorizedActions ?? 0}
          </div>
          <p className="text-xs text-slate-400">
            Actions completed within authority
          </p>
        </div>

        {/* Card 2: Blocked Actions */}
        <div className="glass-panel p-6 rounded-2xl border border-cyber-crimson/30 space-y-2 shadow-glow-crimson/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyber-crimson uppercase tracking-wider">
              Blocked Actions
            </span>
            <div className="p-2 rounded-xl bg-cyber-crimson/15 text-cyber-crimson">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-cyber-crimson font-mono glow-text-crimson">
            {metrics?.blockedActions ?? 0}
          </div>
          <p className="text-xs text-rose-300/80">
            Actions stopped before execution
          </p>
        </div>

        {/* Card 3: Pending Approvals */}
        <div 
          onClick={onNavigateToApprovals}
          className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-2 cursor-pointer hover:border-amber-500/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-300 font-mono">
            {metrics?.pendingApprovals ?? 0}
          </div>
          <p className="text-xs text-slate-400">
            Decisions waiting for a human
          </p>
        </div>

        {/* Card 4: Protected Activity */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Protected Activity
            </span>
            <div className="p-2 rounded-xl bg-cyber-cyan/10 text-cyber-cyan">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            ₹{(metrics?.totalProtectedVolume ?? 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400">
            Sandbox activity protected by Sentinel
          </p>
        </div>

      </div>

      {/* 3. Hero Visual: Autonomy Boundary + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: The Authorization Boundary Representation */}
        <div className="lg:col-span-7 glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Agent Authority Boundary
                </h3>
                <p className="text-xs text-slate-400">
                  Agent: <span className="text-cyber-cyan font-semibold">Refund Operations Agent</span>
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
              Ceiling: ≤ ₹5,000
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Allowed inside boundary */}
            <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorized</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span> Read customer data
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span> Check order status
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span> Verify payment
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span> Refund ≤ ₹5,000
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span> Notify customer
                </li>
              </ul>
            </div>

            {/* Approval Required */}
            <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-amber-500/20 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Requires Approval</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400">⚠</span> Refund &gt; ₹5,000
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400">⚠</span> Change payment info
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400">⚠</span> Override return limit
                </li>
              </ul>
            </div>

            {/* Strictly Blocked */}
            <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-cyber-crimson/20 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyber-crimson">
                <XCircle className="w-4 h-4" />
                <span>Blocked</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-cyber-crimson">✕</span> Delete customer
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyber-crimson">✕</span> Alter authority rules
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyber-crimson">✕</span> Direct DB query
                </li>
              </ul>
            </div>

          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              The agent works autonomously within bounds. High-risk actions halt before execution.
            </span>
            <button
              onClick={onNavigateToLive}
              className="text-cyber-cyan hover:underline font-semibold flex items-center gap-1 shrink-0 ml-2"
            >
              Test Boundary <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Human-Understandable Recent Activity */}
        <div className="lg:col-span-5 glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">
                Recent Activity
              </h3>
              <span className="text-xs text-cyber-cyan font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
                Live
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {recentLogs.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  No activity recorded yet. Run a demo to stream actions.
                </div>
              ) : (
                recentLogs.slice(0, 6).map((log) => {
                  const isBlocked = log.authorizationStatus === 'HOLD_REQUESTED' || log.authorizationStatus === 'OUT_OF_SCOPE_BLOCKED';
                  const isApproved = log.authorizationStatus === 'HUMAN_APPROVED';

                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                        isBlocked
                          ? 'bg-rose-500/10 border-cyber-crimson/30 text-rose-200'
                          : isApproved
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-surface-elevated/70 border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold flex items-center gap-1.5">
                          {isBlocked ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-cyber-crimson shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[200px]">
                            {log.action === 'process_refund' 
                              ? `Refund ₹${log.details?.requestedAmount || log.details?.amount || 4200}`
                              : log.action.replace(/_/g, ' ')}
                          </span>
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {formatTimeAgo(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-5">
                        {log.resultSummary}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={onNavigateToAudit}
            className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-all text-center flex items-center justify-center gap-2"
          >
            VIEW FULL AUDIT TRAIL
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
