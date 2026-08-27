import React from 'react';
import { 
  Shield, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { SystemMetrics, AuditEvent } from '../types';
import { InstructionHero } from '../components/InstructionHero';
import { InterceptionRadar } from '../components/InterceptionRadar';
import { TiltCard } from '../components/TiltCard';
import { useAuth } from '../hooks/useAuth';
import { sound } from '../utils/soundEngine';

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
  onNavigateToAudit,
}) => {
  const { user, activeAgent, agents } = useAuth();

  return (
    <div className="space-y-8">
      
      {/* 1. Personalized User Welcome & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            CONTROL PLANE // VIBE ACTIVE
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Welcome, <span className="vibe-text-gradient">{user?.name?.split(' ')[0] || 'Supervisor'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Autonomous fleet operating within cryptographic boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-4 py-2 rounded-2xl bg-surface-elevated border border-white/10 text-slate-300 font-mono shadow-sm">
            Active Fleet: <strong className="text-cyber-cyan font-bold">{agents.length} Agent{agents.length !== 1 ? 's' : ''}</strong>
          </span>
        </div>
      </div>

      {/* 2. PRIMARY CTA: Large Input-Driven Instruction Box */}
      <InstructionHero
        onInstructionSubmitted={(_result) => {
          onNavigateToLive();
        }}
      />

      {/* 3. Personalized 3D Tilt Bento Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Active Agents */}
        <TiltCard glowColor="cyan" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Active Fleet</span>
            <Cpu className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="text-4xl font-black text-white font-mono tracking-tight">
            {agents.length || 1}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {activeAgent?.name || 'Refund Assistant'} online
          </p>
        </TiltCard>

        {/* Authorized Actions */}
        <TiltCard glowColor="emerald" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Authorized Actions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-4xl font-black text-emerald-400 font-mono tracking-tight glow-text-emerald">
            {metrics?.authorizedActions || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" /> Safe within authority
          </p>
        </TiltCard>

        {/* Blocked Actions */}
        <TiltCard glowColor="crimson" className="p-5 space-y-2 glass-panel-danger border-cyber-crimson/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Interceptions (Hold)</span>
            <Shield className="w-4 h-4 text-cyber-crimson" />
          </div>
          <div className="text-4xl font-black text-cyber-crimson font-mono tracking-tight glow-text-crimson">
            {metrics?.blockedActions || 0}
          </div>
          <p className="text-[11px] text-rose-300/80 font-medium">
            Zero tool dispatch leaks
          </p>
        </TiltCard>

        {/* Protected Volume */}
        <TiltCard glowColor="purple" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Protected Volume</span>
            <AlertTriangle className="w-4 h-4 text-cyber-purple" />
          </div>
          <div className="text-4xl font-black text-cyber-purple font-mono tracking-tight">
            ₹{((metrics?.totalProtectedVolume || 35200) / 1000).toFixed(1)}k
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Enforced across sandbox
          </p>
        </TiltCard>

      </div>

      {/* 4. Interactive Threat & Interception Radar HUD */}
      <InterceptionRadar maxLimit={activeAgent?.maxRefundLimit || 5000} />

      {/* 5. Split Grid: Visual Authority Boundary & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Authorization Boundary Card */}
        <div className="lg:col-span-6 glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-cyber-cyan uppercase tracking-widest font-mono">
                SECURITY CEILING
              </span>
              <h3 className="text-lg font-bold text-white">Active Authority Scope</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
              ● Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Allowed */}
            <div className="p-4 rounded-2xl bg-surface-elevated border border-emerald-500/20 space-y-1 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Allowed Autonomously:</span>
                <span className="font-mono text-[11px]">Limit: ≤ ₹{(activeAgent?.maxRefundLimit || 5000).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Read customer profile, inspect order eligibility, and disburse refunds up to ₹{(activeAgent?.maxRefundLimit || 5000).toLocaleString('en-IN')}.
              </p>
            </div>

            {/* Approval Required */}
            <div className="p-4 rounded-2xl bg-surface-elevated border border-amber-500/20 space-y-1 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span>Requires Human Approval:</span>
                <span className="font-mono text-[11px]">High-Risk Threshold</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Refund disbursements exceeding ₹{(activeAgent?.maxRefundLimit || 5000).toLocaleString('en-IN')}, payout destination alterations.
              </p>
            </div>

            {/* Blocked */}
            <div className="p-4 rounded-2xl bg-surface-elevated border border-cyber-crimson/20 space-y-1 hover:border-cyber-crimson/40 transition-all">
              <div className="flex items-center justify-between text-cyber-crimson font-bold">
                <span>Strictly Blocked:</span>
                <span className="font-mono text-[11px]">Zero Execution</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Delete customer records, alter policy rules, unauthenticated database drops.
              </p>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Plain Language Recent Activity Feed */}
        <div className="lg:col-span-6 glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                TELEMETRY FEED
              </span>
              <h3 className="text-lg font-bold text-white">Recent System Activity</h3>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToAudit();
              }}
              className="text-xs text-cyber-cyan hover:underline font-semibold flex items-center gap-1"
            >
              Full Ledger <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {recentLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                Awaiting first agent action...
              </div>
            ) : (
              recentLogs.slice(0, 5).map((log) => {
                const isBlocked = log.authorizationStatus === 'HOLD_REQUESTED' || log.authorizationStatus === 'OUT_OF_SCOPE_BLOCKED';
                const isApproved = log.authorizationStatus === 'HUMAN_APPROVED';

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-surface-elevated/70 border border-white/5 flex items-center justify-between text-xs hover:border-white/15 transition-all"
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

                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border font-mono ${
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
