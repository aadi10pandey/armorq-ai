import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  FileCode, 
  Database, 
  CreditCard, 
  UserCheck, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';
import { sound } from '../utils/soundEngine';

export const ArchitecturePipeline: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'SAFE' | 'VIOLATION'>('SAFE');

  const steps = [
    {
      num: '01',
      title: 'Natural Language Input',
      desc: 'Operator gives instruction to the AI agent.',
      icon: Sparkles,
      safeDetail: '"Process refund for Priya Sharma (ORD-8821)"',
      violationDetail: '"Refund order ORD-9934 for Rahul Verma (₹15,000)"',
    },
    {
      num: '02',
      title: 'Intent & Entity Extraction',
      desc: 'Agent parses target customer, order & amount.',
      icon: Database,
      safeDetail: 'Resolved: ORD-8821 · Amount: ₹4,200',
      violationDetail: 'Resolved: ORD-9934 · Amount: ₹15,000',
    },
    {
      num: '03',
      title: 'SHA-256 Merkle Plan',
      desc: 'Plan canonicalized & hashed into Merkle Tree.',
      icon: FileCode,
      safeDetail: 'Leaf Hashes computed → Root: 0x8a9f...c2',
      violationDetail: 'Leaf Hashes computed → Root: 0x4e2b...d1',
    },
    {
      num: '04',
      title: 'CSRG-IAP Token Minting',
      desc: 'ArmorIQ mints signed boundary token.',
      icon: Key,
      safeDetail: 'Token bound to limit: ≤ ₹5,000',
      violationDetail: 'Token bound to limit: ≤ ₹5,000',
    },
    {
      num: '05',
      title: 'ArmorIQ Proxy Gate',
      desc: 'Evaluates parameter before tool execution.',
      icon: Lock,
      isGate: true,
      safeDetail: '₹4,200 ≤ ₹5,000 → PASS (ALLOWED)',
      violationDetail: '₹15,000 > ₹5,000 → INTERCEPT (HOLD)',
    },
    {
      num: '06',
      title: activeScenario === 'SAFE' ? 'Autonomous Settlement' : 'Human Approval Center',
      desc: activeScenario === 'SAFE' ? 'Payment gateway sandbox executes refund.' : 'Zero sandbox execution. Human review required.',
      icon: activeScenario === 'SAFE' ? CreditCard : UserCheck,
      safeDetail: 'Order REFUNDED · Settlement Ref: PG_REF_8821',
      violationDetail: 'Action in HOLD · Approval Request #appr_9934 generated',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Scenario Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-elevated border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-cyber-gold bg-cyber-gold/10 border border-cyber-gold/30 rounded-full font-mono">
              HOW IT WORKS
            </span>
            <span className="text-xs text-slate-400">
              Interactive Execution &amp; Boundary Flow
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Cryptographic Intent Authorization Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold">
          <button
            onClick={() => {
              sound.playClick();
              setActiveScenario('SAFE');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeScenario === 'SAFE'
                ? 'bg-emerald-500 text-black font-bold shadow-glow-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Safe Path (₹4,200)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveScenario('VIOLATION');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeScenario === 'VIOLATION'
                ? 'bg-cyber-crimson text-white font-bold shadow-glow-crimson'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Out-of-Scope Path (₹15,000)</span>
          </button>
        </div>
      </div>

      {/* 6-Step Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isGate = step.isGate;
          const isHoldState = activeScenario === 'VIOLATION' && idx >= 4;

          return (
            <div
              key={step.num}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
                isGate
                  ? activeScenario === 'SAFE'
                    ? 'glass-panel-emerald border-emerald-500/50 shadow-glow-emerald/20'
                    : 'glass-panel-danger border-cyber-crimson/60 shadow-glow-crimson/25 animate-pulse-slow'
                  : isHoldState
                  ? 'glass-panel-danger border-cyber-crimson/30'
                  : 'glass-panel border-white/10 hover:border-cyber-gold/30'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isGate
                      ? activeScenario === 'SAFE'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-rose-500/20 text-cyber-crimson border-rose-500/40'
                      : 'bg-cyber-gold/10 text-cyber-gold border-cyber-gold/30'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      STEP {step.num}
                    </span>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {step.title}
                    </h4>
                  </div>
                </div>

                {isGate && (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border uppercase tracking-wider ${
                    activeScenario === 'SAFE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    THE GATE
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {step.desc}
              </p>

              {/* Dynamic State Box */}
              <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 ${
                isHoldState
                  ? 'bg-black/50 border-rose-500/30 text-rose-300'
                  : 'bg-black/40 border-white/5 text-slate-300'
              }`}>
                <span className="text-[9px] text-slate-500 font-sans uppercase font-bold block">
                  {activeScenario === 'SAFE' ? 'Safe Execution State:' : 'Out-of-Scope State:'}
                </span>
                <div className="font-semibold truncate">
                  {activeScenario === 'SAFE' ? step.safeDetail : step.violationDetail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-surface-elevated border border-cyber-gold/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-cyber-gold shrink-0" />
          <span>
            <strong>Zero-Leakage Guarantee:</strong> Out-of-scope actions are blocked at the ArmorIQ Verification Proxy <em>before</em> touching payment sandboxes.
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyber-gold font-semibold shrink-0">
          ● SHA-256 Merkle Proof Verified
        </span>
      </div>

    </div>
  );
};
