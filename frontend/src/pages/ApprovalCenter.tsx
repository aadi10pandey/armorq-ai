import React, { useState } from 'react';
import { 
  ShieldAlert, 
  XCircle, 
  UserCheck 
} from 'lucide-react';
import { ApprovalRequest } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/soundEngine';
import { triggerShockwave } from '../animations/ParticleShieldCanvas';

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

  const handleApprove = async (id: string) => {
    try {
      setIsProcessing(true);
      sound.playClick();
      await api.approveRequest(id, 'Lead Operations Supervisor', notes || 'Authorized after claim verification.');
      sound.playVerified();
      triggerShockwave('verified');
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
      sound.playClick();
      await api.rejectRequest(id, 'Lead Operations Supervisor', notes || 'Rejected due to risk boundary policy.');
      sound.playHoldAlert();
      triggerShockwave('danger');
      onRefresh();
    } catch (err) {
      console.error('Error rejecting', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full">
              HUMAN-IN-THE-LOOP CONTROL
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            Human Approval Center
          </h2>
        </div>

        <div className="text-xs font-semibold px-4 py-2 rounded-xl bg-surface-elevated border border-white/10 text-slate-300">
          Decisions Waiting: <span className="text-amber-400 font-bold">{pendingList.length}</span>
        </div>
      </div>

      {/* 2. Main Decision Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 Cols: Queue List */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Decisions Queue</span>
            <span className="text-slate-500">{approvals.length} total</span>
          </h3>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {approvals.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No decisions waiting for human review.
              </div>
            ) : (
              approvals.map((req) => {
                const isSelected = activeApproval?.id === req.id;
                const isPending = req.status === 'PENDING';

                return (
                  <div
                    key={req.id}
                    onClick={() => {
                      setActiveApproval(req);
                      sound.playClick();
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 text-xs ${
                      isSelected
                        ? 'glass-panel-glow border-cyber-cyan bg-surface-elevated'
                        : 'bg-surface/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono text-[11px]">{req.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPending
                          ? 'text-cyber-crimson bg-rose-500/10 border border-cyber-crimson/30 animate-pulse'
                          : req.status === 'APPROVED'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-slate-400 bg-white/5'
                      }`}>
                        {isPending ? 'Action Blocked' : req.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Refund Request</span>
                      <span className="text-amber-300 font-bold font-mono">
                        ₹{(req.requestedAmount || 15000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {req.reason}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 8 Cols: Human Decision Card */}
        <div className="lg:col-span-8 space-y-6">
          {activeApproval ? (
            <div className={`p-7 rounded-3xl border ${
              activeApproval.status === 'PENDING'
                ? 'glass-panel-danger border-cyber-crimson/50'
                : 'glass-panel border-white/10'
            } space-y-6`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider block mb-1">
                    Human Approval Required
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Review Out-of-Scope Refund Request
                  </h3>
                </div>

                <span className={`px-3.5 py-1 text-xs font-bold rounded-full border self-start sm:self-auto ${
                  activeApproval.status === 'PENDING'
                    ? 'bg-rose-500/20 text-cyber-crimson border-cyber-crimson shadow-glow-crimson'
                    : activeApproval.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                    : 'bg-white/10 text-slate-400 border-white/20'
                }`}>
                  {activeApproval.status === 'PENDING' ? 'BLOCKED BEFORE EXECUTION' : activeApproval.status}
                </span>
              </div>

              {/* Clear Key Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-surface-elevated/90 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-semibold block">ACTION:</span>
                  <div className="text-base font-bold text-white">
                    Refund ₹{(activeApproval.requestedAmount || 15000).toLocaleString('en-IN')}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Customer: Rahul Verma (Order ORD-9934)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-elevated/90 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-semibold block">AUTHORIZED SCOPE:</span>
                  <div className="text-base font-bold text-emerald-400">
                    Refunds up to ₹5,000
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Standard agent authority ceiling.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cyber-crimson/15 border border-cyber-crimson/30 space-y-1">
                  <span className="text-cyber-crimson font-bold block">RISK ASSESSMENT:</span>
                  <div className="text-sm font-semibold text-rose-200">
                    Outside current authority (+₹10,000)
                  </div>
                  <p className="text-rose-300/80 text-[11px]">
                    Agent stopped automatically at the security boundary.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-elevated/90 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-semibold block">IMPACT:</span>
                  <div className="text-sm font-semibold text-white">
                    ₹15,000 Sandbox Financial Settlement
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Disburses funds to customer upon approval.
                  </p>
                </div>

              </div>

              {/* Action Buttons if Pending */}
              {activeApproval.status === 'PENDING' ? (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="space-y-1.5 text-xs">
                    <label className="text-slate-300 font-medium">Supervisor Decision Notes (Optional):</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Authorized claim for high-value VIP customer warranty"
                      className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan text-xs"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleReject(activeApproval.id)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-all"
                    >
                      <XCircle className="w-4 h-4 text-slate-400" />
                      REJECT & CANCEL TASK
                    </button>

                    <button
                      onClick={() => handleApprove(activeApproval.id)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-glow-emerald transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      {isProcessing ? 'AUTHORIZING...' : 'APPROVE & CONTINUE'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-surface-elevated border border-white/10 text-xs space-y-1 text-slate-400">
                  <div>Reviewed By: <span className="text-white font-medium">{activeApproval.reviewedBy}</span></div>
                  <div>Resolved At: <span className="text-white font-medium">{activeApproval.resolvedAt}</span></div>
                  {activeApproval.reviewerNotes && (
                    <div>Notes: <span className="text-slate-200">{activeApproval.reviewerNotes}</span></div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel p-16 rounded-3xl border border-white/10 text-center text-xs text-slate-500">
              Select an approval request to inspect details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
