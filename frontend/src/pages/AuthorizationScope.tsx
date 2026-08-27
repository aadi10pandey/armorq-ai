import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface AuthorizationScopeProps {
  onNavigateToTechnical?: () => void;
}

export const AuthorizationScope: React.FC<AuthorizationScopeProps> = ({ onNavigateToTechnical }) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full font-mono">
              SECURITY POLICY
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-cyber-cyan" />
            Agent Authority & Boundary
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs px-4 py-2 rounded-xl bg-surface-elevated border border-white/10 text-slate-300">
            Agent: <span className="text-cyber-cyan font-bold">Refund Operations Agent</span>
          </div>

          {onNavigateToTechnical && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToTechnical();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-purple/20 hover:bg-cyber-purple/30 text-cyber-purple font-semibold text-xs border border-cyber-purple/40 transition-all"
            >
              VIEW TECHNICAL POLICY
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Authority Highlight Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-cyan/30 space-y-2 bg-gradient-to-r from-surface to-surface-elevated">
        <div className="text-xs font-bold text-cyber-cyan uppercase tracking-wider font-mono">
          Active Mandate
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white">
          PROCESS ELIGIBLE CUSTOMER REFUNDS UP TO ₹5,000
        </div>
        <p className="text-xs text-slate-400">
          The agent operates with full autonomous authority within this limit. Actions exceeding ₹5,000 require human authorization.
        </p>
      </div>

      {/* 3. Tri-Column Boundary Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Allowed */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
              <CheckCircle2 className="w-4 h-4" />
              <span>Allowed Autonomously</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              NO INTERVENTION
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Standard customer service operations that execute automatically:
          </p>

          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-emerald-500/10 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Customer lookup & verification
            </li>
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-emerald-500/10 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Order lookup & history
            </li>
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-emerald-500/10 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Payment verification
            </li>
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-emerald-500/10 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Refund disbursement ≤ ₹5,000
            </li>
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-emerald-500/10 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Customer notification dispatch
            </li>
          </ul>
        </div>

        {/* Approval Required */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4 shadow-glow-purple/10">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>Approval Required (Hold)</span>
            </div>
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              SUPERVISOR SIGN-OFF
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            High-risk operations placed in hold before executing:
          </p>

          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-amber-500/20 flex items-center gap-2">
              <span className="text-amber-400 font-bold">⚠</span> Refund disbursement &gt; ₹5,000
            </li>
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-amber-500/20 flex items-center gap-2">
              <span className="text-amber-400 font-bold">⚠</span> Modify customer payout destination
            </li>
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-amber-500/20 flex items-center gap-2">
              <span className="text-amber-400 font-bold">⚠</span> Override return warranty expiration
            </li>
          </ul>
        </div>

        {/* Strictly Blocked */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-crimson/30 space-y-4 shadow-glow-crimson/10">
          <div className="flex items-center justify-between border-b border-cyber-crimson/20 pb-3">
            <div className="flex items-center gap-2 text-cyber-crimson text-xs font-bold uppercase">
              <XCircle className="w-4 h-4" />
              <span>Strictly Blocked</span>
            </div>
            <span className="text-[10px] font-bold bg-rose-500/10 text-cyber-crimson px-2.5 py-0.5 rounded-full border border-cyber-crimson/30">
              REJECTED
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Forbidden destructive actions that cannot be executed:
          </p>

          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-cyber-crimson/20 flex items-center gap-2">
              <span className="text-cyber-crimson font-bold">✕</span> Delete customer account
            </li>
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-cyber-crimson/20 flex items-center gap-2">
              <span className="text-cyber-crimson font-bold">✕</span> Change authorization rules
            </li>
            <li className="p-3 rounded-xl bg-surface-elevated/70 border border-cyber-crimson/20 flex items-center gap-2">
              <span className="text-cyber-crimson font-bold">✕</span> Direct database modification
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
