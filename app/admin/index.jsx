import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle, XCircle, Clock, ChevronRight, LogOut, Users, LayoutDashboard,
} from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { api } from '../../lib/api'
import { logout } from '../../lib/auth'

const TABS = [
  { id: 'pending',  label: 'Pendientes',  filter: 'pending'  },
  { id: 'approved', label: 'Aprobadas',   filter: 'approved' },
  { id: 'rejected', label: 'Rechazadas',  filter: 'rejected' },
]

const STATUS_CONFIG = {
  pending:  { icon: Clock,        color: Colors.amber, bg: Colors.amberBg, label: 'Pendiente' },
  approved: { icon: CheckCircle,  color: Colors.green, bg: Colors.greenBg, label: 'Aprobada'  },
  rejected: { icon: XCircle,      color: '#ef4444',    bg: '#fff5f5',       label: 'Rechazada' },
}

const AVATAR_COLORS = ['#7c3aed','#f472b6','#10b981','#f59e0b','#3b82f6','#ec4899']

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

function RequestRow({ item, onApprove, onReject }) {
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
  const StatusIcon = config.icon
  return (
    <TouchableOpacity
      style={styles.requestRow}
      onPress={() => router.push(`/admin/solicitud/${item.id}`)}
      activeOpacity={0.85}
    >
      <View style={[styles.rowAvatar, { backgroundColor: item.color + '22' }]}>
        <Text style={[styles.rowAvatarText, { color: item.color }]}>{item.initials}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowSpecialty}>{item.specialty}{item.city ? ` · ${item.city}` : ''}</Text>
        <Text style={styles.rowDate}>{item.date}</Text>
      </View>
      <View style={styles.rowActions}>
        {item.status === 'pending' ? (
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove(item.id)} activeOpacity={0.8}>
              <CheckCircle size={18} color={Colors.green} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(item.id)} activeOpacity={0.8}>
              <XCircle size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <StatusIcon size={12} color={config.color} />
            <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.label}</Text>
          </View>
        )}
        <ChevronRight size={16} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  )
}

export default function AdminListScreen() {
  const [activeTab, setActiveTab] = useState('pending')
  const [requests, setRequests]   = useState([])
  const [counts, setCounts]       = useState({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async (tab = activeTab) => {
    try {
      // Load current tab
      const data = await api.getPendingVerifications()
      // API currently returns all — filter client-side
      const all = (data.requests || []).map((r, i) => ({
        id:        r.id,
        name:      r.userFullName  || 'Sin nombre',
        initials:  initials(r.userFullName),
        color:     AVATAR_COLORS[i % AVATAR_COLORS.length],
        specialty: r.userRole === 'proveedora' ? 'Proveedora' : 'Usuaria',
        city:      r.userCity    || '',
        date:      r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-CO') : '',
        status:    r.status,
      }))
      setRequests(all)
      setCounts({
        pending:  all.filter(r => r.status === 'pending').length,
        approved: all.filter(r => r.status === 'approved').length,
        rejected: all.filter(r => r.status === 'rejected').length,
      })
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudieron cargar las solicitudes.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function handleApprove(id) {
    Alert.alert('Aprobar solicitud', '¿Confirmas que deseas aprobar esta verificación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aprobar', style: 'default',
        onPress: async () => {
          try {
            await api.approveVerification({ requestId: id })
            await loadData()
          } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo aprobar.')
          }
        },
      },
    ])
  }

  function handleReject(id) {
    Alert.alert('Rechazar solicitud', 'La solicitud será rechazada. Motivo: "Documentos no válidos".', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar', style: 'destructive',
        onPress: async () => {
          try {
            await api.rejectVerification({ requestId: id, notes: 'Documentos no válidos' })
            await loadData()
          } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo rechazar.')
          }
        },
      },
    ])
  }

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión', style: 'destructive',
        onPress: async () => {
          await logout()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  const filtered = requests.filter(r => r.status === activeTab)

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel Admin</Text>
          <Text style={styles.headerSub}>Verificaciones</Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/admin/dashboard')} activeOpacity={0.7}>
            <LayoutDashboard size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/admin/usuarios')} activeOpacity={0.7}>
            <Users size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, styles.headerBtnRed]} onPress={handleLogout} activeOpacity={0.7}>
            <LogOut size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {counts[tab.filter] > 0 && (
              <View style={[styles.tabBadge, activeTab === tab.id && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.id && styles.tabBadgeTextActive]}>
                  {counts[tab.filter]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <RequestRow item={item} onApprove={handleApprove} onReject={handleReject} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadData() }}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <CheckCircle size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Sin solicitudes</Text>
              <Text style={styles.emptyBody}>No hay solicitudes en esta categoría</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  headerBtns:  { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerBtnRed: { backgroundColor: 'rgba(239,68,68,0.7)' },
  tabsContainer: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  tabActive:         { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText:           { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive:     { color: '#fff' },
  tabBadge:          { backgroundColor: Colors.borderMed, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, minWidth: 18, alignItems: 'center' },
  tabBadgeActive:    { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabBadgeText:      { fontSize: 10, fontWeight: '700', color: Colors.textMuted },
  tabBadgeTextActive:{ color: '#fff' },
  listContent:       { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, gap: 8 },
  loadingContainer:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  requestRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  rowAvatar:     { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowAvatarText: { fontSize: 15, fontWeight: '800' },
  rowInfo:       { flex: 1, gap: 3 },
  rowName:       { fontSize: 15, fontWeight: '700', color: Colors.textMain },
  rowSpecialty:  { fontSize: 13, color: Colors.textMuted },
  rowDate:       { fontSize: 11, color: Colors.textLight },
  rowActions:    { alignItems: 'center', gap: 8 },
  actionBtns:    { flexDirection: 'row', gap: 8 },
  approveBtn:    { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.greenBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.green },
  rejectBtn:     { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff5f5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fca5a5' },
  statusBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  emptyState:    { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: Colors.textMain },
  emptyBody:     { fontSize: 14, color: Colors.textMuted },
})
