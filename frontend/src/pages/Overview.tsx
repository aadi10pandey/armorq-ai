import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { SystemMetrics, AuditEvent } from '../types';

interface OverviewProps {
  metrics: SystemMetrics | null;
  recentLogs: AuditEvent[];
  onNavigateToLive: () => void;
  onNavigateToApprovals: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  metrics,
  recentLogs,
  onNavigateToLive,
  onNavigateToApprovals,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Top Banner / Problem Statement */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 border border-white/10 cyber-grid">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
              ARMORIQ INTENT VERIFICATION ACTIVE
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Autonomy with a Real Cryptographic Boundary
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Sentinel AI empowers autonomous agents to execute authorized tasks freely, but cryptographically intercepts and blocks any action exceeding its signed plan before reaching live systems.
            </p>
          </div>

          <button
            onClick={onNavigateToLive}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-blue text-black font-semibold text-xs font-mono shadow-glow-cyan hover:opacity-95 transition-all whitespace-nowrap"
          >
            OPEN LIVE EXECUTION HERO
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">AUTHORIZED ACTIONS</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {metrics?.authorizedActions ?? 0}
            </span>
            <span className="text-xs text-emerald-400 flex items-center font-mono">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100% Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Autonomous steps within plan boundary</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-xl border border-cyber-crimson/30 space-y-3 shadow-glow-crimson/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyber-crimson">BLOCKED VIOLATIONS</span>
            <div className="p-2 rounded-lg bg-cyber-crimson/20 text-cyber-crimson">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyber-crimson font-mono glow-text-crimson">
              {metrics?.blockedActions ?? 0}
            </span>
            <span className="text-xs text-cyber-crimson font-mono">
              Zero execution leaks
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Out-of-scope actions held at proxy</p>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={onNavigateToApprovals}
          className="glass-panel p-5 rounded-xl border border-amber-500/30 space-y-3 cursor-pointer hover:border-amber-500/60 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400">PENDING APPROVALS</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-300 font-mono">
              {metrics?.pendingApprovals ?? 0}
            </span>
            <span className="text-xs text-amber-400 font-mono">
              Human-in-the-loop
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Actions awaiting cryptographic resume</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">PROTECTED SETTLEMENT</span>
            <div className="p-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              ₹{(metrics?.totalProtectedVolume ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Sandbox financial volume processed</p>
        </div>
      </div>

      {/* Two Column Layout: Architecture Breakdown + Live Audit Snippet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Security Architecture Concept */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 font-mono">
              <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
              ArmorIQ Cryptographic Authorization Pipeline
            </h3>
            <span className="text-xs text-slate-400 font-mono">CSRG-IAP SPEC</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-surface-elevated/80 border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-cyber-cyan tracking-wider">01 // PLAN CANONICALIZATION</span>
              <h4 className="text-xs font-semibold text-white">capturePlan()</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Agent's tool sequence is serialized and hashed into a tamper-evident SHA-256 Merkle root.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/80 border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-cyber-purple tracking-wider">02 // PROXY VERIFICATION</span>
              <h4 className="text-xs font-semibold text-white">invoke()</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every tool dispatch is checked against the signed intent token. Out-of-scope calls trigger instant HOLD.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/80 border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 tracking-wider">03 // IMMUTABLE AUDIT</span>
              <h4 className="text-xs font-semibold text-white">Cryptographic Seal</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every allow, hold, and approval event receives a verifiable cryptographic signature hash.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Audit Feed */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white font-mono">Recent Audit Events</h3>
            <span className="text-xs text-cyber-cyan font-mono">LIVE</span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-8">
                No events recorded yet. Run a demo to stream audit logs.
              </p>
            ) : (
              recentLogs.slice(0, 5).map((log) => (
                <div 
                  key={log.id} 
                  className="p-2.5 rounded-lg bg-surface-elevated/60 border border-white/5 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      log.authorizationStatus === 'AUTHORIZED' || log.authorizationStatus === 'HUMAN_APPROVED'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : log.authorizationStatus === 'HOLD_REQUESTED' || log.authorizationStatus === 'OUT_OF_SCOPE_BLOCKED'
                        ? 'text-cyber-crimson bg-rose-500/10'
                        : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {log.authorizationStatus}
                    </span>
                  </div>
                  <p className="text-slate-200 truncate">{log.resultSummary}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
