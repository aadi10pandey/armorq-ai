import React, { useState, useEffect } from 'react';
import { ListOrdered, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { TaskRecord } from '../types';
import { sound } from '../utils/soundEngine';

interface TasksPageProps {
  onNavigateToLive: () => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigateToLive }) => {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const list = await api.getTasks();
        setTasks(list);
      } catch (err) {
        console.error('Failed to load tasks', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full font-mono">
              EXECUTION HISTORY
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ListOrdered className="w-6 h-6 text-cyber-cyan" />
            Task Execution History
          </h2>
        </div>

        <div className="text-xs text-slate-300 px-4 py-2 rounded-xl bg-surface-elevated border border-white/10">
          Total Recorded Tasks: <span className="text-cyber-cyan font-bold font-mono">{tasks.length}</span>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/80 border-b border-white/10 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Time</th>
                <th className="py-3.5 px-5">Task ID</th>
                <th className="py-3.5 px-5">User Instruction</th>
                <th className="py-3.5 px-5">Interpreted Goal</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500 text-xs">
                    {isLoading ? 'Loading task history...' : 'No tasks executed yet in this workspace.'}
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isBlocked = task.status === 'AWAITING_APPROVAL' || task.status === 'REJECTED';
                  const isCompleted = task.status === 'COMPLETED';

                  return (
                    <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(task.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-5 font-mono text-[11px] text-cyber-cyan whitespace-nowrap">
                        {task.id}
                      </td>
                      <td className="py-4 px-5 font-medium text-white max-w-xs truncate">
                        "{task.intent}"
                      </td>
                      <td className="py-4 px-5 text-slate-400 max-w-xs truncate text-[11px]">
                        {task.interpretedGoal || 'Standard Refund Execution'}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                          isBlocked
                            ? 'text-cyber-crimson bg-rose-500/10 border-cyber-crimson/30 animate-pulse'
                            : isCompleted
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            : 'text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => {
                            sound.playClick();
                            onNavigateToLive();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white border border-white/10 transition-all text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          View Timeline <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
