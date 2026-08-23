import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Workspace, Agent } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  agents: Agent[];
  activeAgent: Agent | null;
  setActiveAgent: (agent: Agent | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarding: boolean;
  setIsOnboarding: (onboarding: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (params: { name: string; email: string; password: string; organization: string; role?: string }) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const refreshUserData = useCallback(async () => {
    const token = localStorage.getItem('sentinel_auth_token');
    if (!token) {
      setUser(null);
      setWorkspace(null);
      setAgents([]);
      setActiveAgent(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data.user) {
        setUser(data.user);
        setWorkspace(data.workspace);
        setAgents(data.agents || []);
        if (data.agents && data.agents.length > 0) {
          setActiveAgent((prev) => prev || data.agents[0]);
        }
      } else {
        localStorage.removeItem('sentinel_auth_token');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('sentinel_auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem('sentinel_auth_token', data.token);
    setUser(data.user);
    setWorkspace(data.workspace);
    setAgents(data.agents || []);
    if (data.agents && data.agents.length > 0) {
      setActiveAgent(data.agents[0]);
    }
    setIsOnboarding(false);
  };

  const register = async (params: { name: string; email: string; password: string; organization: string; role?: string }) => {
    const data = await api.register(params);
    localStorage.setItem('sentinel_auth_token', data.token);
    setUser(data.user);
    setWorkspace(data.workspace);
    if (data.defaultAgent) {
      setAgents([data.defaultAgent]);
      setActiveAgent(data.defaultAgent);
    }
    setIsOnboarding(true); // Trigger onboarding journey for new users!
  };

  const logout = () => {
    localStorage.removeItem('sentinel_auth_token');
    setUser(null);
    setWorkspace(null);
    setAgents([]);
    setActiveAgent(null);
    setIsOnboarding(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        agents,
        activeAgent,
        setActiveAgent,
        isAuthenticated: Boolean(user),
        isLoading,
        isOnboarding,
        setIsOnboarding,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
