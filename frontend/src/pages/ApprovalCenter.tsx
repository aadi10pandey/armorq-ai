import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  ArrowRight,
  Hash
} from 'lucide-react';
import { ApprovalRequest } from '../types';
import { api } from '../services/api';

interface ApprovalCenterProps {
  approvals: ApprovalRequest[];
  onRefresh: () => void;
  onNavigateToLive: () => void;
}

export const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  approvals,
  onRefresh,
  onNavigateToLive,
}) => {
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(
    approvals.find(a => a.status === 'PENDING') || approvals[0] || null
  );
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingList = approvals.filter(a => a.status === 'PENDING');
  const resolvedList = approvals.filter(a => a.status !== 'PENDING');

  const handleApprove = async (id: string) => {
    try {
      setIsProcessing(true);
      await api.approveRequest(id, 'Grand Finale Judge / Security Admin', notes || 'Authorized after VIP verification.');
      onRefresh();
      onNavigateToLive();
    } catch (err) {
      console.error('Error approving', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsProcessing(true);
      await api.rejectRequest(id, 'Grand Finale Judge / Security Admin', notes || 'Rejected due to risk boundary policy.');
      onRefresh();
    } catch (err) {
      console.error('Error rejecting', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded">
              HUMAN-IN-THE-LOOP CONTROL
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-amber-400" />
            Approval & Security Intervention Center
          </h2>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-surface-elevated border border-white/10 text-slate-300">
          Pending Holds: <span className="text-amber-400 font-bold">{pendingList.length}</span>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Col: List of Approval Requests */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center justify-between">
            <span>Intervention Queue</span>
            <span className="text-slate-400">{approvals.length} total</span>
          </h3>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {approvals.length === 0 ? (
              <div className="text-center py-16 text-slate-500 font-mono text-xs">
                No approval requests in queue.
              </div>
            ) : (
              approvals.map((req) => {
                const isSelected = activeApproval?.id === req.id;
                const isPending = req.status === 'PENDING';

                return (
                  <div
                    key={req.id}
                    onClick={() => setActiveApproval(req)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all font-mono text-xs space-y-2 ${
                      isSelected
                        ? 'glass-panel-glow border-cyber-cyan bg-surface-elevated'
                        : 'bg-surface/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">{req.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPending
                          ? 'text-cyber-crimson bg-rose-500/10 border border-cyber-crimson/30 animate-pulse'
                          : req.status === 'APPROVED'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-slate-400 bg-white/5'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-sans">
                      <span className="font-semibold text-white">{req.action}</span>
                      <span className="text-amber-300 font-mono font-bold">
                        ₹{(req.requestedAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 font-sans">
                      {req.reason}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Deep Review Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {activeApproval ? (
            <div className={`p-6 rounded-2xl border ${
              activeApproval.status === 'PENDING'
                ? 'glass-panel-danger border-cyber-crimson/50'
                : 'glass-panel border-white/10'
            } space-y-6`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">REQUEST ID: {activeApproval.id}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-cyber-crimson text-white rounded">
                      {activeApproval.riskSeverity} RISK
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    High-Risk Tool Invocation Review
                  </h3>
                </div>

                <span className={`px-3 py-1 text-xs font-bold font-mono rounded-lg border ${
                  activeApproval.status === 'PENDING'
                    ? 'bg-rose-500/20 text-cyber-crimson border-cyber-crimson shadow-glow-crimson'
                    : activeApproval.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                    : 'bg-white/10 text-slate-400 border-white/20'
                }`}>
                  {activeApproval.status}
                </span>
              </div>

              {/* Diff Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-surface-elevated/90 border border-white/10 space-y-2">
                  <span className="text-slate-400 block text-[11px]">AUTHORIZED POLICY CEILING</span>
                  <div className="text-2xl font-bold text-emerald-400">
                    ₹{(activeApproval.authorizedLimit || 5000).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Permitted autonomous threshold under active signed plan.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-cyber-crimson/20 border border-cyber-crimson/40 space-y-2">
                  <span className="text-cyber-crimson block text-[11px] font-bold">ATTEMPTED DISBURSEMENT</span>
                  <div className="text-2xl font-bold text-cyber-crimson glow-text-crimson">
                    ₹{(activeApproval.requestedAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-rose-200 font-sans">
                    Action placed in HOLD by ArmorIQ before executing sandbox payment.
                  </p>
                </div>
              </div>

              {/* Policy Hash & Security Details */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Hash className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span>CRYPTOGRAPHIC POLICY HASH:</span>
                </div>
                <div className="text-cyber-cyan text-[11px] break-all">
                  {activeApproval.policyHash}
                </div>
                <div className="text-slate-300 font-sans text-xs pt-1">
                  <strong>Trigger Reason:</strong> {activeApproval.reason}
                </div>
              </div>

              {/* Operator Notes Input & Action Buttons if Pending */}
              {activeApproval.status === 'PENDING' ? (
                <div className="space-y-4 pt-2 border-t border-white/10">
                  <div className="space-y-1.5 font-mono text-xs">
                    <label className="text-slate-300">ADMINISTRATOR AUDIT NOTES (OPTIONAL):</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. VIP Warranty authorized by Senior Lead"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleReject(activeApproval.id)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 font-mono text-xs border border-white/10 transition-all"
                    >
                      <XCircle className="w-4 h-4 text-slate-400" />
                      REJECT & CANCEL TASK
                    </button>

                    <button
                      onClick={() => handleApprove(activeApproval.id)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs shadow-glow-emerald transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isProcessing ? 'AUTHORIZING...' : 'APPROVE & CONTINUE'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-surface-elevated border border-white/10 text-xs font-mono space-y-1 text-slate-400">
                  <div>Reviewed By: <span className="text-white">{activeApproval.reviewedBy}</span></div>
                  <div>Resolved At: <span className="text-white">{activeApproval.resolvedAt}</span></div>
                  {activeApproval.reviewerNotes && (
                    <div>Notes: <span className="text-slate-200">{activeApproval.reviewerNotes}</span></div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center font-mono text-xs text-slate-500">
              Select an approval request to inspect.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
