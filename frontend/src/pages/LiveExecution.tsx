import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  XCircle, 
  ShieldCheck, 
  FileCheck,
  Lock,
  RotateCcw
} from 'lucide-react';
import { useSentinelEvents } from '../hooks/useSentinelEvents';
import { api } from '../services/api';
import { InstructionHero } from '../components/InstructionHero';
import { LivePipelineFlow } from '../components/LivePipelineFlow';
import { MerkleTreeVisualizer } from '../components/MerkleTreeVisualizer';
import { sound } from '../utils/soundEngine';
import { triggerShockwave } from '../animations/ParticleShieldCanvas';

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
  const [supervisorNotes, setSupervisorNotes] = useState('');

  const handleApprove = async () => {
    if (!pendingApproval) return;
    try {
      setIsApproving(true);
      sound.playClick();
      await api.approveRequest(
        pendingApproval.id, 
        'Lead Operations Supervisor',
        supervisorNotes || 'Authorized claim for VIP customer'
      );
      sound.playVerified();
      triggerShockwave('verified');
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
      sound.playClick();
      await api.rejectRequest(
        pendingApproval.id, 
        'Lead Operations Supervisor',
        supervisorNotes || 'Rejected due to risk boundary policy'
      );
      sound.playHoldAlert();
      triggerShockwave('danger');
      onRefreshData?.();
    } catch (err) {
      console.error('Error rejecting action', err);
    } finally {
      setIsRejecting(false);
    }
  };

  const getHumanDescription = (action: string, inputs: any, description: string) => {
    switch (action) {
      case 'find_customer':
        return inputs?.email ? `Checking KYC customer profile (${inputs.email})` : 'Finding customer profile';
      case 'get_order_by_number':
        return inputs?.orderNumber ? `Retrieving order records (${inputs.orderNumber})` : 'Retrieving order history';
      case 'validate_refund_eligibility':
        return 'Verifying warranty policy, condition & return window';
      case 'process_refund':
        return `Disbursing refund of ₹${(inputs?.amount || 0).toLocaleString('en-IN')} via Payment Sandbox`;
      case 'send_refund_confirmation':
        return 'Sending multi-channel notification receipt to customer';
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
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-cyber-gold bg-cyber-gold/10 border border-cyber-gold/30 rounded-full font-mono">
              LIVE MONITOR
            </span>
            <span className="text-xs text-slate-400">
              Autonomous Agent Telemetry &amp; Verification Stream
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5 font-mono">
            <ShieldCheck className="w-6 h-6 text-cyber-gold" />
            Agent Execution &amp; Boundary Monitor
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            workflowStatus === 'SECURITY_HOLD'
              ? 'bg-cyber-crimson/20 border-cyber-crimson text-cyber-crimson shadow-glow-crimson animate-pulse font-mono'
              : workflowStatus === 'EXECUTING'
              ? 'bg-cyber-gold/15 border-cyber-gold text-cyber-gold shadow-glow-gold font-mono'
              : workflowStatus === 'COMPLETED'
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-mono'
              : 'bg-surface-elevated border-white/10 text-slate-400 font-mono'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            {workflowStatus === 'SECURITY_HOLD' && 'HOLD // BOUNDARY BREACH DETECTED'}
            {workflowStatus === 'EXECUTING' && 'AGENT WORKING AUTONOMOUSLY'}
            {workflowStatus === 'COMPLETED' && 'WORKFLOW COMPLETED SUCCESSFULLY'}
            {workflowStatus === 'IDLE' && 'ENGINE READY'}
            {workflowStatus === 'PLANNING' && 'GENERATING MERKLE PLAN...'}
          </div>

          <button
            onClick={() => {
              sound.playClick();
              resetLiveState();
            }}
            className="px-3.5 py-2 text-xs text-slate-400 hover:text-white bg-surface-elevated rounded-xl border border-white/10 hover:border-white/20 transition-all font-medium flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 2. Direct Instruction Dispatcher Hero */}
      <InstructionHero onInstructionSubmitted={() => onRefreshData?.()} />

      {/* 3. Real-Time Architecture Pipeline Visualizer */}
      <LivePipelineFlow 
        workflowStatus={workflowStatus}
        currentAmount={pendingApproval?.requestedAmount || 4200}
        maxLimit={5000}
      />

      {/* 4. Main Workflow Timeline & Decision Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Visual Execution Timeline */}
        <div className="lg:col-span-8 space-y-6">

          {/* Assigned Objective Header Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyber-gold" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assigned Objective &amp; Scope
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                Authorized Ceiling: ≤ ₹5,000
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">CAPTURED GOAL:</span>
              <p className="text-sm md:text-base text-white font-medium">
                {activePlan?.goal || '"Process eligible customer refunds up to ₹5,000."'}
              </p>
            </div>
          </div>

          {/* Step Execution Sequence */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
                <FileCheck className="w-4 h-4 text-cyber-gold" />
                Autonomous Steps &amp; Verification
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {activePlan ? `${activePlan.steps.length} Steps in Workflow` : 'Awaiting start'}
              </span>
            </div>

            {!activePlan ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm text-slate-400 font-medium">No active execution in progress.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Type an objective above or click "1. Safe Refund" / "2. Out-of-Scope" in the Judge Live Demo Bar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePlan.steps.map((step, idx) => {
                  const isBlocked = step.status === 'BLOCKED';
                  const isExecutingStep = step.status === 'EXECUTING';
                  const isCompletedStep = step.status === 'COMPLETED';
                  const friendlyDesc = getHumanDescription(step.action, step.inputs, step.description);

                  return (
                    <motion.div
                      key={step.id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 md:p-5 rounded-2xl border transition-all ${
                        isBlocked
                          ? 'glass-panel-danger border-cyber-crimson shadow-glow-crimson/30'
                          : isExecutingStep
                          ? 'glass-panel-glow border-cyber-gold/60 shadow-glow-gold/25'
                          : isCompletedStep
                          ? 'bg-surface/90 border-white/10 hover:border-white/20'
                          : 'bg-surface/40 border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        
                        <div className="flex items-start gap-3.5">
                          {/* Step Number Badge */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                            isBlocked
                              ? 'bg-rose-500 text-white shadow-glow-crimson'
                              : isExecutingStep
                              ? 'bg-cyber-gold text-black shadow-glow-gold animate-pulse'
                              : isCompletedStep
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-white/5 text-slate-500 border border-white/10'
                          }`}>
                            {isCompletedStep ? <CheckCircle2 className="w-4 h-4" /> : isBlocked ? '!' : idx + 1}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {friendlyDesc}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                ({step.tool})
                              </span>
                            </div>

                            <p className="text-xs text-slate-400">
                              Action: <code className="text-slate-300 font-mono text-[11px]">{step.action}</code>
                            </p>
                          </div>
                        </div>

                        {/* Step State Badge */}
                        <div className="shrink-0">
                          {isBlocked && (
                            <span className="px-3 py-1 text-[10px] font-bold text-white bg-cyber-crimson rounded-full shadow-glow-crimson font-mono animate-pulse uppercase">
                              HOLD // BOUNDARY BREACH
                            </span>
                          )}
                          {isExecutingStep && (
                            <span className="px-3 py-1 text-[10px] font-bold text-black bg-cyber-gold rounded-full shadow-glow-gold font-mono animate-pulse uppercase">
                              VERIFYING...
                            </span>
                          )}
                          {isCompletedStep && (
                            <span className="px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full font-mono">
                              AUTHORIZED
                            </span>
                          )}
                          {step.status === 'PENDING' && (
                            <span className="px-2.5 py-0.5 text-[10px] text-slate-500 bg-white/5 rounded-full font-mono">
                              QUEUED
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Error / Hold Reason Alert */}
                      {isBlocked && step.error && (
                        <div className="mt-3 p-3 rounded-xl bg-black/60 border border-rose-500/40 text-xs text-rose-200 font-mono space-y-1">
                          <div className="font-bold text-cyber-crimson flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>ARMORIQ INTERCEPTION REASON:</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-rose-300/90">{step.error}</p>
                        </div>
                      )}

                      {/* Execution Output Details */}
                      {isCompletedStep && step.output && (
                        <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 font-mono space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">TOOL RESULT:</span>
                          <div className="text-[11px] text-emerald-300 truncate">
                            {typeof step.output === 'object' 
                              ? `Settled: ${JSON.stringify(step.output).substring(0, 90)}...`
                              : String(step.output)}
                          </div>
                        </div>
                      )}

                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right 4 Cols: Real-Time Human Approval Center or Merkle Proof */}
        <div className="lg:col-span-4 space-y-6">

          {/* Real-Time Security Hold Decision Card */}
          {pendingApproval ? (
            <div className="glass-panel-danger p-6 md:p-7 rounded-3xl border border-cyber-crimson shadow-glow-crimson/30 space-y-5">
              
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono block">
                    INTERCEPTION ACTIVE
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Human Authorization
                  </h3>
                </div>
                <span className="p-2 rounded-xl bg-rose-500/20 text-cyber-crimson border border-rose-500/40 animate-pulse">
                  <ShieldAlert className="w-5 h-5" />
                </span>
              </div>

              {/* Differential Comparison */}
              <div className="space-y-3 text-xs">
                
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">ATTEMPTED DISBURSEMENT:</span>
                  <div className="text-xl font-black text-rose-400 font-mono">
                    ₹{(pendingApproval.requestedAmount || 15000).toLocaleString('en-IN')}
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Customer: Rahul Verma (Order ORD-9934)
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">AUTHORIZED LIMIT:</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    ≤ ₹{(pendingApproval.authorizedLimit || 5000).toLocaleString('en-IN')}
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Standard agent authority bound
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-[11px] leading-relaxed">
                  <strong>Risk Assessment:</strong> Exceeds authorized ceiling by ₹{((pendingApproval.requestedAmount || 15000) - (pendingApproval.authorizedLimit || 5000)).toLocaleString('en-IN')}. Zero payment mutations occurred.
                </div>

              </div>

              {/* Reviewer Note Input */}
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-medium text-[11px]">Supervisor Review Note:</label>
                <input
                  type="text"
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="e.g. Authorized goodwill claim for VIP customer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyber-gold"
                />
              </div>

              {/* Decision Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-glow-emerald transition-all tracking-wider uppercase disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  {isApproving ? 'AUTHORIZING & SETTLING...' : 'APPROVE & DISBURSE'}
                </button>

                <button
                  onClick={handleReject}
                  disabled={isApproving || isRejecting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-elevated hover:bg-surface-charcoal text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-all disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-slate-400" />
                  {isRejecting ? 'CANCELLING...' : 'REJECT & HALT TASK'}
                </button>
              </div>

            </div>
          ) : (
            /* Merkle Tree Proof Visualizer */
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
                  <Lock className="w-4 h-4 text-cyber-gold" />
                  Cryptographic Merkle Proof
                </h3>
              </div>

              {activePlan ? (
                <MerkleTreeVisualizer 
                  merkleRoot={activePlan.merkleRoot} 
                  intentToken={activePlan.intentToken} 
                  steps={activePlan.steps} 
                />
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs font-mono space-y-2">
                  <Lock className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Merkle tree will calculate upon task dispatch.</p>
                </div>
              )}
            </div>
          )}

          {/* Live Activity Log Stream */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
              <span>Telemetry Events</span>
              <span className="text-[10px] text-cyber-gold">SSE Connected</span>
            </h3>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 font-mono text-[11px]">
              {liveLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-6 text-xs">
                  Listening for stream events...
                </div>
              ) : (
                liveLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className={`${
                        log.type === 'danger' ? 'text-cyber-crimson font-bold' : log.type === 'success' ? 'text-emerald-400 font-bold' : 'text-cyber-gold'
                      }`}>{log.type.toUpperCase()}</span>
                      <span>{log.time}</span>
                    </div>
                    <p className="text-slate-300 text-[10px] truncate">
                      {log.message}
                    </p>
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
