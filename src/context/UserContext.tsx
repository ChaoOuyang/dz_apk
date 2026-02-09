import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  avatar: string; // 头像 URL
  nickname: string; // 昵称
  phone: string; // 电话
}

interface UserContextType {
  user: UserProfile;
  setUser: (user: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 默认用户数据
const defaultUser: UserProfile = {
  id: 'user_' + Math.floor(Math.random() * 1000000),
  avatar: 'https://via.placeholder.com/150/E65100/FFFFFF?text=User',
  nickname: '小明',
  phone: '138****1234',
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile>(defaultUser);

  const setUser = (userOrUpdater: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    if (typeof userOrUpdater === 'function') {
      setUserState(userOrUpdater as (prev: UserProfile) => UserProfile);
    } else {
      setUserState(userOrUpdater);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserState((prev) => ({
      ...prev,
      ...updates,
    }));
  };


  const value: UserContextType = {
    user,
    setUser,
    updateUserProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};
