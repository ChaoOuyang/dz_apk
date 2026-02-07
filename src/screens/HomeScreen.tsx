import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CozeApi } from '../api';
import type { HistoryMessage } from '../api';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ActivityCardList } from '../components/ActivityCardList';
import type { ActivityInfo } from '../components/ActivityCard';
import { ActivityDetailSheet } from '../components/ActivityDetailSheet';
import { theme } from '../theme';
import { useHomeScreenContext, type Message } from '../context/HomeScreenContext';

const { width } = Dimensions.get('window');

const getDisplayContent = (text: string) => {
  if (!text) return '';
  try {
    const json = JSON.parse(text);
    if (json.content) {
      return json.content;
    }
  } catch (e) {
    // Ignore
  }

  const pattern = '{"content":"';
  if (text.startsWith(pattern)) {
    const contentPart = text.substring(pattern.length);
    let result = '';
    let escaped = false;
    for (let i = 0; i < contentPart.length; i++) {
      const char = contentPart[i];
      if (escaped) {
        result += char;
        escaped = false;
      } else {
        if (char === '\\') {
          escaped = true;
          result += char;
        } else if (char === '"') {
          break;
        } else {
          result += char;
        }
      }
    }
    try {
      let safeResult = result;
      if (safeResult.endsWith('\\')) {
        safeResult = safeResult.slice(0, -1);
      }
      return JSON.parse(`"${safeResult}"`);
    } catch (e) {
      return result;
    }
  }
  return text;
};

/**
 * 从 Coze API 响应文本中提取活动ID
 * 支持的格式：
 * - JSON: {"activityIds": [123, 456]} 或 {"activities": [{"id": 123}]}
 * - JSON: {"content": "...", "outputMap": {"activityIds": [123, 456]}}
 * - 纯数字数组: [123, 456]
 * @param text API 响应文本
 * @returns 活动ID数组，如果没有找到则返回空数组
 */
const extractActivityIds = (text: string): number[] => {
  if (!text) return [];
  
  try {
    // 尝试解析为 JSON
    const json = JSON.parse(text);
    
    // 尝试多种可能的字段名 - 顶层级
    if (json.activityIds && Array.isArray(json.activityIds)) {
      const ids = json.activityIds.filter((id: any): id is number => typeof id === 'number');
      if (ids.length > 0) return ids;
    }
    
    // 在 outputMap 中查找 activityIds
    if (json.outputMap && json.outputMap.activityIds && Array.isArray(json.outputMap.activityIds)) {
      const ids = json.outputMap.activityIds.filter((id: any): id is number => typeof id === 'number');
      if (ids.length > 0) return ids;
    }
    
    // 检查 activities 字段
    if (json.activities && Array.isArray(json.activities)) {
      const ids = json.activities
        .map((item: any) => item.id || item.activityId)
        .filter((id: any): id is number => typeof id === 'number');
      if (ids.length > 0) return ids;
    }
    
    // 直接是数组
    if (Array.isArray(json)) {
      const ids = json.filter((id: any): id is number => typeof id === 'number');
      if (ids.length > 0) return ids;
    }
  } catch (e) {
    console.error('[extractActivityIds] Parse error:', e);
  }
  
  return [];
};

