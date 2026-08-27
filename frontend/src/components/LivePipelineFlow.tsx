import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface LivePipelineFlowProps {
  workflowStatus?: 'IDLE' | 'PLANNING' | 'EXECUTING' | 'SECURITY_HOLD' | 'COMPLETED' | 'FAILED' | 'INITIALIZING';
  currentAmount?: number;
  maxLimit?: number;
  onNodeClick?: (nodeId: string) => void;
}

export const LivePipelineFlow: React.FC<LivePipelineFlowProps> = ({
  workflowStatus = 'IDLE',
  currentAmount = 4200,
  maxLimit = 5000,
}) => {
  const [activeInfoNode, setActiveInfoNode] = useState<string | null>(null);

  const isHold = workflowStatus === 'SECURITY_HOLD' || currentAmount > maxLimit;
  const isExecuting = workflowStatus === 'EXECUTING';
  const isCompleted = workflowStatus === 'COMPLETED';

  const nodeDetails: Record<string, { title: string; desc: string; tech: string }> = {
    prompt: {
      title: '01 // Natural Language Intent',
      desc: 'User gives high-level instructions (e.g. "Process refund for order #ORD-8821"). Intent is parsed and converted into a canonical multi-step plan.',
      tech: 'Intent Canonicalizer + Goal Normalization'
    },
    llm: {
      title: '02 // Autonomous Agent LLM Planner',
      desc: 'Generates structured JSON tool calls. Computes SHA-256 Merkle root over the planned sequence of operations before any execution.',
      tech: 'LLM Orchestrator + Merkle Tree Constructor'
    },
    armoriq: {
      title: '03 // ArmorIQ Cryptographic Interceptor Proxy',
      desc: 'Mints tamper-evident CSRG-IAP Intent Token. Intercepts each tool call before dispatch to verify parameter bounds against authorized limit (≤ ₹' + maxLimit.toLocaleString('en-IN') + ').',
      tech: 'ArmorIQ SDK (CSRG-IAP Protocol Engine)'
    },
    sandbox: {
      title: '04A // Sandboxed MCP Tools (Authorized)',
      desc: 'When parameters are within limits (₹' + currentAmount.toLocaleString('en-IN') + ' ≤ ₹' + maxLimit.toLocaleString('en-IN') + '), actions execute safely in sandbox with idempotency guarantees.',
      tech: 'Payment Gateway Sandbox + Customer DB MCP'
    },
    hold: {
      title: '04B // Human Approval Gate (Out-of-Scope HOLD)',
      desc: 'When parameters exceed authority (₹' + currentAmount.toLocaleString('en-IN') + ' > ₹' + maxLimit.toLocaleString('en-IN') + '), ArmorIQ halts execution immediately before tool dispatch.',
      tech: 'Zero-Execution Interceptor + HMAC Approval Lock'
    }
  };

  const openNodeInfo = (id: string) => {
    setActiveInfoNode(id);
    sound.playClick();
  };

  return (
    <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-glow-cyan/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Live Architecture & Cryptographic Enforcement Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              Real-time visualization of agent reasoning, intent token validation, and proxy interception.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`px-3 py-1 rounded-full font-bold border transition-all ${
            isHold
              ? 'bg-rose-500/20 text-cyber-crimson border-cyber-crimson shadow-glow-crimson animate-pulse'
              : isExecuting
              ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan shadow-glow-cyan animate-pulse'
              : isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
              : 'bg-white/5 text-slate-400 border-white/10'
          }`}>
            {isHold ? '● HOLD // PROXY INTERCEPTED' : isExecuting ? '● AGENT EXECUTING' : isCompleted ? '● COMPLETED' : '● PIPELINE READY'}
          </span>
        </div>
      </div>

      {/* Interactive Flow Nodes */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Node 1: Intent Input (3 cols) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => openNodeInfo('prompt')}
          className="md:col-span-3 p-4 rounded-2xl bg-surface-elevated/90 border border-white/10 hover:border-cyber-cyan/40 cursor-pointer space-y-2 relative transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[10px] text-cyber-cyan">STAGE 01</span>
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
          </div>
          <h4 className="font-bold text-white text-xs">User Prompt</h4>
          <p className="text-[11px] text-slate-300 line-clamp-2">
            Natural language objective ingested into agent workflow.
          </p>
          <div className="text-[10px] text-cyber-cyan flex items-center gap-1 font-semibold pt-1">
            <Info className="w-3 h-3" /> Technical Specs
          </div>
        </motion.div>

        {/* Arrow 1 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center">
          <div className="w-full flex items-center justify-center relative">
            <div className="w-full h-0.5 bg-gradient-to-r from-cyber-cyan/50 to-cyber-purple/50" />
            <ArrowRight className="w-4 h-4 text-cyber-cyan absolute -right-1" />
          </div>
        </div>

        {/* Node 2: LLM Planner (3 cols) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => openNodeInfo('llm')}
          className="md:col-span-3 p-4 rounded-2xl bg-surface-elevated/90 border border-cyber-purple/30 hover:border-cyber-purple/60 cursor-pointer space-y-2 relative transition-all shadow-glow-purple/10"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[10px] text-cyber-purple">STAGE 02</span>
            <Cpu className="w-4 h-4 text-cyber-purple" />
          </div>
          <h4 className="font-bold text-white text-xs">AI Agent Planner</h4>
          <p className="text-[11px] text-slate-300 line-clamp-2">
            Constructs plan & calculates canonical SHA-256 Merkle root.
          </p>
          <div className="text-[10px] text-cyber-purple flex items-center gap-1 font-semibold pt-1">
            <Info className="w-3 h-3" /> Merkle Hashing
          </div>
        </motion.div>

        {/* Arrow 2 */}
        <div className="hidden md:flex md:col-span-1 justify-center items-center">
          <div className="w-full flex items-center justify-center relative">
            <div className="w-full h-0.5 bg-gradient-to-r from-cyber-purple/50 to-cyber-cyan/50" />
            <ArrowRight className="w-4 h-4 text-cyber-purple absolute -right-1" />
          </div>
        </div>

        {/* Node 3: ArmorIQ Proxy Interceptor (4 cols) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => openNodeInfo('armoriq')}
          className={`md:col-span-4 p-4 rounded-2xl border cursor-pointer space-y-2 relative transition-all ${
            isHold
              ? 'glass-panel-danger border-cyber-crimson shadow-glow-crimson/30'
              : 'glass-panel-glow border-cyber-cyan/60 shadow-glow-cyan/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className={`font-mono text-[10px] font-bold ${isHold ? 'text-cyber-crimson' : 'text-cyber-cyan'}`}>
              STAGE 03 // GATEKEEPER
            </span>
            <Lock className={`w-4 h-4 ${isHold ? 'text-cyber-crimson' : 'text-cyber-cyan'}`} />
          </div>
          <h4 className="font-bold text-white text-xs">ArmorIQ Interception Proxy</h4>
          <div className="text-[11px] text-slate-200">
            {isHold ? (
              <span className="text-rose-300 font-bold">
                ⚠️ Out-of-Scope (₹{currentAmount.toLocaleString('en-IN')} &gt; ₹{maxLimit.toLocaleString('en-IN')})
              </span>
            ) : (
              <span className="text-emerald-300 font-semibold">
                ✓ Within Bounds (≤ ₹{maxLimit.toLocaleString('en-IN')})
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
            <span>Signed Token Active</span>
            <span className="text-cyber-cyan font-semibold flex items-center gap-0.5">
              Inspect <Info className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

      </div>

      {/* Dynamic Branching Outcomes (Lower Half) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 relative z-10">
        
        {/* Pass Branch */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => openNodeInfo('sandbox')}
          className={`p-4 rounded-2xl border cursor-pointer space-y-2 transition-all ${
            !isHold
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-glow-emerald/20'
              : 'bg-surface/40 border-white/5 opacity-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> PATH A: Autonomous Tool Settlement
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
              SAFE
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Payment Gateway Sandbox and customer records updated idempotently. Zero human friction.
          </p>
        </motion.div>

        {/* Hold Branch */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => openNodeInfo('hold')}
          className={`p-4 rounded-2xl border cursor-pointer space-y-2 transition-all ${
            isHold
              ? 'glass-panel-danger border-cyber-crimson shadow-glow-crimson'
              : 'bg-surface/40 border-white/5 opacity-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyber-crimson font-bold text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> PATH B: Human Supervisor Decision (HOLD)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-cyber-crimson font-bold">
              INTERCEPTED
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Execution halted in HOLD. Payment system is never touched until human supervisor authorizes.
          </p>
        </motion.div>

      </div>

      {/* Interactive Detail Modal / Inspector Drawer */}
      <AnimatePresence>
        {activeInfoNode && nodeDetails[activeInfoNode] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-5 rounded-2xl bg-surface-elevated border border-cyber-cyan/30 text-xs space-y-2 relative z-20"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="font-bold text-white text-sm">
                {nodeDetails[activeInfoNode].title}
              </h4>
              <button
                onClick={() => setActiveInfoNode(null)}
                className="px-2 py-1 rounded-lg bg-surface hover:bg-white/10 text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {nodeDetails[activeInfoNode].desc}
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-cyber-cyan">
              Engine Component: {nodeDetails[activeInfoNode].tech}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
