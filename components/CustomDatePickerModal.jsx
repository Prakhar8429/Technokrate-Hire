import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePickerModal({
  visible,
  onClose,
  onSelectDate,
  initialDate,
  title = 'Select Date',
}) {
  // Parse initial date (YYYY-MM-DD) or default to today
  const parseDate = (dStr) => {
    if (dStr && /^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const initial = parseDate(initialDate);
  const [currentYear, setCurrentYear] = useState(initial.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initial.getMonth());
  const [selectedDay, setSelectedDay] = useState(initial.getDate());

  // Navigation: previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  // Navigation: next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Navigation: previous year
  const handlePrevYear = () => {
    setCurrentYear((y) => y - 1);
  };

  // Navigation: next year
  const handleNextYear = () => {
    setCurrentYear((y) => y + 1);
  };

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePickDay = (day) => {
    setSelectedDay(day);
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const formattedDate = `${currentYear}-${mStr}-${dStr}`;
    onSelectDate(formattedDate);
    onClose();
  };

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => { e?.stopPropagation?.(); }}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          {/* Month / Year Navigator */}
          <View style={styles.navRow}>
            <View style={styles.navBtnGroup}>
              <Pressable onPress={handlePrevYear} hitSlop={8} style={styles.navIconBtn}>
                <Ionicons name="play-back" size={16} color={COLORS.primary} />
              </Pressable>
              <Pressable onPress={handlePrevMonth} hitSlop={8} style={styles.navIconBtn}>
                <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
              </Pressable>
            </View>

            <Text style={styles.monthYearText}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>

            <View style={styles.navBtnGroup}>
              <Pressable onPress={handleNextMonth} hitSlop={8} style={styles.navIconBtn}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
              </Pressable>
              <Pressable onPress={handleNextYear} hitSlop={8} style={styles.navIconBtn}>
                <Ionicons name="play-forward" size={16} color={COLORS.primary} />
              </Pressable>
            </View>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdaysRow}>
            {DAYS_OF_WEEK.map((d, idx) => (
              <Text key={idx} style={styles.weekdayLabel}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <View key={idx} style={styles.emptyDayBox} />;
              }
              const isSelected =
                day === selectedDay &&
                currentMonth === initial.getMonth() &&
                currentYear === initial.getFullYear();

              return (
                <Pressable
                  key={idx}
                  style={[styles.dayBox, isSelected && styles.dayBoxSelected]}
                  onPress={() => handlePickDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Footer Cancel / Today buttons */}
          <View style={styles.footerRow}>
            <Pressable
              style={styles.todayBtn}
              onPress={() => {
                const today = new Date();
                setCurrentYear(today.getFullYear());
                setCurrentMonth(today.getMonth());
                handlePickDay(today.getDate());
              }}
            >
              <Text style={styles.todayBtnText}>Today</Text>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navIconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F3E8FF',
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emptyDayBox: {
    width: 38,
    height: 38,
    marginVertical: 2,
  },
  dayBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayBoxSelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: 13.5,
    color: '#334155',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  todayBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F3E8FF',
  },
  todayBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
