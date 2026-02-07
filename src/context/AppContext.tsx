import React from 'react';

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

export const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