const HomeScreen = () => {
  const flatListRef = useRef<FlatList>(null);
  
  // BottomSheet 状态
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityInfo | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  
  const {
    messages,
    setMessages,
    inputText,
    setInputText,
    isSending,
    setIsSending,
    conversationId,
    setConversationId,
    resetState,
  } = useHomeScreenContext();

  const userId = "user_" + Math.floor(Math.random() * 1000000);

  const startNewTopic = () => {
    // Reset all state to start a new conversation
    resetState();
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
    };

    setMessages((prev: Message[]) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    // Prepare history messages for context if needed
    // For now, we just send the current message, but Coze API supports history.
    // Ideally we should map `messages` to `HistoryMessage[]`.
    const history: HistoryMessage[] = messages.map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        type: m.isUser ? 'question' : 'answer',
        contentType: 'text',
        content: m.text
    }));

    // Placeholder for bot message
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      text: '',
      isUser: false,
      isLoading: true,
    };
    setMessages((prev: Message[]) => [...prev, botMsg]);

    CozeApi.chatWithStream(
      userId,
      text,
      history,
      {
        onEvent: (event: string, data: string) => {
           console.log('[HomeScreen] onEvent:', event, 'data:', data);
           if (event === 'conversation.message.delta') {
               setMessages((prev: Message[]) => {
                   const newMsgs = [...prev];
                   const index = newMsgs.findIndex(m => m.id === botMsgId);
                   if (index !== -1) {
                       newMsgs[index] = {
                           ...newMsgs[index],
                           text: newMsgs[index].text + data,
                           isLoading: false,
                       };
                   }
                   return newMsgs;
               });
           }
        },
        onSuccess: (convId: string, reply: string, outputMap?: string, subIntent?: string) => {
            setConversationId(convId);
            setIsSending(false);
            // Finalize if needed, usually onEvent handles the text updates.
            // If reply is empty (streamed), we are good.
            // If reply is provided (non-streamed or fallback), update it.
            
            console.log('[HomeScreen] onSuccess - reply:', reply);
            console.log('[HomeScreen] onSuccess - outputMap:', outputMap);
            
            setMessages((prev: Message[]) => {
               const newMsgs = [...prev];
               const index = newMsgs.findIndex(m => m.id === botMsgId);
               if (index !== -1) {
                   // Get the final text (either from reply or already accumulated in streaming)
                   const finalText = reply || newMsgs[index].text;
                   
                   // Extract activity IDs from the final text
                   const activityIds = extractActivityIds(finalText);
                   console.log('[HomeScreen] Extracted activity IDs:', activityIds);
                   
                   if (reply && !newMsgs[index].text) {
                       // If reply was provided but text is empty, use reply
                       newMsgs[index] = {
                           ...newMsgs[index],
                           text: reply,
                           isLoading: false,
                           activityIds: activityIds.length > 0 ? activityIds : undefined,
                       };
                   } else {
                       // Mark as complete
                       newMsgs[index] = {
                           ...newMsgs[index],
                           isLoading: false,
                           activityIds: activityIds.length > 0 ? activityIds : undefined,
                       };
                   }
                   console.log('[HomeScreen] Updated message with activityIds:', newMsgs[index].activityIds);
               }
               return newMsgs;
           });
        },
        onError: (code: string, msg: string) => {
            console.error('API Error:', code, msg);
            setIsSending(false);
            setMessages((prev: Message[]) => {
                   const newMsgs = [...prev];
                   const index = newMsgs.findIndex(m => m.id === botMsgId);
                   if (index !== -1) {
                       newMsgs[index] = {
                           ...newMsgs[index],
                           text: newMsgs[index].text || "Sorry, something went wrong.",
                           isLoading: false,
                       };
                   }
                   return newMsgs;
            });
        },
        onComplete: () => {
            setIsSending(false);
        }
      },
      conversationId
    );
  };

  const renderWelcome = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContent}>
        {/* Main Title */}
        <Text style={styles.mainTitle}>我是大志</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
            说出你想踢球的时间、地点，我能帮你找到合适的散客活动
        </Text>

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
            <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => sendMessage("周末哪里有球踢？")}
            >
            <Text style={styles.suggestionText}>周末哪里有球踢？</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => sendMessage("想在朝阳体育公园组踢个球")}
            >
            <Text style={styles.suggestionText}>想在朝阳体育公园组踢个球</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => sendMessage("这周三中午在西二旗有球踢吗？")}
            >
            <Text style={styles.suggestionText}>这周三中午在西二旗有球踢吗？</Text>
            </TouchableOpacity>
        </View>
        </View>
    </ScrollView>
  );

  const handleActivitySignup = (activityId: number, activityInfo: ActivityInfo) => {
    console.log('[HomeScreen] Opening activity detail sheet for:', activityId, activityInfo);
    setSelectedActivity(activityInfo);
    setSheetVisible(true);
  };

  const handleSheetSignup = (status: 'signup' | 'pending') => {
    if (!selectedActivity) return;
    
    console.log('[HomeScreen] User confirmed action:', status, 'for activity:', selectedActivity.activityId);
    setSheetLoading(true);
    
    // 模拟网络请求
    setTimeout(() => {
      setSheetLoading(false);
      setSheetVisible(false);
      setSelectedActivity(null);
      
      // TODO: 这里可以发送报名请求到后端
      // 根据 status 决定是"报名"还是"待定"
      console.log('[HomeScreen] Action completed:', status);
      
      // 可以显示一个 Toast 或成功提示
    }, 1000);
  };

  const handleSheetClose = () => {
    setSheetVisible(false);
    setSelectedActivity(null);
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
      const isUser = item.isUser;
      const displayContent = getDisplayContent(item.text);
      
      // Debug log
      if (!isUser && item.activityIds) {
          console.log('[renderMessageItem] Bot message with activityIds:', item.activityIds);
      }
      
      return (
          <View>
              {/* Message Bubble */}
              <View style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowBot
              ]}>
                  <View style={[
                      styles.messageBubble,
                      isUser ? styles.userBubble : styles.botBubble
                  ]}>
                      {item.isLoading && !item.text ? (
                          <LoadingIndicator size={20} color={isUser ? '#fff' : '#E65100'} />
                      ) : displayContent ? (
                          <Text style={[
                              styles.messageText,
                              isUser ? styles.userMessageText : styles.botMessageText
                          ]}>
                              {displayContent}
                          </Text>
                      ) : null}
                  </View>
              </View>
              
              {/* Activity Cards */}
              {!isUser && item.activityIds && item.activityIds.length > 0 && (
                  <View style={styles.activityListContainer}>
                      <ActivityCardList
                          activityIds={item.activityIds}
                          onSignup={handleActivitySignup}
                      />
                  </View>
              )}
          </View>
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>大志</Text>
        <TouchableOpacity 
          style={styles.newTopicButton}
          onPress={startNewTopic}
        >
          <Text style={styles.newTopicIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Detail Sheet */}
      <ActivityDetailSheet
        visible={sheetVisible}
        activity={selectedActivity}
        onClose={handleSheetClose}
        onSignup={handleSheetSignup}
        isLoading={sheetLoading}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contentContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {messages.length === 0 ? (
            renderWelcome()
        ) : (
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.chatListContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
        )}

        {/* Bottom Area: Actions + Input */}
        <View style={styles.bottomArea}>
            {/* Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => sendMessage('你好大志，能给我推荐几个活动吗？')}
                >
                    <Text style={styles.actionButtonIcon}>🏃</Text>
                    <Text style={styles.actionButtonText}>找活动</Text>
                </TouchableOpacity>
            </View>

            {/* Input Area */}
            <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="发消息..."
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={() => sendMessage(inputText)}
                    returnKeyType="send"
                />
                </View>
                <TouchableOpacity 
                    style={[styles.sendButton, { backgroundColor: inputText.trim() ? '#E65100' : '#ccc' }]}
                    onPress={() => sendMessage(inputText)}
                    disabled={!inputText.trim()}
                >
                <Text style={styles.sendIcon}>↑</Text>
                </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
  },
  header: {
    height: theme.spacing.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 0,
    elevation: 0,
    backgroundColor: theme.colors.background,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    position: 'relative',
  },
  headerPlaceholder: {
    position: 'absolute',
    left: theme.spacing.lg,
    width: 36,
    height: 36,
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  newTopicButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newTopicIcon: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 100,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F0FE',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...theme.shadows.medium,
  },
  logoIcon: {
    fontSize: 40,
    color: theme.colors.text.primary,
  },
  mainTitle: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: theme.spacing.sm,
  },
  suggestionsContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  suggestionButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    width: '100%',
  },
  suggestionText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  bottomArea: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 0,
  },
  actionButtonsRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  actionButtonText: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.text.primary,
  },
  inputRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginRight: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.inputText,
    fontSize: 14,
    flex: 1,
    padding: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  sendIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  chatListContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      paddingTop: theme.spacing.sm,
  },
  messageRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
      alignItems: 'flex-start',
  },
  messageRowUser: {
      justifyContent: 'flex-end',
  },
  messageRowBot: {
      justifyContent: 'flex-start',
  },
  messageBubble: {
      maxWidth: '80%',
      padding: theme.spacing.md,
      borderRadius: theme.radius.bubble,
  },
  userBubble: {
      backgroundColor: theme.colors.messageBubbleUser,
      borderTopRightRadius: 4,
  },
  botBubble: {
      backgroundColor: theme.colors.messageBubbleBot,
      borderTopLeftRadius: 4,
  },
  messageText: {
    ...theme.typography.body,
  },
  userMessageText: {
      color: theme.colors.messageBubbleUserText,
  },
  botMessageText: {
      color: theme.colors.messageBubbleBotText,
  },
  activityListContainer: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
  },
});

export default HomeScreen;
