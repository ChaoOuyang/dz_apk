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
} from 'react-native';
import { CozeApi, HistoryMessage } from '../api/CozeApi';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
}

const HomeScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const flatListRef = useRef<FlatList>(null);

  const userId = "user_" + Math.floor(Math.random() * 1000000);

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
        type: 'answer', // simplified
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

  const startNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setIsSending(false);
  };

  const renderWelcome = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🔧</Text>
        </View>

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
              {!isUser && (
                  <View style={styles.botAvatar}>
                      <Text style={styles.botAvatarText}>🔧</Text>
                  </View>
              )}
              <View style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.botBubble
              ]}>
                  <Text style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : styles.botMessageText
                  ]}>
                      {item.text}
                  </Text>
                  {item.isLoading && !item.text && (
                       <ActivityIndicator size="small" color="#999" style={{marginTop: 5}} />
                  )}
              </View>
          </View>
      );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>大志</Text>
        <TouchableOpacity 
            style={styles.headerRightIcon}
            onPress={startNewChat}
        >
          <Text style={styles.plusIcon}>+</Text>
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
                    placeholderTextColor="#999"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0, 
    elevation: 0,
    backgroundColor: '#fff',
  },
  headerSpacer: {
    width: 24, // To balance the right icon
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRightIcon: {
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#999',
    borderRadius: 6,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginTop: -2,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 120, // Space for input area
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F0FE', // Light blue background
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 40,
    color: '#000', // Or a dark blue if preferred
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E65100', // Orange color
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 12,
  },
  suggestionButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  bottomArea: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
  },
  actionButtonsRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 6,
    color: '#000',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  inputRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    fontSize: 16,
    color: '#000',
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
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 10,
  },
  messageRow: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'flex-start',
  },
  messageRowUser: {
      justifyContent: 'flex-end',
  },
  messageRowBot: {
      justifyContent: 'flex-start',
  },
  botAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#E8F0FE',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
  },
  botAvatarText: {
      fontSize: 20,
  },
  messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
  },
  userBubble: {
      backgroundColor: '#E65100',
      borderTopRightRadius: 4,
  },
  botBubble: {
      backgroundColor: '#F5F5F5',
      borderTopLeftRadius: 4,
  },
  messageText: {
      fontSize: 16,
      lineHeight: 22,
  },
  userMessageText: {
      color: '#fff',
  },
  botMessageText: {
      color: '#333',
  },
});

export default HomeScreen;
