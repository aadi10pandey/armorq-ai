import React, { useState } from 'react';
import { Sparkles, Play, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { sound } from '../utils/soundEngine';
import { triggerShockwave } from '../animations/ParticleShieldCanvas';

interface InstructionHeroProps {
  onInstructionSubmitted: (result: any) => void;
}

export const InstructionHero: React.FC<InstructionHeroProps> = ({ onInstructionSubmitted }) => {
  const { activeAgent } = useAuth();
  const [instruction, setInstruction] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [lastInterpreted, setLastInterpreted] = useState<string | null>(null);

  const sampleInstructions = [
    { label: 'Safe Refund', text: 'Process refund for customer Priya Sharma for order ORD-8821.', type: 'safe' },
    { label: 'High-Value Claim', text: 'Process customer refund for Rahul Verma on order ORD-9934 (₹15,000).', type: 'risky' },
    { label: 'Eligibility Check', text: 'Check whether order ORD-3190 is eligible for a customer refund.', type: 'info' },
    { label: 'VIP Claim Review', text: 'Refund order ORD-4821 for customer Anita Desai (amount: ₹15,000).', type: 'risky' },
  ];

  const handleRun = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!instruction.trim() || isRunning) return;

    try {
      setIsRunning(true);
      sound.playClick();
      const result = await api.runInstruction(instruction.trim(), activeAgent?.id);
      if (result.interpretedGoal) {
        setLastInterpreted(result.interpretedGoal);
      }
      sound.playVerified();
      triggerShockwave('default');
      onInstructionSubmitted(result);
    } catch (err) {
      console.error('Failed to run instruction', err);
      sound.playHoldAlert();
    } finally {
      setIsRunning(false);
    }
  };

  const selectSample = (text: string) => {
    setInstruction(text);
    sound.playHover();
  };

  const agentLimit = activeAgent?.maxRefundLimit || 5000;

  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-cyber-gold/30 shadow-glow-gold/15 space-y-5 cyber-grid relative overflow-hidden">
      
      {/* Top Bar: Objective Title & Active Agent Limit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyber-gold/15 text-cyber-gold border border-cyber-gold/30 shadow-glow-gold/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Assign Autonomous Objective
            </h3>
            <p className="text-xs text-slate-400">
              Active Agent: <strong className="text-cyber-gold">{activeAgent?.name || 'Refund Operations Agent'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Ceiling: ≤ ₹{agentLimit.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-cyber-gold bg-cyber-gold/10 px-2.5 py-1 rounded-full border border-cyber-gold/30 font-mono font-bold">
            ● ArmorIQ Guarded
          </span>
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleRun} className="space-y-4">
        <div className="relative">
          <textarea
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Type an objective (e.g. 'Process refund for customer Priya Sharma for order ORD-8821' or 'Refund order ORD-9934 for Rahul Verma')..."
            className="w-full p-4 md:p-5 rounded-2xl bg-surface-elevated/90 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-gold focus:ring-1 focus:ring-cyber-gold transition-all leading-relaxed font-sans"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sampleInstructions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectSample(s.text)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs text-slate-300 hover:text-white transition-all text-left flex items-center gap-1.5 ${
                s.type === 'safe'
                  ? 'bg-surface hover:bg-emerald-500/10 border-white/10 hover:border-emerald-500/40'
                  : s.type === 'risky'
                  ? 'bg-surface hover:bg-rose-500/10 border-white/10 hover:border-rose-500/40'
                  : 'bg-surface hover:bg-cyber-gold/10 border-white/10 hover:border-cyber-gold/40'
              }`}
            >
              <span className={`font-bold ${
                s.type === 'safe' ? 'text-emerald-400' : s.type === 'risky' ? 'text-cyber-crimson' : 'text-cyber-gold'
              }`}>
                {s.label}:
              </span>
              <span className="text-slate-400 truncate max-w-[200px] inline-block align-bottom">{s.text}</span>
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {lastInterpreted ? (
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate max-w-md">Goal: <strong>{lastInterpreted}</strong></span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono">
              Enforcing signed parameter limits prior to tool execution
            </div>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => { setInstruction(''); setLastInterpreted(null); sound.playClick(); }}
              className="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-400 hover:text-white text-xs font-semibold border border-white/10 transition-all"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={!instruction.trim() || isRunning}
              className="px-8 py-3 rounded-xl bg-cyber-gold hover:bg-cyber-yellow text-black font-black text-xs shadow-glow-gold hover:shadow-yellow-500/50 transition-all flex items-center gap-2 disabled:opacity-50 tracking-wider uppercase"
            >
              <Play className="w-4 h-4 fill-black" />
              {isRunning ? 'VERIFYING...' : 'DISPATCH AGENT'}
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};
