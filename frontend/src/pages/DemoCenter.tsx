import React from 'react';
import { Sparkles, Play, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
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
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded">
              GRAND FINALE PRESENTATION GUIDE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyber-cyan" />
            3-Minute Hackathon Demo Center
          </h2>
        </div>

        <div className="text-xs font-mono text-slate-300 px-3 py-1.5 rounded-lg bg-surface-elevated border border-white/10">
          Target Duration: <span className="text-cyber-cyan font-bold">~180 Seconds</span>
        </div>
      </div>

      {/* 3 Step Interactive Walkthrough */}
      <div className="space-y-4">
        
        {/* Step 1 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyber-cyan/10 text-cyber-cyan font-mono font-bold text-sm">
                01
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-mono">
                  Phase 1: Safe Autonomous Refund (₹4,200 ≤ ₹5,000 Limit)
                </h3>
                <p className="text-xs text-slate-300 font-sans max-w-2xl leading-relaxed">
                  Demonstrate the agent autonomously creating an execution plan, signing the CSRG-IAP intent token, and calling sandbox tools to disburse an eligible ₹4,200 refund for customer Priya Sharma without any human intervention.
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerSafe}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyber-cyan text-black font-mono font-bold text-xs shadow-glow-cyan hover:bg-cyber-cyan/90 transition-all whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-black" />
              RUN SAFE WORKFLOW
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated/80 border border-white/5 text-xs font-mono text-slate-400 space-y-1">
            <span className="text-cyber-cyan font-bold block">JUDGE TALKING POINT:</span>
            <p className="font-sans text-slate-300">
              "Notice how the agent operates independently with zero friction when actions remain within the cryptographically signed boundary ceiling of ₹5,000."
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="glass-panel p-6 rounded-2xl border border-cyber-crimson/40 space-y-4 shadow-glow-crimson/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyber-crimson/20 text-cyber-crimson font-mono font-bold text-sm">
                02
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-mono">
                  Phase 2: Out-of-Scope High-Risk Action (₹15,000 &gt; ₹5,000 Limit)
                </h3>
                <p className="text-xs text-slate-300 font-sans max-w-2xl leading-relaxed">
                  The agent encounters order ORD-9934 for Rahul Verma requesting a ₹15,000 refund. The action looks completely legitimate, but exceeds the authorized threshold. ArmorIQ intercepts the invocation at the proxy boundary and places it in cryptographic HOLD.
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerRisky}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyber-crimson text-white font-mono font-bold text-xs shadow-glow-crimson hover:bg-cyber-crimson/90 transition-all whitespace-nowrap"
            >
              <ShieldAlert className="w-4 h-4" />
              TRIGGER OUT-OF-SCOPE
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated/80 border border-white/5 text-xs font-mono text-slate-400 space-y-1">
            <span className="text-cyber-crimson font-bold block">JUDGE TALKING POINT:</span>
            <p className="font-sans text-slate-300">
              "This boundary is real. The underlying payment sandbox was NOT executed. The transaction is held at the cryptographic proxy layer awaiting supervisor authorization."
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono font-bold text-sm">
                03
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-mono">
                  Phase 3: Human Approval, Resumption & Immutable Audit Seal
                </h3>
                <p className="text-xs text-slate-300 font-sans max-w-2xl leading-relaxed">
                  Open the Approval Center to inspect the risk differential and policy hash. Click 'Approve &amp; Continue' to release the cryptographic hold, dispatch the sandbox payment, and seal the complete audit trail.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToApprovals}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-black font-mono font-bold text-xs shadow-glow-emerald hover:bg-emerald-400 transition-all whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              OPEN APPROVAL CENTER
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated/80 border border-white/5 text-xs font-mono text-slate-400 space-y-1">
            <span className="text-emerald-400 font-bold block">JUDGE TALKING POINT:</span>
            <p className="font-sans text-slate-300">
              "Every state transition, approval signature, and tool response is recorded in an immutable, cryptographically sealed ledger."
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
