import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
  activityIds?: number[];
}

interface HomeScreenContextType {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  inputText: string;
  setInputText: (text: string) => void;
  isSending: boolean;
  setIsSending: (isSending: boolean) => void;
  conversationId: string | undefined;
  setConversationId: (id: string | undefined) => void;
  resetState: () => void;
}

const HomeScreenContext = createContext<HomeScreenContextType | undefined>(undefined);

export const HomeScreenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void = (messagesOrUpdater) => {
    if (typeof messagesOrUpdater === 'function') {
      setMessagesState(messagesOrUpdater as (prev: Message[]) => Message[]);
    } else {
      setMessagesState(messagesOrUpdater);
    }
  };

  const resetState = () => {
    setMessagesState([]);
    setInputText('');
    setIsSending(false);
    setConversationId(undefined);
  };

  const value: HomeScreenContextType = {
    messages,
    setMessages,
    inputText,
    setInputText,
    isSending,
    setIsSending,
    conversationId,
    setConversationId,
    resetState,
  };

  return (
    <HomeScreenContext.Provider value={value}>
      {children}
    </HomeScreenContext.Provider>
  );
};

export const useHomeScreenContext = () => {
  const context = useContext(HomeScreenContext);
  if (context === undefined) {
    throw new Error('useHomeScreenContext must be used within HomeScreenProvider');
  }
  return context;
};
