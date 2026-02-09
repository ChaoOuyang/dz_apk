import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AppContextType {
  activeTab: 'home' | 'group' | 'profile';
  setActiveTab: (tab: 'home' | 'group' | 'profile') => void;
  showTabBar: boolean;
  setShowTabBar: (show: boolean) => void;
  // 群导航相关
  targetGroupId: string | number | null;
  setTargetGroupId: (id: string | number | null) => void;
  targetGroupName: string | null;
  setTargetGroupName: (name: string | null) => void;
  targetActivityId: number | null;
  setTargetActivityId: (id: number | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

/**
 * AppProvider 组件
 * 提供全局应用状态管理
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'group' | 'profile'>('home');
  const [showTabBar, setShowTabBar] = useState(true);
  const [targetGroupId, setTargetGroupId] = useState<string | number | null>(null);
  const [targetGroupName, setTargetGroupName] = useState<string | null>(null);
  const [targetActivityId, setTargetActivityId] = useState<number | null>(null);

  const value: AppContextType = {
    activeTab,
    setActiveTab,
    showTabBar,
    setShowTabBar,
    targetGroupId,
    setTargetGroupId,
    targetGroupName,
    setTargetGroupName,
    targetActivityId,
    setTargetActivityId,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
