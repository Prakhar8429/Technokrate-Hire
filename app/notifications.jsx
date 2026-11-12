import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  BackHandler,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { notificationService } from '../services/notificationService';

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/(tabs)/dashboard');
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      handleGoBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [router]);

  const loadNotifications = useCallback(async () => {
    try {
      const [res, count] = await Promise.all([
        notificationService.getNotifications({ page: 1, limit: 20 }),
        notificationService.getUnreadCount(),
      ]);

      setUnreadCount(count || 0);

      if (res && Array.isArray(res.notifications) && res.notifications.length > 0) {
        const mapped = res.notifications.map((n, idx) => {
          const type = (n.type || n.category || '').toLowerCase();
          const isInterview = type.includes('interview');
          const isMsg = type.includes('message');
          return {
            id: n._id || n.id || String(idx),
            category: isInterview ? 'Interviews' : isMsg ? 'Messages' : 'Applications',
            title: n.title || (isInterview ? 'Interview Invitation' : 'Notification'),
            time: n.createdAt
              ? new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Recently',
            description: n.message || n.description || '',
            isRead: Boolean(n.isRead),
            hasActions: isInterview,
            icon: isInterview ? 'calendar' : isMsg ? 'chatbubble-ellipses' : 'notifications',
            iconColor: isInterview ? COLORS.teal : isMsg ? '#3B82F6' : COLORS.primary,
            iconBg: isInterview ? '#E6FBF7' : isMsg ? '#EFF6FF' : '#F3E8FF',
          };
        });
        setNotifications(mapped);
      } else {
        // Fallback default helpful list if backend has 0 notifications yet
        setNotifications([
          {
            id: '1',
            category: 'Interviews',
            title: 'Welcome to Technokrate Hire',
            time: 'Today',
            description: 'Start exploring active job openings and create personalized job alerts.',
            isRead: true,
            hasActions: false,
            icon: 'checkmark-circle',
            iconColor: COLORS.teal,
            iconBg: '#E6FBF7',
          },
        ]);
      }
    } catch (e) {
      console.log('Error loading notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleItemPress = async (item) => {
    if (!item.isRead && item.id) {
      await notificationService.markSingleAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      if (unreadCount > 0) setUnreadCount((c) => c - 1);
    }
  };

  const tabs = ['All', 'Applications', 'Messages', 'Interviews'];

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter((n) => n.category === activeTab);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <Pressable style={styles.backBtn} onPress={handleGoBack} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          <Text style={styles.backText}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badgeBox}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>

        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllRead} hitSlop={8}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Categories Horizontal Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.tabPill, isSelected && styles.tabPillActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 8, color: COLORS.mutedText, fontSize: 13 }}>Loading notifications...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Ionicons name="notifications-off-outline" size={42} color="#CBD5E1" />
            <Text style={{ marginTop: 12, fontWeight: '700', fontSize: 15, color: '#475569' }}>
              No notifications yet
            </Text>
            <Text style={{ marginTop: 4, color: '#94A3B8', fontSize: 13 }}>
              You will receive updates here as companies review your applications.
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.card, !item.isRead && styles.cardUnread]}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={18} color={item.iconColor} />
                </View>
                <View style={styles.titleCol}>
                  <View style={styles.titleRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                  <Text style={styles.notifDesc}>{item.description}</Text>
                </View>
              </View>

              {item.hasActions && (
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.scheduleBtn}
                    onPress={() => router.push('/(tabs)/jobs')}
                  >
                    <Text style={styles.scheduleBtnText}>Schedule now</Text>
                  </Pressable>
                  <Pressable
                    style={styles.viewDetailBtn}
                    onPress={() => router.push('/(tabs)/jobs')}
                  >
                    <Text style={styles.viewDetailText}>View Detail</Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBg,
  },
  topNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  badgeBox: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  markAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  cardUnread: {
    borderColor: '#C084FC',
    backgroundColor: '#FDFAFF',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7000B0',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2E6F8',
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.mutedText,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.mutedText,
  },
  notifDesc: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3E8FF',
  },
  scheduleBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  scheduleBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewDetailBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  viewDetailText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});