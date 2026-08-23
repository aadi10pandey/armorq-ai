import React from 'react';
import { Sparkles, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface DemoCenterProps {
  onNavigateToLive: () => void;
  onNavigateToApprovals: () => void;
  onRefresh: () => void;
}

export const DemoCenter: React.FC<DemoCenterProps> = ({
  onNavigateToLive,
  onNavigateToApprovals,
  onRefresh,
}) => {
  const handleTriggerSafe = async () => {
    onNavigateToLive();
    await api.runSafeDemo();
    onRefresh();
  };

  const handleTriggerRisky = async () => {
    onNavigateToLive();
    await api.runOutOfScopeDemo();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full">
              PRESENTATION GUIDE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyber-cyan" />
            3-Minute Hackathon Demo Script
          </h2>
        </div>

        <div className="text-xs text-slate-300 px-4 py-2 rounded-xl bg-surface-elevated border border-white/10">
          Target Duration: <span className="text-cyber-cyan font-bold">~180 Seconds</span>
        </div>
      </div>

      {/* 2. Three-Step Interactive Presentation Guide */}
      <div className="space-y-4">
        
        {/* Step 1: Safe Autonomous Work */}
        <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-2xl bg-cyber-cyan/10 text-cyber-cyan font-bold text-sm flex items-center justify-center shrink-0">
                01
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Phase 1: Autonomous Work within Authority (₹4,200 ≤ ₹5,000 Limit)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Demonstrate the AI agent independently checking customer records, validating order warranty, and disbursing an eligible ₹4,200 refund for customer Priya Sharma without any human intervention.
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerSafe}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyber-cyan text-black font-semibold text-xs shadow-glow-cyan hover:bg-cyber-cyan/90 transition-all whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-black" />
              RUN SAFE DEMO
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-white/5 text-xs text-slate-300 space-y-1">
            <span className="text-cyber-cyan font-bold block text-[11px] uppercase tracking-wider">
              Judge Narration Note:
            </span>
            <p className="leading-relaxed">
              "Notice how the agent works completely independently without any friction when actions remain within its authorized boundary of ₹5,000."
            </p>
          </div>
        </div>

        {/* Step 2: Out-of-Scope High-Risk Action */}
        <div className="glass-panel p-6 md:p-7 rounded-3xl border border-cyber-crimson/40 space-y-4 shadow-glow-crimson/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-2xl bg-cyber-crimson/20 text-cyber-crimson font-bold text-sm flex items-center justify-center shrink-0">
                02
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Phase 2: Out-of-Scope Action Blocked (₹15,000 &gt; ₹5,000 Limit)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  The agent encounters order ORD-9934 for Rahul Verma requesting a ₹15,000 refund. The action looks completely normal, but exceeds the authorized threshold. Sentinel intercepts the action before it touches the payment system and places it in HOLD.
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerRisky}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyber-crimson text-white font-semibold text-xs shadow-glow-crimson hover:bg-cyber-crimson/90 transition-all whitespace-nowrap"
            >
              <ShieldAlert className="w-4 h-4" />
              TRIGGER OUT-OF-SCOPE
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-white/5 text-xs text-slate-300 space-y-1">
            <span className="text-cyber-crimson font-bold block text-[11px] uppercase tracking-wider">
              Judge Narration Note:
            </span>
            <p className="leading-relaxed">
              "This boundary is real. The underlying payment sandbox was NOT executed. The transaction is held at the security boundary awaiting human supervisor sign-off."
            </p>
          </div>
        </div>

        {/* Step 3: Human Decision & Resumption */}
        <div className="glass-panel p-6 md:p-7 rounded-3xl border border-emerald-500/30 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0">
                03
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Phase 3: Human Decision, Resumption & Full Audit Record
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Open the Approval Center to inspect the risk differential. Click 'Approve &amp; Continue' to authorize the high-value transaction, allow the agent to finish its job, and view the immutable audit record.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToApprovals}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold text-xs shadow-glow-emerald hover:bg-emerald-400 transition-all whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              OPEN APPROVALS
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-white/5 text-xs text-slate-300 space-y-1">
            <span className="text-emerald-400 font-bold block text-[11px] uppercase tracking-wider">
              Judge Narration Note:
            </span>
            <p className="leading-relaxed">
              "Every state transition, hold, and human override is recorded in an immutable, cryptographically sealed ledger."
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
