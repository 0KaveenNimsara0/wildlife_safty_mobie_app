import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import AuthService from '../../services/AuthService';
import { API_URL } from '../../config/api';

const COLORS = {
  primary: '#15803D',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  darkText: '#0F172A',
  mediumText: '#475569',
  lightText: '#94A3B8',
  white: '#FFFFFF',
  border: '#E2E8F0',
  myBubble: '#15803D',
  otherBubble: '#FFFFFF',
};

const ChatDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { user, token, role } = useContext(AuthContext);
  const { conversation, otherParty } = route.params;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  const fetchData = async (silent = false) => {
    if (!token || !role) return;
    try {
      if (!silent) setLoading(true);
      
      const res = await AuthService.getMessages(conversation?._id, token, role);
      if (res.success) {
        setMessages(res.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 3000);
    return () => clearInterval(interval);
  }, [conversation?._id, token, role]);

  const handleSend = async () => {
    if (!inputText.trim() || !token || !role) return;
    
    // For users, receiver is otherParty?._id or otherParty?.uid
    // For MOs, we use conversation details if available
    const receiverId = otherParty?._id || otherParty?.uid || conversation?.userId || conversation?.participantId;
    
    if (!receiverId) {
      Alert.alert('Error', 'Cannot identify receiver');
      return;
    }

    setSending(true);
    const text = inputText;
    setInputText('');

    try {
      const receiverType = conversation?.admin || otherParty?.role === 'admin' ? 'admin' : 'user';
      const res = await AuthService.sendMessage(receiverId, text, token, role, receiverType as any);
      if (res.success) {
        setMessages(prev => [...prev, res.message]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.senderId === user?.uid || item.senderId === user?._id;
    
    return (
      <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
            {item.message}
          </Text>
          <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.otherTimeText]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const resolveAvatar = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) {
      return Platform.OS === 'android' ? path.replace('localhost', '10.0.2.2') : path;
    }
    const baseUrl = API_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const name = otherParty?.name || otherParty?.displayName || (role === 'medical-officer' ? 'User' : 'Medical Officer');
  const avatarUrl = resolveAvatar(otherParty?.photoURL || otherParty?.authorAvatar);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatarImage} />
            ) : (
              <Text style={styles.headerAvatarText}>{name.charAt(0)}</Text>
            )}
          </View>
          <View>
            <Text style={styles.headerName}>{name}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Chat Area */}
      {loading && messages.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Start your conversation with {name}</Text>
            </View>
          }
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor={COLORS.lightText}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Icon name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.lightText,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  myBubble: {
    backgroundColor: COLORS.myBubble,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.otherBubble,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.darkText,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: COLORS.lightText,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 15,
    maxHeight: 100,
    color: COLORS.darkText,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.lightText,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default ChatDetailScreen;
