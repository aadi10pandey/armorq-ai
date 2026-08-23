import { useEffect, useState, useCallback } from 'react';
import { CapturedPlan, ApprovalRequest } from '../types';

export interface SentinelLiveState {
  currentTaskId: string | null;
  activePlan: CapturedPlan | null;
  activeStepIndex: number;
  workflowStatus: 'IDLE' | 'INITIALIZING' | 'PLANNING' | 'EXECUTING' | 'SECURITY_HOLD' | 'COMPLETED' | 'FAILED';
  violationEvent: any | null;
  pendingApproval: ApprovalRequest | null;
  liveLogs: Array<{ id: string; time: string; message: string; type: 'info' | 'success' | 'danger' | 'warning' }>;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
}

export function useSentinelEvents() {
  const [state, setState] = useState<SentinelLiveState>({
    currentTaskId: null,
    activePlan: null,
    activeStepIndex: -1,
    workflowStatus: 'IDLE',
    violationEvent: null,
    pendingApproval: null,
    liveLogs: [],
    connectionStatus: 'DISCONNECTED',
  });

  const appendLog = useCallback((message: string, type: 'info' | 'success' | 'danger' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setState(prev => ({
      ...prev,
      liveLogs: [
        { id: `log_${Date.now()}_${Math.random()}`, time, message, type },
        ...prev.liveLogs.slice(0, 50)
      ]
    }));
  }, []);

  const resetLiveState = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTaskId: null,
      activePlan: null,
      activeStepIndex: -1,
      workflowStatus: 'IDLE',
      violationEvent: null,
      pendingApproval: null,
    }));
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('/api/events/stream');

    eventSource.onopen = () => {
      setState(prev => ({ ...prev, connectionStatus: 'CONNECTED' }));
      appendLog('📡 Connected to Sentinel ArmorIQ Telemetry Stream', 'info');
    };

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        const { event, data, taskId } = payload;

        if (event === 'HEARTBEAT' || event === 'CONNECTED') return;

        if (event === 'TASK_CREATED') {
          setState(prev => ({
            ...prev,
            currentTaskId: taskId,
            workflowStatus: 'PLANNING',
            violationEvent: null,
            pendingApproval: null,
            activeStepIndex: -1,
          }));
          appendLog(`⚡ New Autonomous Task Initialized: ${data?.intent}`, 'info');
        }

        if (event === 'PLAN_CAPTURED') {
          const plan: CapturedPlan = data?.plan;
          setState(prev => ({
            ...prev,
            activePlan: plan,
            workflowStatus: 'EXECUTING',
          }));
          appendLog(`🔐 ArmorIQ Plan Captured: Merkle Root [${plan.merkleRoot.substring(0, 16)}...]`, 'success');
        }

        if (event === 'STEP_START') {
          const { stepIndex, step } = data;
          setState(prev => {
            if (!prev.activePlan) return prev;
            const updatedSteps = [...prev.activePlan.steps];
            if (updatedSteps[stepIndex]) {
              updatedSteps[stepIndex] = { ...step, status: 'EXECUTING' };
            }
            return {
              ...prev,
              activeStepIndex: stepIndex,
              activePlan: { ...prev.activePlan, steps: updatedSteps },
            };
          });
          appendLog(`▶ Step ${stepIndex + 1}: ${step.description}`, 'info');
        }

        if (event === 'STEP_COMPLETED') {
          const { stepIndex, step } = data;
          setState(prev => {
            if (!prev.activePlan) return prev;
            const updatedSteps = [...prev.activePlan.steps];
            if (updatedSteps[stepIndex]) {
              updatedSteps[stepIndex] = { ...step, status: 'COMPLETED' };
            }
            return {
              ...prev,
              activePlan: { ...prev.activePlan, steps: updatedSteps },
            };
          });
          appendLog(`✓ Step ${stepIndex + 1} Authorized & Completed`, 'success');
        }

        if (event === 'SCOPE_VIOLATION_BLOCKED') {
          const { stepIndex, step, verification, approvalRequest } = data;
          setState(prev => {
            if (!prev.activePlan) return prev;
            const updatedSteps = [...prev.activePlan.steps];
            if (updatedSteps[stepIndex]) {
              updatedSteps[stepIndex] = { ...step, status: 'BLOCKED', error: verification.reason };
            }
            return {
              ...prev,
              workflowStatus: 'SECURITY_HOLD',
              violationEvent: verification,
              pendingApproval: approvalRequest,
              activePlan: { ...prev.activePlan, steps: updatedSteps },
            };
          });
          appendLog(`🛑 ARMORIQ SECURITY HOLD: Attempted refund of ₹${step.inputs?.amount} exceeds limit!`, 'danger');
        }

        if (event === 'WORKFLOW_RESUMED') {
          setState(prev => ({
            ...prev,
            workflowStatus: 'EXECUTING',
            violationEvent: null,
            pendingApproval: null,
          }));
          appendLog(`🔓 Human Operator Approved: Resuming Agent Workflow...`, 'success');
        }

        if (event === 'TASK_COMPLETED') {
          setState(prev => ({
            ...prev,
            workflowStatus: 'COMPLETED',
          }));
          appendLog(`🎉 Task Completed & Cryptographically Sealed in Audit Trail`, 'success');
        }
      } catch (err) {
        console.error('Error handling SSE event', err);
      }
    };

    eventSource.onerror = () => {
      setState(prev => ({ ...prev, connectionStatus: 'DISCONNECTED' }));
    };

    return () => {
      eventSource.close();
    };
  }, [appendLog]);

  return { ...state, resetLiveState, appendLog };
}
