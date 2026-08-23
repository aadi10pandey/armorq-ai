import React from 'react';
import { 
  Shield, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { SystemMetrics, AuditEvent } from '../types';
import { InstructionHero } from '../components/InstructionHero';
import { useAuth } from '../hooks/useAuth';

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
  const { user, activeAgent, agents } = useAuth();

  return (
    <div className="space-y-8">
      
      {/* 1. Personalized User Welcome & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-cyber-cyan tracking-wider uppercase">
            Workspace Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Supervisor'}.
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your agents are active and protected by Sentinel's cryptographic boundary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-white/10 text-slate-300">
            Active Fleet: <span className="text-cyber-cyan font-bold">{agents.length} Agent{agents.length !== 1 ? 's' : ''}</span>
          </span>
        </div>
      </div>

      {/* 2. PRIMARY CTA: Large Input-Driven Instruction Box */}
      <InstructionHero
        onInstructionSubmitted={(_result) => {
          onNavigateToLive();
        }}
      />

      {/* 3. Personalized Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Active Agents */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Configured Agents</span>
            <Cpu className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {agents.length || 1}
          </div>
          <p className="text-[11px] text-slate-400">
            {activeAgent?.name || 'Refund Assistant'} active
          </p>
        </div>

        {/* Authorized Actions */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Authorized Actions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {metrics?.authorizedActions || 0}
          </div>
          <p className="text-[11px] text-slate-400">
            Completed within authority bounds
          </p>
        </div>

        {/* Blocked Actions */}
        <div className="glass-panel p-5 rounded-3xl border border-cyber-crimson/30 space-y-2 shadow-glow-crimson/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Blocked Actions</span>
            <Shield className="w-4 h-4 text-cyber-crimson" />
          </div>
          <div className="text-3xl font-extrabold text-cyber-crimson font-mono">
            {metrics?.blockedActions || 0}
          </div>
          <p className="text-[11px] text-slate-400">
            Intercepted before execution
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Approvals</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {metrics?.pendingApprovals || 0}
          </div>
          <p className="text-[11px] text-slate-400">
            Waiting for human supervisor
          </p>
        </div>

      </div>

      {/* 4. Split Grid: Visual Authority Boundary & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Authorization Boundary Card */}
        <div className="lg:col-span-6 glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-semibold text-cyber-cyan uppercase tracking-wider">
                Current Security Policy
              </span>
              <h3 className="text-lg font-bold text-white">Active Authority Boundary</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              ● Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Allowed */}
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-emerald-500/20 space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Allowed Autonomously:</span>
                <span className="font-mono text-[11px]">Ceiling: ≤ ₹{(activeAgent?.maxRefundLimit || 5000).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Verify customer profile, validate order eligibility, and disburse refunds up to ₹{(activeAgent?.maxRefundLimit || 5000).toLocaleString('en-IN')}.
              </p>
            </div>

            {/* Approval Required */}
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-amber-500/20 space-y-1">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span>Requires Human Approval:</span>
                <span className="font-mono text-[11px]">High-Risk Threshold</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Refund disbursements exceeding ₹{(activeAgent?.maxRefundLimit || 5000).toLocaleString('en-IN')}, bank destination updates.
              </p>
            </div>

            {/* Blocked */}
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-cyber-crimson/20 space-y-1">
              <div className="flex items-center justify-between text-cyber-crimson font-bold">
                <span>Strictly Blocked:</span>
                <span className="font-mono text-[11px]">Zero Execution</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Delete customer records, alter security policy rules, unauthenticated database access.
              </p>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Plain Language Recent Activity Feed */}
        <div className="lg:col-span-6 glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Audit Snapshot
              </span>
              <h3 className="text-lg font-bold text-white">Recent System Activity</h3>
            </div>
            <button
              onClick={onNavigateToAudit}
              className="text-xs text-cyber-cyan hover:underline font-semibold flex items-center gap-1"
            >
              Full Ledger <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {recentLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No recent activity recorded yet. Run your first instruction above!
              </div>
            ) : (
              recentLogs.slice(0, 5).map((log) => {
                const isBlocked = log.authorizationStatus === 'HOLD_REQUESTED' || log.authorizationStatus === 'OUT_OF_SCOPE_BLOCKED';
                const isApproved = log.authorizationStatus === 'HUMAN_APPROVED';

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-surface-elevated/70 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${
                        isBlocked
                          ? 'bg-rose-500/10 text-cyber-crimson border-cyber-crimson/30'
                          : isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {isBlocked ? <Shield className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {log.resultSummary}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      isBlocked
                        ? 'text-cyber-crimson bg-rose-500/10 border-cyber-crimson/30'
                        : isApproved
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      {isBlocked ? 'Blocked (Hold)' : isApproved ? 'Approved' : 'Authorized'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
