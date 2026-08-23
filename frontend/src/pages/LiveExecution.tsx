import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Sparkles, 
  Lock, 
  UserCheck, 
  XCircle,
  Play
} from 'lucide-react';
import { useSentinelEvents } from '../hooks/useSentinelEvents';
import { api } from '../services/api';

interface LiveExecutionProps {
  onRefreshData?: () => void;
}

export const LiveExecution: React.FC<LiveExecutionProps> = ({ onRefreshData }) => {
  const {
    activePlan,
    activeStepIndex,
    workflowStatus,
    violationEvent,
    pendingApproval,
    liveLogs,
    resetLiveState
  } = useSentinelEvents();

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    if (!pendingApproval) return;
    try {
      setIsApproving(true);
      await api.approveRequest(pendingApproval.id, 'Grand Finale Judge / Security Admin');
      onRefreshData?.();
    } catch (err) {
      console.error('Error approving action', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!pendingApproval) return;
    try {
      setIsRejecting(true);
      await api.rejectRequest(pendingApproval.id, 'Grand Finale Judge / Security Admin');
      onRefreshData?.();
    } catch (err) {
      console.error('Error rejecting action', err);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Workflow Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 cyber-grid flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded">
              HERO EXECUTION PIPELINE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              REAL-TIME CRYPTOGRAPHIC ENFORCEMENT
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-cyber-cyan" />
            Live Agent Intent & Boundary Monitor
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border ${
            workflowStatus === 'SECURITY_HOLD'
              ? 'bg-cyber-crimson/20 border-cyber-crimson text-cyber-crimson shadow-glow-crimson animate-pulse'
              : workflowStatus === 'EXECUTING'
              ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-glow-cyan'
              : workflowStatus === 'COMPLETED'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              : 'bg-surface-elevated border-white/10 text-slate-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            STATUS: {workflowStatus}
          </div>

          <button
            onClick={resetLiveState}
            className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-white bg-surface-elevated rounded-xl border border-white/10 hover:border-white/20 transition-all"
          >
            Clear View
          </button>
        </div>
      </div>

      {/* Main Execution Split View: Left (Workflow Graph) & Right (Telemetry & Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: The Visual Node Workflow */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Captured Intent & Merkle Token Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-sm font-semibold text-white font-mono">
                  STAGE 1 // AUTHORIZED USER INTENT & CSRG-IAP TOKEN
                </h3>
              </div>
              <span className="text-xs text-cyber-cyan font-mono bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/20">
                LIMIT: ≤ ₹5,000
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-surface-elevated/90 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 tracking-wider">DECLARATIVE GOAL:</span>
                <p className="text-sm text-slate-100 font-sans font-medium">
                  {activePlan?.goal || '"Process eligible customer refunds up to ₹5,000 autonomously."'}
                </p>
              </div>

              {activePlan && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-surface border border-white/5">
                    <span className="text-slate-500 block mb-0.5">PLAN MERKLE ROOT:</span>
                    <span className="text-cyber-cyan break-all">{activePlan.merkleRoot}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-white/5">
                    <span className="text-slate-500 block mb-0.5">INTENT TOKEN (CSRG-IAP):</span>
                    <span className="text-cyber-purple truncate block">{activePlan.intentToken}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Step-by-Step Tool Execution Pipeline */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyber-purple" />
                STAGE 2 // STEP-BY-STEP PROXY INVOCATIONS
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {activePlan ? `${activePlan.steps.length} Steps Registered` : 'Idle'}
              </span>
            </div>

            {!activePlan ? (
              <div className="text-center py-12 space-y-3 font-mono">
                <p className="text-sm text-slate-400">No active execution running.</p>
                <p className="text-xs text-slate-500">
                  Click <span className="text-cyber-cyan">RUN SAFE DEMO</span> or <span className="text-cyber-crimson">TRIGGER OUT-OF-SCOPE</span> in the header to initiate live agent execution.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePlan.steps.map((step, idx) => {
                  const isBlocked = step.status === 'BLOCKED';
                  const isExecuting = step.status === 'EXECUTING';
                  const isCompleted = step.status === 'COMPLETED';

                  return (
                    <motion.div
                      key={step.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-xl border transition-all ${
                        isBlocked
                          ? 'glass-panel-danger border-cyber-crimson/80'
                          : isExecuting
                          ? 'glass-panel-glow border-cyber-cyan/60'
                          : isCompleted
                          ? 'bg-surface-elevated/80 border-emerald-500/30'
                          : 'bg-surface/50 border-white/5 text-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-lg text-xs font-mono font-bold ${
                            isBlocked
                              ? 'bg-cyber-crimson/20 text-cyber-crimson'
                              : isExecuting
                              ? 'bg-cyber-cyan/20 text-cyber-cyan animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 text-slate-500'
                          }`}>
                            0{step.stepNumber}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white font-mono">
                                {step.action}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-white/10 text-slate-400">
                                {step.mcp}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-sans">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              AUTHORIZED
                            </span>
                          )}

                          {isExecuting && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-cyber-cyan bg-cyber-cyan/10 px-2.5 py-1 rounded-lg border border-cyber-cyan/30 animate-pulse">
                              <Play className="w-3 h-3 fill-cyber-cyan" />
                              VERIFYING...
                            </span>
                          )}

                          {isBlocked && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-cyber-crimson bg-cyber-crimson/20 px-2.5 py-1 rounded-lg border border-cyber-crimson shadow-glow-crimson font-bold">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              BLOCKED / HOLD
                            </span>
                          )}

                          {step.status === 'PENDING' && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                              <Clock className="w-3.5 h-3.5" />
                              QUEUED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expanded Output / Error Details */}
                      {step.output && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] font-mono text-emerald-400/90 bg-black/30 p-2.5 rounded-lg overflow-x-auto">
                          <span className="text-slate-500 block mb-1">OUTPUT PAYLOAD:</span>
                          <pre className="whitespace-pre-wrap">{JSON.stringify(step.output, null, 2)}</pre>
                        </div>
                      )}

                      {step.error && (
                        <div className="mt-3 pt-2.5 border-t border-cyber-crimson/30 text-[11px] font-mono text-cyber-crimson bg-cyber-crimson/10 p-2.5 rounded-lg">
                          <span className="font-bold block mb-1">ARMORIQ INTERVENTION:</span>
                          {step.error}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. High-Risk Intervention Banner (When Security Hold occurs) */}
          <AnimatePresence>
            {workflowStatus === 'SECURITY_HOLD' && pendingApproval && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="glass-panel-danger p-6 rounded-2xl border-2 border-cyber-crimson shadow-glow-crimson space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyber-crimson/20 border border-cyber-crimson/60 text-cyber-crimson animate-pulse">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <span>ARMORIQ SCOPE VIOLATION DETECTED</span>
                      </h3>
                      <p className="text-xs text-rose-200">
                        Action intercepted and halted prior to sandbox execution. Human authorization required.
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 text-xs font-bold font-mono bg-cyber-crimson text-white rounded-lg">
                    CRITICAL HOLD
                  </span>
                </div>

                {/* Diff Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-slate-400 block">AUTHORIZED MAXIMUM:</span>
                    <span className="text-lg font-bold text-emerald-400">₹5,000</span>
                    <p className="text-[10px] text-slate-500">Signed under Intent Token CSRG-IAP</p>
                  </div>

                  <div className="p-3 rounded-xl bg-cyber-crimson/20 border border-cyber-crimson/40 space-y-1">
                    <span className="text-cyber-crimson block font-bold">ATTEMPTED DISBURSEMENT:</span>
                    <span className="text-lg font-bold text-cyber-crimson glow-text-crimson">
                      ₹{(pendingApproval.requestedAmount || 15000).toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-rose-300">Exceeds boundary policy by ₹10,000</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-cyber-crimson/30">
                  <button
                    onClick={handleReject}
                    disabled={isRejecting || isApproving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white font-mono text-xs border border-white/10 transition-all"
                  >
                    <XCircle className="w-4 h-4 text-slate-400" />
                    {isRejecting ? 'REJECTING...' : 'REJECT & TERMINATE'}
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs shadow-glow-emerald transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    {isApproving ? 'AUTHORIZING & RESUMING...' : 'APPROVE & CONTINUE (RESUME AGENT)'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right 1 Col: Real-time Telemetry & Live Terminal Logs */}
        <div className="space-y-6">
          
          {/* Real-time Event Terminal */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 flex flex-col h-[580px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-xs font-bold text-white font-mono">
                  LIVE TELEMETRY STREAM
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SSE ACTIVE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1">
              {liveLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  Awaiting agent telemetry stream...
                </div>
              ) : (
                liveLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                      log.type === 'danger'
                        ? 'bg-cyber-crimson/15 border-cyber-crimson/40 text-rose-200'
                        : log.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : log.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-surface border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 opacity-70 text-[10px]">
                      <span>{log.time}</span>
                      <span className="uppercase font-bold tracking-wider">{log.type}</span>
                    </div>
                    <div>{log.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
