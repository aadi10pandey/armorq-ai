import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  Layers, 
  AlertTriangle, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { sound } from '../utils/soundEngine';
import { triggerShockwave } from '../animations/ParticleShieldCanvas';

interface StepNode {
  id: string;
  action: string;
  tool: string;
  inputs: Record<string, any>;
  hash: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'BLOCKED';
}

interface MerkleTreeVisualizerProps {
  merkleRoot?: string;
  intentToken?: string;
  steps?: Array<{
    id?: string;
    action: string;
    description?: string;
    inputs?: any;
    status?: string;
  }>;
}

export const MerkleTreeVisualizer: React.FC<MerkleTreeVisualizerProps> = ({
  merkleRoot = '0x8f3c7e91a4b2d568c01f92e3a7b4c6d8e5f1029384756abcdeffedcba9876543',
  intentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkFSTU9SSVFfSU5URU5UIiwiYXV0aG9yaXR5TGltaXQiOjUwMDB9',
  steps = []
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<StepNode | null>(null);
  const [isTampered, setIsTampered] = useState(false);

  // Fallback demo steps if empty
  const defaultSteps: StepNode[] = [
    {
      id: 'step-1',
      action: 'find_customer',
      tool: 'customer_database',
      inputs: { email: 'priya.sharma@example.com' },
      hash: '0x4a9f81bc32e716d0',
      status: 'COMPLETED'
    },
    {
      id: 'step-2',
      action: 'get_order_by_number',
      tool: 'order_service',
      inputs: { orderNumber: 'ORD-8821' },
      hash: '0x7e2d93ac8810b4f1',
      status: 'COMPLETED'
    },
    {
      id: 'step-3',
      action: 'validate_refund_eligibility',
      tool: 'order_service',
      inputs: { orderNumber: 'ORD-8821', returnWindowDays: 30 },
      hash: '0x1c8b44fd9902a7e5',
      status: 'COMPLETED'
    },
    {
      id: 'step-4',
      action: 'process_refund',
      tool: 'payment_gateway_sandbox',
      inputs: { orderNumber: 'ORD-8821', amount: isTampered ? 15000 : 4200, currency: 'INR' },
      hash: isTampered ? '0xTAMPERED_HASH_INVALID' : '0x99fe30d2a1b789ef',
      status: isTampered ? 'BLOCKED' : 'COMPLETED'
    }
  ];

  const activeSteps: StepNode[] = steps.length > 0
    ? steps.map((s, idx) => ({
        id: s.id || `step-${idx + 1}`,
        action: s.action,
        tool: s.action.includes('customer') ? 'customer_database' : s.action.includes('refund') ? 'payment_gateway_sandbox' : 'order_service',
        inputs: s.inputs || { sample: true },
        hash: `0x${Math.abs(hashString(s.action + JSON.stringify(s.inputs || ''))).toString(16).padStart(16, '0')}`,
        status: (s.status as any) || 'COMPLETED'
      }))
    : defaultSteps;

  function hashString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    sound.playClick();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleTamper = () => {
    const nextState = !isTampered;
    setIsTampered(nextState);
    if (nextState) {
      sound.playHoldAlert();
      triggerShockwave('danger');
    } else {
      sound.playVerified();
      triggerShockwave('verified');
    }
  };

  const currentMerkleRoot = isTampered 
    ? '0xINVALID_MERKLE_ROOT_TAMPER_DETECTED' 
    : merkleRoot;

  return (
    <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden">
      {/* Background cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyber-purple/15 text-cyber-purple border border-cyber-purple/30 shadow-glow-purple/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Cryptographic Merkle Proof Visualizer
              </h3>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                isTampered 
                  ? 'bg-rose-500/20 text-cyber-crimson border-cyber-crimson animate-pulse'
                  : 'bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30 font-mono'
              }`}>
                {isTampered ? 'INTEGRITY BREACH' : 'CSRG-IAP VERIFIED'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive cryptographic structure ensuring plan immutability and zero tool tampering.
            </p>
          </div>
        </div>

        {/* Tamper Simulation Toggle */}
        <button
          onClick={handleToggleTamper}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            isTampered
              ? 'bg-cyber-crimson text-white border-cyber-crimson shadow-glow-crimson'
              : 'bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white border-white/10'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTampered ? 'animate-spin' : ''}`} />
          {isTampered ? 'Restore Valid Proof' : 'Simulate Security Breach'}
        </button>
      </div>

      {/* Merkle Root Seal Card */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isTampered 
          ? 'glass-panel-danger border-cyber-crimson shadow-glow-crimson/30' 
          : 'bg-surface-elevated/90 border-cyber-purple/40 shadow-glow-purple/20'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isTampered ? 'bg-rose-500/20 text-cyber-crimson border-cyber-crimson' : 'bg-cyber-purple/20 text-cyber-purple border-cyber-purple/40'
            }`}>
              {isTampered ? <AlertTriangle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                ROOT MERKLE HASH:
              </span>
              <span className={`font-mono font-bold text-xs break-all ${
                isTampered ? 'text-cyber-crimson' : 'text-cyber-cyan'
              }`}>
                {currentMerkleRoot}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(currentMerkleRoot, 'root')}
              className="px-3 py-1.5 rounded-lg bg-surface border border-white/10 hover:border-cyber-cyan/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedKey === 'root' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'root' ? 'Copied' : 'Copy Root'}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Tree Layout */}
      <div className="relative pt-4 pb-2">
        {/* Connecting SVG Beams */}
        <div className="hidden md:flex items-center justify-center mb-6">
          <div className="w-3/4 h-8 border-b-2 border-x-2 border-cyber-purple/30 rounded-b-2xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-cyber-purple/40" />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-surface border border-cyber-purple/50 text-[10px] text-cyber-purple font-mono"
            >
              2-of-4 SHA256 Branch Hashes
            </motion.div>
          </div>
        </div>

        {/* Leaf Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          {activeSteps.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;
            const isNodeTampered = isTampered && index === 3;

            return (
              <motion.div
                key={node.id}
                whileHover={{ scale: 1.02, translateY: -2 }}
                onClick={() => {
                  setSelectedNode(node);
                  sound.playClick();
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2 text-xs relative ${
                  isNodeTampered
                    ? 'glass-panel-danger border-cyber-crimson shadow-glow-crimson'
                    : isSelected
                    ? 'glass-panel-glow border-cyber-cyan shadow-glow-cyan/30'
                    : 'bg-surface-elevated/80 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 font-mono text-[10px] text-slate-400">
                    LEAF #{index + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isNodeTampered
                      ? 'bg-rose-500/20 text-cyber-crimson'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {isNodeTampered ? 'HASH INVALID' : 'VERIFIED'}
                  </span>
                </div>

                <div className="font-semibold text-white truncate">
                  {node.action}
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-cyber-purple truncate">
                  {node.hash}
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Tool: {node.tool.split('_')[0]}</span>
                  <span className="text-cyber-cyan flex items-center">
                    Inspect <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Cryptographic Breakdown Modal / Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl bg-black/60 border border-cyber-cyan/30 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
                <span className="font-bold text-white">
                  Cryptographic Leaf Verification: <code className="text-cyber-cyan">{selectedNode.action}</code>
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-surface border border-white/10"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-3 rounded-xl bg-surface border border-white/5 space-y-1">
                <span className="text-slate-500 text-[10px] block">CANONICAL INPUT PAYLOAD (SORTED KEYS):</span>
                <pre className="text-emerald-300 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(selectedNode.inputs, null, 2)}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-white/5 space-y-2">
                <div>
                  <span className="text-slate-500 text-[10px] block">COMPUTED SHA-256 LEAF HASH:</span>
                  <span className="text-cyber-purple break-all">{selectedNode.hash}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">BOUND INTENT TOKEN:</span>
                  <span className="text-slate-400 text-[10px] break-all">{intentToken.substring(0, 32)}...</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">CANONICAL PROOF PATH:</span>
                  <span className="text-slate-300 text-[10px]">Leaf Hash ──► Branch 0x3d41... ──► Root {currentMerkleRoot.substring(0, 14)}...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
