import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Sparkles, Cpu, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { sound } from '../utils/soundEngine';
import { triggerShockwave } from '../animations/ParticleShieldCanvas';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { workspace, setActiveAgent } = useAuth();
  const [step, setStep] = useState(1);
  
  // Agent Details
  const [agentName, setAgentName] = useState('Refund Assistant');
  const [agentDescription] = useState('Handles customer returns and warranty refund requests');
  const [agentPurpose, setAgentPurpose] = useState('Process eligible customer refunds within authorized authority bounds');
  const [maxRefundLimit, setMaxRefundLimit] = useState(5000);
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      sound.playClick();
      if (workspace) {
        const newAgent = await api.createAgent({
          name: agentName,
          description: agentDescription,
          purpose: agentPurpose,
          maxRefundLimit,
          allowedActions: ['find_customer', 'get_order_by_number', 'validate_refund_eligibility', 'process_refund', 'send_refund_confirmation'],
          approvalRequired: ['process_refund_exceeding_limit'],
          blockedActions: ['delete_customer', 'modify_system_policy']
        });
        setActiveAgent(newAgent);
      }
      sound.playVerified();
      triggerShockwave('verified');
      onComplete();
    } catch (err) {
      console.error('Onboarding agent creation failed', err);
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel p-8 md:p-10 rounded-3xl border border-white/20 shadow-2xl space-y-8 text-slate-100">
        
        {/* Progress Bar Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>ONBOARDING JOURNEY</span>
            <span className="text-cyber-cyan font-mono">STEP {step} OF 3</span>
          </div>
          <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center max-w-lg mx-auto py-4">
            <div className="w-16 h-16 rounded-2xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 flex items-center justify-center mx-auto shadow-glow-cyan">
              <Shield className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Welcome to Sentinel AI
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Give your AI agent enough authority to work independently, without allowing it to exceed your rules.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-elevated border border-white/10 text-xs text-slate-300 leading-relaxed">
              Sentinel intercepts out-of-scope actions at the cryptographic proxy layer before they can touch live financial systems or customer databases.
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setStep(2);
              }}
              className="px-8 py-3.5 rounded-2xl bg-cyber-cyan text-black font-bold text-xs shadow-glow-cyan hover:bg-cyber-cyan/90 transition-all inline-flex items-center gap-2"
            >
              CREATE YOUR FIRST AGENT
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Create Agent */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/30">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Configure Your First Agent</h3>
                <p className="text-xs text-slate-400">Define the agent's persona and primary purpose.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Refund Assistant"
                  className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Purpose & Scope</label>
                <textarea
                  rows={3}
                  value={agentPurpose}
                  onChange={(e) => setAgentPurpose(e.target.value)}
                  placeholder="Handle eligible customer refund requests within authorized bounds"
                  className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setStep(1);
                }}
                className="px-5 py-2.5 rounded-xl bg-surface-elevated text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setStep(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-cyber-cyan text-black font-bold text-xs shadow-glow-cyan hover:bg-cyber-cyan/90 transition-all flex items-center gap-2"
              >
                Next: Define Authority Boundary
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Define Authority Boundary */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Define Authority Boundary</h3>
                <p className="text-xs text-slate-400">Establish the maximum limits and permissions for this agent.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface-elevated border border-white/10 space-y-2">
                <label className="text-slate-300 font-semibold block">
                  Maximum Autonomous Refund Limit (₹)
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-emerald-400 font-mono">₹</span>
                  <input
                    type="number"
                    value={maxRefundLimit}
                    onChange={(e) => setMaxRefundLimit(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-white/10 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyber-cyan"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Any customer refund request above this amount will be automatically held for human supervisor approval.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-emerald-500/20 space-y-1.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                  </span>
                  <p className="text-slate-300 text-[11px]">Read customer, check order, process ≤ ₹{maxRefundLimit}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-amber-500/20 space-y-1.5">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Requires Approval
                  </span>
                  <p className="text-slate-300 text-[11px]">Refunds &gt; ₹{maxRefundLimit}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-cyber-crimson/20 space-y-1.5">
                  <span className="text-cyber-crimson font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Blocked
                  </span>
                  <p className="text-slate-300 text-[11px]">Delete customer, alter policy rules</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setStep(2);
                }}
                className="px-5 py-2.5 rounded-xl bg-surface-elevated text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={isSaving}
                className="px-7 py-3 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-glow-emerald hover:bg-emerald-400 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isSaving ? 'Deploying Agent...' : 'COMPLETE ONBOARDING & LAUNCH'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
