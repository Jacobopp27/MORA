import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { useState, useCallback } from 'react'
import { ChevronLeft, CheckCheck, Star, MessageCircle, ShieldCheck, Bell } from 'lucide-react-native'
import { Colors } from '../constants/Colors'
import { api } from '../lib/api'

const ICON_CONFIG = {
  confirm: { icon: CheckCheck, color: Colors.green, bg: Colors.greenBg },
  review: { icon: Star, color: Colors.amber, bg: Colors.amberBg },
  verified: { icon: ShieldCheck, color: Colors.primary, bg: Colors.primaryBg },
  message: { icon: MessageCircle, color: Colors.blue, bg: Colors.blueBg },
  view: { icon: Bell, color: Colors.textMuted, bg: Colors.surface },
  reminder: { icon: Bell, color: Colors.textMuted, bg: Colors.surface },
  welcome: { icon: Bell, color: Colors.pink, bg: '#fdf2f8' },
}

function NotificationItem({ item, onMarkRead }) {
  const config = ICON_CONFIG[item.type] || ICON_CONFIG.reminder
  const Icon = config.icon

  return (
    <TouchableOpacity
      style={[styles.notifItem, !item.read && styles.notifItemUnread]}
      activeOpacity={0.8}
      onPress={() => onMarkRead(item.id)}
    >
      <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
        <Icon size={18} color={config.color} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifTitleRow}>
          <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  )
}

function formatNotifTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMin < 60) return `Hace ${diffMin} min`
  if (diffHours < 24) return `Hace ${diffHours} h`
  if (diffDays === 1) return 'Ayer'
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

function groupNotifications(notifications) {
  const now = new Date()
  const today = []
  const yesterday = []
  const older = []
  for (const n of notifications) {
    const date = new Date(n.createdAt || n.created_at || Date.now())
    const diffDays = Math.floor((now - date) / 86400000)
    if (diffDays === 0) today.push(n)
    else if (diffDays === 1) yesterday.push(n)
    else older.push(n)
  }
  return [
    { title: 'Hoy', data: today },
    { title: 'Ayer', data: yesterday },
    { title: 'Esta semana', data: older },
  ].filter((s) => s.data.length > 0)
}

export default function NotificacionesScreen() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      async function loadAndMarkRead() {
        setLoading(true)
        try {
          const result = await api.getNotifications()
          setNotifications(result.notifications || [])
          await api.markAllRead()
        } catch (e) {
          // silent fail - show empty state
        } finally {
          setLoading(false)
        }
      }
      loadAndMarkRead()
    }, [])
  )

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await api.markAllRead()
    } catch (e) {}
  }

  const mappedNotifications = notifications.map((n) => ({
    ...n,
    id: String(n.id),
    title: n.title || n.message || '',
    body: n.body || n.message || '',
    time: formatNotifTime(n.createdAt || n.created_at),
    type: n.type || 'reminder',
    read: n.isRead ?? n.read ?? true,
  }))

  const sections = groupNotifications(mappedNotifications)

  const unreadCount = mappedNotifications.filter((n) => !n.read).length

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={Colors.textMain} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.markAllBtn}
          onPress={markAllRead}
          activeOpacity={0.7}
        >
          <Text style={styles.markAllText}>Marcar leídas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem item={item} onMarkRead={markRead} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptyBody}>Aquí aparecerán tus notificaciones</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textMain,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  markAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifItemUnread: {
    backgroundColor: '#faf5ff',
    borderColor: Colors.primaryBorder,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    flexShrink: 0,
  },
  notifBody: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textMain,
  },
  emptyBody: {
    fontSize: 14,
    color: Colors.textMuted,
  },
})
