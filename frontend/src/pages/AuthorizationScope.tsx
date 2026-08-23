import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Lock, Cpu } from 'lucide-react';

export const AuthorizationScope: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 cyber-grid flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded">
              SECURITY POLICY MATRIX
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-cyber-cyan" />
            Agent Authorization Boundary
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-white/10 text-slate-300">
            Agent: <span className="text-cyber-cyan font-bold">Refund-Ops-Agent-01</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-white/10 text-slate-300">
            Ceiling: <span className="text-emerald-400 font-bold">₹5,000</span>
          </div>
        </div>
      </div>

      {/* Tri-Column Boundary Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: FULLY AUTONOMOUS */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>PERMITTED AUTONOMOUSLY</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              SAFE
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Operations within signed scope that execute without requiring operator intervention.
          </p>

          <div className="space-y-2.5 font-mono text-xs pt-2">
            {[
              { title: 'Read Customer Profile', desc: 'Query KYC and account verification records' },
              { title: 'Query Order Status', desc: 'Fetch order dates, items, and return windows' },
              { title: 'Validate Refund Eligibility', desc: 'Compute warranty status & return rules' },
              { title: 'Disburse Refund ≤ ₹5,000', desc: 'Process payment sandbox transaction' },
              { title: 'Send Multi-Channel Confirmation', desc: 'Dispatch customer email/SMS notifications' },
              { title: 'Log Cryptographic Audit Event', desc: 'Record Merkle seal in database ledger' }
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-elevated/70 border border-emerald-500/10 space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.title}
                </div>
                <div className="text-slate-400 text-[11px] font-sans">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: REQUIRES HUMAN APPROVAL (HOLD) */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 space-y-4 shadow-glow-purple/20">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>REQUIRES APPROVAL (HOLD)</span>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
              HOLD
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            High-risk operations held at proxy boundary until authorized by a human supervisor.
          </p>

          <div className="space-y-2.5 font-mono text-xs pt-2">
            {[
              { title: 'Disburse Refund > ₹5,000', desc: 'High-value refunds (e.g. ₹15,000 hardware claim)' },
              { title: 'Modify Customer Bank Account', desc: 'Updating payout destination details' },
              { title: 'Override Return Expiration Date', desc: 'Authorizing return after 30-day window' },
              { title: 'Issue Goodwill Store Credit > ₹2,000', desc: 'Promotional compensation dispatches' }
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-elevated/70 border border-amber-500/20 space-y-1">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {item.title}
                </div>
                <div className="text-slate-400 text-[11px] font-sans">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: STRICTLY BLOCKED */}
        <div className="glass-panel p-6 rounded-2xl border border-cyber-crimson/40 space-y-4 shadow-glow-crimson/20">
          <div className="flex items-center justify-between border-b border-cyber-crimson/20 pb-3">
            <div className="flex items-center gap-2 text-cyber-crimson font-mono text-xs font-bold">
              <XCircle className="w-4 h-4" />
              <span>STRICTLY PROHIBITED</span>
            </div>
            <span className="text-[10px] font-mono bg-rose-500/10 text-cyber-crimson px-2 py-0.5 rounded border border-cyber-crimson/30">
              REJECT
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Forbidden destructive actions that are immediately denied with zero approval bypass.
          </p>

          <div className="space-y-2.5 font-mono text-xs pt-2">
            {[
              { title: 'Delete Customer Database Record', desc: 'Destructive deletion of user profiles' },
              { title: 'Modify ArmorIQ Security Policy', desc: 'Unauthorized alteration of authority ceilings' },
              { title: 'Direct Database Injection', desc: 'Arbitrary SQL execution or schema modification' },
              { title: 'Disburse to Unverified 3rd Party', desc: 'Payouts to unlinked external bank accounts' }
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-elevated/70 border border-cyber-crimson/20 space-y-1">
                <div className="text-cyber-crimson font-bold flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  {item.title}
                </div>
                <div className="text-slate-400 text-[11px] font-sans">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
