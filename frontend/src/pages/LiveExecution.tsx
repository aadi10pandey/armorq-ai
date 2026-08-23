import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  UserCheck, 
  XCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';
import { useSentinelEvents } from '../hooks/useSentinelEvents';
import { api } from '../services/api';

interface LiveExecutionProps {
  onRefreshData?: () => void;
}

export const LiveExecution: React.FC<LiveExecutionProps> = ({ onRefreshData }) => {
  const {
    activePlan,
    workflowStatus,
    pendingApproval,
    liveLogs,
    resetLiveState
  } = useSentinelEvents();

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showTechnicalProof, setShowTechnicalProof] = useState(false);

  const handleApprove = async () => {
    if (!pendingApproval) return;
    try {
      setIsApproving(true);
      await api.approveRequest(pendingApproval.id, 'Grand Finale Supervisor');
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
      await api.rejectRequest(pendingApproval.id, 'Grand Finale Supervisor');
      onRefreshData?.();
    } catch (err) {
      console.error('Error rejecting action', err);
    } finally {
      setIsRejecting(false);
    }
  };

  // Convert technical steps into user-friendly operational descriptions
  const getHumanDescription = (action: string, inputs: any, description: string) => {
    switch (action) {
      case 'find_customer':
        return inputs?.email ? `Checking customer profile (${inputs.email})` : 'Finding customer profile';
      case 'get_order_by_number':
        return inputs?.orderNumber ? `Validating order details (${inputs.orderNumber})` : 'Retrieving order history';
      case 'validate_refund_eligibility':
        return 'Verifying warranty policy and return eligibility';
      case 'process_refund':
        return `Disbursing refund of ₹${(inputs?.amount || 0).toLocaleString('en-IN')}`;
      case 'send_refund_confirmation':
        return 'Sending confirmation receipt to customer';
      default:
        return description || action;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full">
              LIVE EXECUTION
            </span>
            <span className="text-xs text-slate-400">
              Autonomous Agent Activity Stream
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-cyber-cyan" />
            Agent Execution & Boundary Monitor
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            workflowStatus === 'SECURITY_HOLD'
              ? 'bg-cyber-crimson/20 border-cyber-crimson text-cyber-crimson shadow-glow-crimson animate-pulse'
              : workflowStatus === 'EXECUTING'
              ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-glow-cyan'
              : workflowStatus === 'COMPLETED'
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
              : 'bg-surface-elevated border-white/10 text-slate-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            {workflowStatus === 'SECURITY_HOLD' && 'HOLD // ACTION REQUIRES APPROVAL'}
            {workflowStatus === 'EXECUTING' && 'AGENT WORKING AUTONOMOUSLY'}
            {workflowStatus === 'COMPLETED' && 'WORKFLOW COMPLETED SUCCESSFULLY'}
            {workflowStatus === 'IDLE' && 'READY FOR TASK'}
            {workflowStatus === 'PLANNING' && 'PREPARING WORKFLOW...'}
          </div>

          <button
            onClick={resetLiveState}
            className="px-3.5 py-2 text-xs text-slate-400 hover:text-white bg-surface-elevated rounded-xl border border-white/10 hover:border-white/20 transition-all font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* 2. Main Workflow Pipeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Visual Execution Timeline */}
        <div className="lg:col-span-8 space-y-6">

          {/* User Intent & Scope Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assigned Intent & Scope
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Authorized Ceiling: ₹5,000
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">REQUESTED OBJECTIVE:</span>
              <p className="text-base text-white font-medium">
                {activePlan?.goal || '"Process eligible customer refunds up to ₹5,000."'}
              </p>
            </div>
          </div>

          {/* Step Execution Sequence */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyber-purple" />
                Autonomous Steps & Verification
              </h3>
              <span className="text-xs text-slate-400">
                {activePlan ? `${activePlan.steps.length} Steps in Workflow` : 'Awaiting start'}
              </span>
            </div>

            {!activePlan ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm text-slate-400 font-medium">No active execution in progress.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click <span className="text-cyber-cyan font-semibold">Run Safe Demo</span> or <span className="text-cyber-crimson font-semibold">Trigger Out-of-Scope</span> in the header to start.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePlan.steps.map((step, idx) => {
                  const isBlocked = step.status === 'BLOCKED';
                  const isExecuting = step.status === 'EXECUTING';
                  const isCompleted = step.status === 'COMPLETED';
                  const friendlyDesc = getHumanDescription(step.action, step.inputs, step.description);

                  return (
                    <motion.div
                      key={step.id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        isBlocked
                          ? 'glass-panel-danger border-cyber-crimson/80 shadow-glow-crimson/20'
                          : isExecuting
                          ? 'glass-panel-glow border-cyber-cyan/50'
                          : isCompleted
                          ? 'bg-surface-elevated/80 border-emerald-500/30'
                          : 'bg-surface/40 border-white/5 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isBlocked
                              ? 'bg-cyber-crimson/20 text-cyber-crimson'
                              : isExecuting
                              ? 'bg-cyber-cyan/20 text-cyber-cyan animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 text-slate-500'
                          }`}>
                            {idx + 1}
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-white">
                              {friendlyDesc}
                            </div>
                            <div className="text-xs text-slate-400">
                              {isCompleted && 'Action verified within authority and completed'}
                              {isExecuting && 'Checking action against authority boundary...'}
                              {isBlocked && 'Action exceeds authority — stopped before execution'}
                              {step.status === 'PENDING' && 'Waiting for preceding step'}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          )}

                          {isExecuting && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-cyber-cyan bg-cyber-cyan/10 px-3 py-1 rounded-full border border-cyber-cyan/30 animate-pulse">
                              <Play className="w-3 h-3 fill-cyber-cyan" />
                              Verifying
                            </span>
                          )}

                          {isBlocked && (
                            <span className="flex items-center gap-1 text-xs font-bold text-cyber-crimson bg-cyber-crimson/20 px-3 py-1 rounded-full border border-cyber-crimson shadow-glow-crimson">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Blocked (Hold)
                            </span>
                          )}

                          {step.status === 'PENDING' && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                              <Clock className="w-3.5 h-3.5" />
                              Queued
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Blocked Action Experience (Hero Security Moment) */}
          <AnimatePresence>
            {workflowStatus === 'SECURITY_HOLD' && pendingApproval && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-panel-danger p-7 rounded-3xl border-2 border-cyber-crimson shadow-glow-crimson space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-crimson/30 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-cyber-crimson/20 border border-cyber-crimson/60 text-cyber-crimson animate-pulse">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                        Authority Boundary Reached
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        Action Requires Human Decision
                      </h3>
                    </div>
                  </div>

                  <span className="px-3.5 py-1 text-xs font-bold bg-cyber-crimson text-white rounded-full self-start sm:self-auto">
                    BLOCKED BEFORE EXECUTION
                  </span>
                </div>

                {/* Clear Side-by-Side Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                    <span className="text-slate-400 font-semibold block">AUTHORIZED LIMIT</span>
                    <div className="text-2xl font-bold text-emerald-400">
                      ₹5,000
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Maximum refund amount the agent is permitted to process autonomously.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyber-crimson/20 border border-cyber-crimson/40 space-y-1.5">
                    <span className="text-cyber-crimson font-bold block">REFUND REQUESTED</span>
                    <div className="text-2xl font-bold text-cyber-crimson glow-text-crimson">
                      ₹{(pendingApproval.requestedAmount || 15000).toLocaleString('en-IN')}
                    </div>
                    <p className="text-rose-200 text-[11px]">
                      Exceeds authorized limit by ₹10,000. Halted prior to payment execution.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-white/5 text-xs text-slate-300 space-y-1">
                  <span className="font-semibold text-white block">Why was it stopped?</span>
                  <p className="text-slate-300 leading-relaxed">
                    "This action falls outside the authority granted to the agent. Sentinel prevented the transaction from touching the live payment system."
                  </p>
                </div>

                {/* Human Decision Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleReject}
                    disabled={isRejecting || isApproving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-all"
                  >
                    <XCircle className="w-4 h-4 text-slate-400" />
                    {isRejecting ? 'Rejecting...' : 'REJECT & STOP'}
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-glow-emerald transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    {isApproving ? 'Resuming Agent...' : 'APPROVE & CONTINUE'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. Progressive Disclosure: Security Proof (For Technical Judges) */}
          {activePlan && (
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setShowTechnicalProof(!showTechnicalProof)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
                  Security Verification Proof (For Technical Judges)
                </span>
                {showTechnicalProof ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTechnicalProof && (
                <div className="p-5 border-t border-white/10 bg-black/40 space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-surface border border-white/5 space-y-1">
                    <span className="text-slate-500 text-[10px] block">CANONICAL PLAN MERKLE ROOT:</span>
                    <span className="text-cyber-cyan break-all">{activePlan.merkleRoot}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-white/5 space-y-1">
                    <span className="text-slate-500 text-[10px] block">SIGNED INTENT TOKEN (CSRG-IAP):</span>
                    <span className="text-cyber-purple break-all">{activePlan.intentToken}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right 4 Cols: Clean Live Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col h-[540px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Activity Log
              </h3>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {liveLogs.length === 0 ? (
                <div className="text-center py-24 text-slate-500">
                  Awaiting agent actions...
                </div>
              ) : (
                liveLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                      log.type === 'danger'
                        ? 'bg-rose-500/15 border-cyber-crimson/40 text-rose-200'
                        : log.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-surface border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[10px] opacity-75">
                      <span>{log.time}</span>
                      <span className="font-semibold uppercase">{log.type === 'danger' ? 'HOLD' : 'VERIFIED'}</span>
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
