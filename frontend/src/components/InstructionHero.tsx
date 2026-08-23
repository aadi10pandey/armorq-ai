import React, { useState } from 'react';
import { Sparkles, Play, RotateCcw, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface InstructionHeroProps {
  onInstructionSubmitted: (result: any) => void;
}

export const InstructionHero: React.FC<InstructionHeroProps> = ({ onInstructionSubmitted }) => {
  const { activeAgent } = useAuth();
  const [instruction, setInstruction] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [lastInterpreted, setLastInterpreted] = useState<string | null>(null);

  const sampleInstructions = [
    { label: 'Safe Refund (₹4,200)', text: 'Process the refund for customer Priya Sharma for order ORD-8821 if eligible.' },
    { label: 'Out-of-Scope (₹15,000)', text: 'Refund order #4821 for customer Anita Desai (amount: ₹15,000).' },
    { label: 'High-Value Claim (ORD-9934)', text: 'Process customer refund for Rahul Verma on order ORD-9934 (₹15,000).' },
    { label: 'Eligibility Check Only', text: 'Check whether order ORD-3190 is eligible for a customer refund.' },
  ];

  const handleRun = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!instruction.trim() || isRunning) return;

    try {
      setIsRunning(true);
      const result = await api.runInstruction(instruction.trim(), activeAgent?.id);
      if (result.interpretedGoal) {
        setLastInterpreted(result.interpretedGoal);
      }
      onInstructionSubmitted(result);
    } catch (err) {
      console.error('Failed to run instruction', err);
    } finally {
      setIsRunning(false);
    }
  };

  const selectSample = (text: string) => {
    setInstruction(text);
  };

  return (
    <div className="glass-panel p-7 md:p-8 rounded-3xl border border-cyber-cyan/30 shadow-glow-cyan/20 space-y-6 cyber-grid">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Give Your Agent an Instruction
            </h3>
            <p className="text-xs text-slate-400">
              Active Agent: <span className="text-cyber-cyan font-semibold">{activeAgent?.name || 'Refund Operations Agent'}</span> (Ceiling: ≤ ₹{(activeAgent?.maxRefundLimit || 5000).toLocaleString('en-IN')})
            </p>
          </div>
        </div>

        <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold self-start sm:self-auto">
          ● Autonomous Engine Ready
        </span>
      </div>

      {/* Input Box */}
      <form onSubmit={handleRun} className="space-y-4">
        <div className="relative">
          <textarea
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Type any natural language instruction, e.g. 'Process the refund for customer Rahul Sharma for order #4821 if eligible...'"
            className="w-full p-4 md:p-5 rounded-2xl bg-surface-elevated/90 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all leading-relaxed"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Example Instructions to Try:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleInstructions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSample(s.text)}
                className="px-3 py-1.5 rounded-xl bg-surface border border-white/10 hover:border-cyber-cyan/40 text-xs text-slate-300 hover:text-white transition-all text-left"
              >
                <span className="text-cyber-cyan font-semibold mr-1.5">{s.label}:</span>
                <span className="text-slate-400 truncate max-w-[200px] inline-block align-bottom">{s.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {lastInterpreted ? (
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate max-w-md">Interpreted: <strong>{lastInterpreted}</strong></span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              The agent will interpret the intent and dynamically check its authority boundary.
            </div>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => { setInstruction(''); setLastInterpreted(null); }}
              className="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-400 hover:text-white text-xs font-semibold border border-white/10 transition-all"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={!instruction.trim() || isRunning}
              className="px-7 py-3 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-bold text-xs shadow-glow-cyan hover:shadow-cyan-500/50 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-black" />
              {isRunning ? 'AGENT EXECUTING...' : 'RUN AGENT'}
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};
