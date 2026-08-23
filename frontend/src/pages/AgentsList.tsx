import React, { useState } from 'react';
import { 
  Cpu, 
  Plus, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  ShieldCheck, 
  Edit3, 
  Sparkles,
  X,
  Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Agent } from '../types';

export const AgentsList: React.FC = () => {
  const { agents, activeAgent, setActiveAgent, refreshUserData } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [maxRefundLimit, setMaxRefundLimit] = useState(5000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setPurpose('');
    setMaxRefundLimit(5000);
    setIsCreating(true);
  };

  const handleOpenEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setName(agent.name);
    setDescription(agent.description);
    setPurpose(agent.purpose);
    setMaxRefundLimit(agent.maxRefundLimit);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingAgent) {
        await api.updateAgent(editingAgent.id, {
          name,
          description,
          purpose,
          maxRefundLimit: Number(maxRefundLimit)
        });
      } else {
        await api.createAgent({
          name,
          description,
          purpose,
          maxRefundLimit: Number(maxRefundLimit)
        });
      }
      await refreshUserData();
      setIsCreating(false);
      setEditingAgent(null);
    } catch (err) {
      console.error('Failed to save agent', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await api.toggleAgentStatus(agent.id, nextStatus);
    await refreshUserData();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full">
              AGENT FLEET
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-cyber-cyan" />
            Configured AI Agents
          </h2>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-bold text-xs shadow-glow-cyan transition-all"
        >
          <Plus className="w-4 h-4" />
          CREATE NEW AGENT
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const isActive = agent.status === 'ACTIVE';
          const isCurrentSelected = activeAgent?.id === agent.id;

          return (
            <div
              key={agent.id}
              className={`p-6 md:p-7 rounded-3xl border transition-all space-y-5 ${
                isCurrentSelected
                  ? 'glass-panel-glow border-cyber-cyan/60 shadow-glow-cyan/20'
                  : 'glass-panel border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border ${
                    isActive
                      ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan'
                      : 'bg-white/5 border-white/10 text-slate-500'
                  }`}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {agent.name}
                      {isCurrentSelected && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-cyber-cyan/20 text-cyber-cyan rounded border border-cyber-cyan/40">
                          ACTIVE IN WORKSPACE
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono text-[11px]">{agent.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(agent)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  {isActive ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                  {agent.status}
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {agent.purpose}
              </p>

              {/* Authority Configuration Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-surface-elevated border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Autonomous Limit</span>
                  <div className="font-bold text-emerald-400 font-mono text-sm">
                    ≤ ₹{agent.maxRefundLimit.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface-elevated border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">ArmorIQ Protection</span>
                  <div className="font-bold text-cyber-cyan flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <button
                  onClick={() => setActiveAgent(agent)}
                  disabled={isCurrentSelected}
                  className={`font-semibold transition-colors ${
                    isCurrentSelected
                      ? 'text-slate-500 cursor-default'
                      : 'text-cyber-cyan hover:underline'
                  }`}
                >
                  {isCurrentSelected ? 'Currently Assigned' : 'Select for Workflow'}
                </button>

                <button
                  onClick={() => handleOpenEdit(agent)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white border border-white/10 transition-all inline-flex items-center gap-1.5 font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Authority
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingAgent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-7 rounded-3xl border border-white/20 max-w-lg w-full space-y-6 text-slate-100 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingAgent ? 'Edit Agent Authority' : 'Create New AI Agent'}
              </h3>
              <button
                onClick={() => { setIsCreating(false); setEditingAgent(null); }}
                className="p-1 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Agent Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Warranty Support Agent"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Purpose</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Handle customer returns and disburse claims within policy"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Maximum Autonomous Refund Limit (₹)</label>
                <input
                  type="number"
                  required
                  value={maxRefundLimit}
                  onChange={(e) => setMaxRefundLimit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white font-mono font-bold focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setEditingAgent(null); }}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-cyber-cyan text-black font-bold shadow-glow-cyan hover:bg-cyber-cyan/90 transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Save Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
