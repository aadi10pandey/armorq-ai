import React from 'react';
import { Sparkles, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../utils/soundEngine';
import { triggerShockwave } from '../animations/ParticleShieldCanvas';

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
    sound.playClick();
    onNavigateToLive();
    await api.runSafeDemo();
    sound.playVerified();
    triggerShockwave('verified');
    onRefresh();
  };

  const handleTriggerRisky = async () => {
    sound.playClick();
    onNavigateToLive();
    await api.runOutOfScopeDemo();
    sound.playHoldAlert();
    triggerShockwave('danger');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full font-mono">
              INTERACTIVE EXPERIENCE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyber-cyan" />
            Platform Capabilities Tour
          </h2>
        </div>

        <div className="text-xs text-slate-300 px-4 py-2 rounded-xl bg-surface-elevated border border-white/10 font-mono">
          Status: <span className="text-emerald-400 font-bold">● Active Sandbox</span>
        </div>
      </div>

      {/* 2. Three-Step Interactive Experience */}
      <div className="space-y-4">
        
        {/* Step 1: Safe Autonomous Work */}
        <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-4 hover:border-cyber-cyan/30 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyber-cyan/10 text-cyber-cyan font-black text-sm flex items-center justify-center shrink-0 font-mono border border-cyber-cyan/30">
                01
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Autonomous Execution within Authority (₹4,200 ≤ ₹5,000 Limit)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Watch the agent inspect customer records, validate order eligibility, and disburse a ₹4,200 refund for customer Priya Sharma with zero human friction.
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerSafe}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyber-cyan text-black font-black text-xs shadow-glow-cyan hover:bg-cyber-cyan/90 transition-all whitespace-nowrap uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-black" />
              RUN SAFE WORKFLOW
            </button>
          </div>
        </div>

        {/* Step 2: Out-of-Scope High-Risk Action */}
        <div className="glass-panel p-6 md:p-7 rounded-3xl border border-cyber-crimson/40 space-y-4 shadow-glow-crimson/10 hover:border-cyber-crimson/70 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyber-crimson/20 text-cyber-crimson font-black text-sm flex items-center justify-center shrink-0 font-mono border border-cyber-crimson/40">
                02
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Real-Time Interception (₹15,000 &gt; ₹5,000 Limit)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  When a task exceeds the authorized boundary, Sentinel intercepts the tool call at the proxy layer, putting the action in HOLD before it touches payment infrastructure.
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerRisky}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyber-crimson text-white font-black text-xs shadow-glow-crimson hover:bg-cyber-crimson/90 transition-all whitespace-nowrap uppercase tracking-wider"
            >
              <ShieldAlert className="w-4 h-4" />
              TRIGGER OUT-OF-SCOPE
            </button>
          </div>
        </div>

        {/* Step 3: Human Decision & Resumption */}
        <div className="glass-panel p-6 md:p-7 rounded-3xl border border-emerald-500/30 space-y-4 hover:border-emerald-500/60 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0 font-mono border border-emerald-500/30">
                03
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Human Supervisor Decision &amp; Immutable Audit Seal
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Review the risk differential in the Approval Center, authorize the transaction to resume execution, and inspect the tamper-proof cryptographic audit seal.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onNavigateToApprovals();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-black text-xs shadow-glow-emerald hover:bg-emerald-400 transition-all whitespace-nowrap uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              OPEN APPROVALS
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
