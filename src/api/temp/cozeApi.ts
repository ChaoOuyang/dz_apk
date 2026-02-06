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

const API_URL = "https://api.coze.cn/v3/chat";
const BOT_ID = "7602827238899957796";
const API_TOKEN = "sat_Dj1nYX9cC8kEUrjHn2X2wqAQD9UwAd5u8000t5xYQft28rLX8CMlLWRN50Ph2A1q";

export const chatWithStream = (
  userId: string,
  userMessage: string,
  historyMessages: HistoryMessage[] | null,
  callback: StreamCallback,
  conversationId?: string
) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', API_URL);
  
  xhr.setRequestHeader('Authorization', `Bearer ${API_TOKEN}`);
  xhr.setRequestHeader('Content-Type', 'application/json');

  const requestBody: any = {
    bot_id: BOT_ID,
    user_id: userId,
    stream: true,
    additional_messages: [],
  };

  if (conversationId) {
      // Note: Coze V3 API uses query param for conversation_id usually, but let's check the Kotlin code.
      // Kotlin code: urlBuilder?.addQueryParameter("conversation_id", conversationId.trim())
      // So we should append it to the URL if provided.
      // However, we already opened the XHR. Let's fix this in a moment or just append to URL before open.
  }
  
  // Re-open if needed or just handle URL construction before open.
  // Let's restructure slightly to handle URL construction first.
};

export class CozeApi {
  static chatWithStream(
    userId: string,
    userMessage: string,
    historyMessages: HistoryMessage[] | null,
    callback: StreamCallback,
    conversationId?: string
  ) {
    let url = API_URL;
    if (conversationId) {
      url += `?conversation_id=${encodeURIComponent(conversationId)}`;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    
    xhr.setRequestHeader('Authorization', `Bearer ${API_TOKEN}`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    const messages = [];
    if (historyMessages) {
      messages.push(...historyMessages.map(msg => ({
        role: msg.role,
        type: msg.type,
        content_type: msg.contentType,
        content: msg.content
      })));
    }

    messages.push({
      role: 'user',
      type: 'question',
      content_type: 'text',
      content: userMessage
    });

    const requestBody = {
      bot_id: BOT_ID,
      user_id: userId,
      stream: true,
      additional_messages: messages
    };

    let lastReadIndex = 0;
    let currentConversationId: string | null = conversationId || null;
    let fullReply = '';
    let outputMap: string | undefined;
    let subIntent: string | undefined;
    const bufferState = { buffer: '' };

    xhr.onprogress = () => {
      const newData = xhr.responseText.substring(lastReadIndex);
      lastReadIndex = xhr.responseText.length;
      processChunk(newData, callback, (convId, reply, out, sub) => {
        if (convId) currentConversationId = convId;
        if (reply) fullReply += reply; 
        if (out) outputMap = out;
        if (sub) subIntent = sub;
      }, bufferState);
    };

    xhr.onload = () => {
      console.log(`[CozeApi] Response Status: ${xhr.status}`);
      if (xhr.status >= 200 && xhr.status < 300) {
        // Final processing if anything remains
        // Then call onSuccess
        callback.onSuccess(currentConversationId || '', fullReply, outputMap, subIntent);
        callback.onComplete();
      } else {
        console.error(`[CozeApi] Response Error Body: ${xhr.responseText}`);
        let errorMsg = 'Unknown Error';
        try {
            const err = JSON.parse(xhr.responseText);
            errorMsg = err.msg || err.message || errorMsg;
            callback.onError(String(xhr.status), errorMsg, err);
        } catch (e) {
            callback.onError(String(xhr.status), xhr.responseText);
        }
      }
    };

    xhr.onerror = () => {
      console.error('[CozeApi] Network Error');
      callback.onError('NETWORK_ERROR', 'Network request failed');
    };

    console.log('[CozeApi] Request Body:', JSON.stringify(requestBody, null, 2));
    xhr.send(JSON.stringify(requestBody));
  }
}

function processChunk(
    chunk: string, 
    callback: StreamCallback, 
    updateState: (convId?: string, replyPart?: string, outputMap?: string, subIntent?: string) => void,
    bufferState: { buffer: string }
) {
    bufferState.buffer += chunk;
    const lines = bufferState.buffer.split('\n');
    // Keep the last partial line in the buffer
    bufferState.buffer = lines.pop() || '';

    let currentEvent: string | null = null;
    let dataBuffer = '';

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
            // Empty line: end of event
            if (currentEvent && dataBuffer) {
                handleSseMessage(currentEvent, dataBuffer, callback, updateState);
            }
            currentEvent = null;
            dataBuffer = '';
            continue;
        }

        if (line.startsWith('event:')) {
            currentEvent = line.substring(6).trim();
        } else if (line.startsWith('data:')) {
            const dataContent = line.substring(5).trim();
            if (dataBuffer && dataContent) {
                dataBuffer += dataContent;
            } else if (dataContent) {
                dataBuffer = dataContent;
            }
        }
    }
}

function handleSseMessage(
    event: string, 
    data: string, 
    callback: StreamCallback,
    updateState: (convId?: string, replyPart?: string, outputMap?: string, subIntent?: string) => void
) {
    console.log(`[CozeApi] Event: ${event}, Data: ${data}`);
    if (data === '[DONE]') return;

    try {
        const json = JSON.parse(data);
        
        // Extract conversation_id if available
        if (json.conversation_id) {
            updateState(json.conversation_id);
        }

        if (event === 'conversation.message.delta') {
            // Handle streaming message content
            if (json.content) {
                callback.onEvent(event, json.content);
                updateState(undefined, json.content);
            }
        } else if (event === 'conversation.message.completed') {
             // Handle completed message - may contain final full content
             if (json.type === 'answer' && json.content) {
                 updateState(undefined, json.content);
             }
             // Extract outputMap/subIntent
             if (json.outputMap) updateState(undefined, undefined, JSON.stringify(json.outputMap));
             if (json.subIntent) updateState(undefined, undefined, undefined, json.subIntent);
        }

    } catch (e) {
        console.error('[CozeApi] Error parsing message:', e, 'data:', data);
    }
}
