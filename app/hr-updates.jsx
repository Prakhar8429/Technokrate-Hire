import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Modal,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { jobService } from '../services/jobService';

export default function HRUpdatesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [updates, setUpdates] = useState([]);
  const [tracking, setTracking] = useState(jobService.getTrackingSummary());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const loadData = useCallback(async () => {
    const list = await jobService.getHRUpdates(activeTab);
    setUpdates(list);
    setTracking(jobService.getTrackingSummary());
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const tabs = [
    { key: 'All', label: 'All' },
    { key: 'Interview Requests', label: `Interview Requests (${tracking.hr.interviewRequests})` },
    { key: 'Messages', label: `Messages (${tracking.hr.messages})` },
  ];

  const handleItemPress = (item) => {
    setSelectedItem(item);
    if (!item.isRead && item.id) {
      jobService.markHRUpdateAsRead(item.id);
      setUpdates((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, isRead: true } : u))
      );
    }
  };

  const renderUpdateCard = ({ item }) => {
    return (
      <Pressable
        style={({ pressed }) => [styles.updateCard, pressed && styles.cardPressed]}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.cardRow}>
          {/* Leading Icon */}
          <View style={[styles.iconBox, { backgroundColor: item.iconBg || '#EFF6FF' }]}>
            <Ionicons
              name={item.icon || 'chatbubble-ellipses'}
              size={18}
              color={item.iconColor || COLORS.primary}
            />
          </View>

          {/* Text Column */}
          <View style={styles.textCol}>
            <View style={styles.headerTitleRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {!item.isRead && (
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#6C47FF' }} />
                )}
              </View>
              <Text style={styles.timestampText}>{item.timestamp}</Text>
            </View>
            <Text style={styles.subtitleText} numberOfLines={1}>{item.subtitle}</Text>
            {Boolean(item.body) && (
              <Text style={styles.bodyText} numberOfLines={1}>
                {item.body}
              </Text>
            )}
          </View>

          {/* Trailing Chevron */}
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{ marginLeft: 4 }} />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.backBtn} onPress={handleGoBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>HR Updates</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(t) => t.key}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => {
            const isActive = activeTab === item.key;
            return (
              <Pressable
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setActiveTab(item.key)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* HR Updates List */}
      <FlatList
        data={updates}
        keyExtractor={(item) => item.id}
        renderItem={renderUpdateCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-unread-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No updates right now</Text>
            <Text style={styles.emptySubtitle}>
              New recruiter invitations and messages will appear here.
            </Text>
          </View>
        }
      />

      {/* Detail Dialog Modal */}
      {selectedItem && (
        <Modal
          visible={Boolean(selectedItem)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setSelectedItem(null)}>
            <Pressable style={styles.modalContent} onPress={(e) => { e?.stopPropagation?.(); }}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconBox, { backgroundColor: selectedItem.iconBg }]}>
                  <Ionicons name={selectedItem.icon} size={20} color={selectedItem.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  <Text style={styles.modalSubtitle}>{selectedItem.subtitle}</Text>
                </View>
                <Pressable onPress={() => setSelectedItem(null)} hitSlop={10}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </Pressable>
              </View>

              <Text style={styles.modalTime}>Received: {selectedItem.timestamp}</Text>
              <Text style={styles.modalBody}>{selectedItem.body || 'No additional details provided.'}</Text>

              <View style={styles.modalActionRow}>
                {selectedItem.type === 'interview' ? (
                  <>
                    <Pressable
                      style={styles.modalPrimaryBtn}
                      onPress={() => {
                        setSelectedItem(null);
                        router.push('/(tabs)/jobs');
                      }}
                    >
                      <Text style={styles.modalPrimaryText}>Confirm Availability</Text>
                    </Pressable>
                    <Pressable
                      style={styles.modalSecondaryBtn}
                      onPress={() => setSelectedItem(null)}
                    >
                      <Text style={styles.modalSecondaryText}>Reschedule</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={styles.modalPrimaryBtn}
                    onPress={() => {
                      setSelectedItem(null);
                      router.push('/application-status');
                    }}
                  >
                    <Text style={styles.modalPrimaryText}>View Application</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6FC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6F5',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6F5',
    paddingVertical: 10,
  },
  tabsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#6C47FF',
    borderColor: '#6C47FF',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  updateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  timestampText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  subtitleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  modalTime: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActionRow: {
    gap: 10,
  },
  modalPrimaryBtn: {
    backgroundColor: '#6C47FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
});
