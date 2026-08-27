import React, { useState } from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Layers, 
  Copy, 
  Check, 
  FileCode 
} from 'lucide-react';
import { SystemMetrics } from '../types';
import { MerkleTreeVisualizer } from '../components/MerkleTreeVisualizer';
import { sound } from '../utils/soundEngine';

interface TechnicalDetailsProps {
  metrics: SystemMetrics | null;
}

export const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({ metrics }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    sound.playClick();
    setTimeout(() => setCopied(null), 2000);
  };

  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkFSTU9SSVFfSU5URU5UX1RPS0VOIn0.eyJpc3MiOiJhcm1vcmlxLWNzcmctaWFwLXYxIiwic3ViIjoic2VudGluZWwtYWRtaW5Ac2VudGluZWwuaW50ZXJuYWwiLCJhZ2VudCI6ImFnZW50LXJlZnVuZC1vcHMtMDEiLCJnb2FsIjoiUHJvY2VzcyBlbGlnaWJsZSBjdXN0b21lciByZWZ1bmRzIHVwIHRvIOKCqTUsMDAwIiwic2NvcGUiOnsibWF4UmVmdW5kTGltaXQiOjUwMDAsImN1cnJlbmN5IjoiSU5SIn19.d41d8cd98f00b204e9800998ecf8427e';

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/30 rounded-full font-mono">
              SPECIFICATIONS &amp; PROTOCOL
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5 font-mono">
            <Terminal className="w-6 h-6 text-cyber-purple" />
            ArmorIQ Cryptographic Security Architecture
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-cyber-cyan/30 text-cyber-cyan">
            SDK: <span className="font-bold">@armoriq/sdk v0.6.10</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-emerald-500/30 text-emerald-400">
            Engine: <span className="font-bold">{metrics?.armorIqStatus || 'ONLINE'}</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Merkle Proof Engine */}
      <MerkleTreeVisualizer />

      {/* 3. Four Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1: capturePlan() */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-cyber-cyan font-bold">
              <Cpu className="w-4 h-4" />
              <span>01 // capturePlan() &amp; Intent Minting</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              ACTIVE
            </span>
          </div>

          <p className="text-slate-300 font-sans leading-relaxed text-xs">
            Before execution, the agent's planned sequence of tool invocations is canonicalized with sorted keys and hashed into a <strong>SHA-256 Merkle Root</strong>. ArmorIQ mints a tamper-evident <strong>CSRG-IAP Intent Token</strong> encoding the authorized boundary ceiling (₹5,000).
          </p>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">CSRG-IAP Token Example:</span>
              <button 
                onClick={() => copyToClipboard(sampleToken, 'token')}
                className="text-cyber-cyan hover:underline text-[10px] flex items-center gap-1"
              >
                {copied === 'token' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied === 'token' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-[10px] text-slate-400 truncate break-all">
              {sampleToken}
            </div>
          </div>
        </div>

        {/* Pillar 2: invoke() & Proxy Enforcement */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-cyber-purple font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>02 // invoke() Proxy Gatekeeping</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              ENFORCING
            </span>
          </div>

          <p className="text-slate-300 font-sans leading-relaxed text-xs">
            Every tool invocation passes through the ArmorIQ verification proxy. If an action's parameters deviate from the signed intent token scope (limit ≤ ₹5,000), ArmorIQ halts execution <strong>prior to tool dispatch</strong> and triggers a cryptographic HOLD.
          </p>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-1 text-[11px]">
            <span className="text-slate-400 block">Enforcement Boundary:</span>
            <div className="text-cyber-purple">
              verifyActionBoundary(mcp, action, inputs, intentToken)
            </div>
            <div className="text-rose-300 text-[10px]">
              &gt; Status: HOLD // Zero sandbox execution leaks
            </div>
          </div>
        </div>

        {/* Pillar 3: Sandboxed MCP Tools */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>03 // Sandboxed MCP Tools</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              4 CONNECTED
            </span>
          </div>

          <p className="text-slate-300 font-sans leading-relaxed text-xs">
            The platform features 4 live sandboxed tools (Customer DB, Order Service, Payment Gateway Sandbox, Notification Dispatcher) with unique idempotency keys to prevent duplicate execution across retries.
          </p>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-1 text-[11px]">
            <span className="text-slate-400 block">Sandbox Settlement Ledger:</span>
            <div className="text-emerald-400">
              Initial Pool: ₹2,50,000 | Idempotency: Enforced
            </div>
          </div>
        </div>

        {/* Pillar 4: Cryptographic Audit Engine */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>04 // Immutable Audit Ledger</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              SEALED
            </span>
          </div>

          <p className="text-slate-300 font-sans leading-relaxed text-xs">
            Every task, step completion, security hold, and supervisor override receives an HMAC-SHA256 signature seal (<code>0x...</code>) binding all state transitions into an immutable audit chain.
          </p>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-1 text-[11px]">
            <span className="text-slate-400 block">Audit Seal Algorithm:</span>
            <div className="text-amber-300">
              generateAuditSeal(canonicalPayload, salt) → 0x{sampleToken.substring(0, 16)}...
            </div>
          </div>
        </div>

      </div>

      {/* 4. Progressive Code Verification Box */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileCode className="w-4 h-4 text-cyber-cyan" />
            <span>Core Enforcement Proxy Implementation</span>
          </div>
          <span className="text-slate-500 text-[10px]">backend/src/armoriq/client.ts</span>
        </div>

        <pre className="p-4 rounded-2xl bg-black/60 border border-white/10 text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`public async invoke(mcp, action, intentToken, inputs, toolExecutor) {
  const verification = this.verifyActionBoundary(mcp, action, inputs, intentToken);

  if (!verification.allowed) {
    // Zero tool execution on out-of-scope parameters
    return { verification };
  }

  // Safe within bounds: dispatch to sandbox
  const output = await toolExecutor(action, inputs);
  return { verification, output };
}`}
        </pre>
      </div>

    </div>
  );
};
