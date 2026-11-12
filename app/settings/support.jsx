import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function ChatSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'support',
      text: 'Hello Alex! Welcome to Technokrate Hire support. How can we assist your job search today?',
      time: '09:40 AM',
    },
    {
      id: '2',
      sender: 'user',
      text: 'Hi, I would like to know how profile boosting works for the Basic plan.',
      time: '09:42 AM',
    },
    {
      id: '3',
      sender: 'support',
      text: 'Great question! Profile boosting highlights your application to top employers in your category, giving you 3x more recruiter views.',
      time: '09:45 AM',
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        scrollToBottom();
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        scrollToBottom();
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    const userText = inputMsg.trim();
    const newMsg = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
      time: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'support',
          text: 'Thank you for reaching out! Our team is reviewing your query.',
          time: 'Just now',
        },
      ]);
    }, 1000);
  };

  const bottomInset = keyboardHeight > 0
    ? 10
    : Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.topNav}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          <View style={styles.headerInfo}>
            <Text style={styles.navTitle}>Chat Support</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Support Agent Online</Text>
            </View>
          </View>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Independent scrollable messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <View
                key={m.id}
                style={[styles.msgWrapper, isUser ? styles.msgRight : styles.msgLeft]}
              >
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleSupport]}>
                  <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                    {m.text}
                  </Text>
                  <Text style={[styles.timeText, isUser && styles.timeTextUser]}>
                    {m.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Safe-Area Bottom Input Composer */}
        <View style={[styles.inputBar, { paddingBottom: bottomInset }]}>
          <TextInput
            style={styles.input}
            placeholder="Type message here..."
            placeholderTextColor={COLORS.mutedText}
            value={inputMsg}
            onChangeText={(text) => {
              setInputMsg(text);
              scrollToBottom();
            }}
            onFocus={scrollToBottom}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, pressed && styles.sendBtnPressed]}
            onPress={handleSend}
            hitSlop={8}
          >
            <Ionicons name="send" size={17} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerInfo: {
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FAF5FC',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  msgWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleSupport: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 13.5,
    color: COLORS.text,
    lineHeight: 19,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextUser: {
    color: '#E9D5FF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});