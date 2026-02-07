/**
 * Coze AI 相关的类型定义
 */

export interface HistoryMessage {
  role: string;
  type: string;
  contentType: string;
  content: string;
}

export interface StreamCallback {
  onEvent: (event: string, data: string) => void;
  onSuccess: (conversationId: string, reply: string, outputMap?: string, subIntent?: string) => void;
  onError: (code: string, message: string, errorJson?: any) => void;
  onComplete: () => void;
}
