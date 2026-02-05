import React, { useState, useRef, useEffect } from 'react';
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
import { CozeApi, HistoryMessage } from '../api/CozeApi';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
}

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

const HomeScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const flatListRef = useRef<FlatList>(null);

  const userId = "user_" + Math.floor(Math.random() * 1000000);

  const startNewTopic = () => {
    // Reset all state to start a new conversation
    setMessages([]);
    setInputText('');
    setConversationId(undefined);
    setIsSending(false);
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
    };

    setMessages(prev => [...prev, userMsg]);
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
    setMessages(prev => [...prev, botMsg]);

    CozeApi.chatWithStream(
      userId,
      text,
      history,
      {
        onEvent: (event, data) => {
           console.log('[HomeScreen] onEvent:', event, 'data:', data);
           if (event === 'conversation.message.delta') {
               setMessages(prev => {
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
        onSuccess: (convId, reply, outputMap, subIntent) => {
            setConversationId(convId);
            setIsSending(false);
            // Finalize if needed, usually onEvent handles the text updates.
            // If reply is empty (streamed), we are good.
            // If reply is provided (non-streamed or fallback), update it.
            if (reply) {
                setMessages(prev => {
                   const newMsgs = [...prev];
                   const index = newMsgs.findIndex(m => m.id === botMsgId);
                   if (index !== -1 && !newMsgs[index].text) {
                       newMsgs[index] = {
                           ...newMsgs[index],
                           text: reply,
                           isLoading: false,
                       };
                   }
                   return newMsgs;
               });
            } else {
                setMessages(prev => {
                   const newMsgs = [...prev];
                   const index = newMsgs.findIndex(m => m.id === botMsgId);
                   if (index !== -1) {
                       newMsgs[index] = {
                           ...newMsgs[index],
                           isLoading: false,
                       };
                   }
                   return newMsgs;
               });
            }
        },
        onError: (code, msg) => {
            console.error('API Error:', code, msg);
            setIsSending(false);
            setMessages(prev => {
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

  const renderMessageItem = ({ item }: { item: Message }) => {
      const isUser = item.isUser;
      return (
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
                  ) : (
                      <Text style={[
                          styles.messageText,
                          isUser ? styles.userMessageText : styles.botMessageText
                      ]}>
                          {getDisplayContent(item.text)}
                      </Text>
                  )}
              </View>
          </View>
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>大志</Text>
        <TouchableOpacity 
          style={styles.newTopicButton}
          onPress={startNewTopic}
        >
          <Text style={styles.newTopicIcon}>➕</Text>
        </TouchableOpacity>
      </View>

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
                <TouchableOpacity style={styles.actionButton}>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 0,
    elevation: 0,
    backgroundColor: theme.colors.background,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  newTopicButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundSecondary,
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
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    height: theme.spacing.inputHeight,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginRight: theme.spacing.md,
    ...theme.shadows.light,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.inputText,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
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
});

export default HomeScreen;
