import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, Search, X, ShieldCheck, Clock, XCircle, Shield } from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { api } from '../../lib/api'

const AVATAR_COLORS = ['#7c3aed','#f472b6','#10b981','#f59e0b','#3b82f6','#ec4899']

const STATUS_CONFIG = {
  approved:   { icon: ShieldCheck, color: Colors.green,   bg: Colors.greenBg,  label: 'Verificada' },
  in_review:  { icon: Clock,       color: Colors.amber,   bg: Colors.amberBg,  label: 'En revisión' },
  pending:    { icon: Clock,       color: Colors.amber,   bg: Colors.amberBg,  label: 'Pendiente'  },
  rejected:   { icon: XCircle,     color: '#ef4444',      bg: '#fff5f5',        label: 'Rechazada'  },
}

const ROLE_CONFIG = {
  admin:      { label: 'Admin',      color: '#7c3aed', bg: '#f3f0ff' },
  proveedora: { label: 'Proveedora', color: '#0ea5e9', bg: '#f0f9ff' },
  usuaria:    { label: 'Usuaria',    color: Colors.textMuted, bg: Colors.surface },
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

function UserRow({ item, index }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const status = STATUS_CONFIG[item.verificationStatus] || STATUS_CONFIG.pending
  const role   = ROLE_CONFIG[item.role] || ROLE_CONFIG.usuaria
  const StatusIcon = status.icon

  return (
    <View style={styles.userRow}>
      <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
        <Text style={[styles.avatarText, { color }]}>{initials(item.fullName)}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1}>{item.fullName}</Text>
          <View style={[styles.rolePill, { backgroundColor: role.bg }]}>
            <Text style={[styles.rolePillText, { color: role.color }]}>{role.label}</Text>
          </View>
        </View>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        <Text style={styles.userMeta}>
          {item.city || 'Sin ciudad'} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO') : ''}
        </Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
        <StatusIcon size={12} color={status.color} />
      </View>
    </View>
  )
}

export default function AdminUsuariosScreen() {
  const [users, setUsers]         = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadUsers = useCallback(async (q = '') => {
    try {
      const data = await api.getUsers(q || undefined)
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => loadUsers(search), 400)
    return () => clearTimeout(t)
  }, [search])

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Usuarios</Text>
          <Text style={styles.headerSub}>{users.length} registradas</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, email o ciudad..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total',      value: users.length,                                          color: Colors.textMain },
          { label: 'Verificadas',value: users.filter(u => u.verificationStatus === 'approved').length, color: Colors.green  },
          { label: 'Pendientes', value: users.filter(u => ['pending','in_review'].includes(u.verificationStatus)).length, color: Colors.amber  },
          { label: 'Proveedoras',value: users.filter(u => u.role === 'proveedora').length,     color: '#0ea5e9'     },
        ].map((s, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => <UserRow item={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadUsers(search) }}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Shield size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>
                {search ? 'Sin resultados' : 'Sin usuarias'}
              </Text>
              <Text style={styles.emptyBody}>
                {search ? `No se encontró "${search}"` : 'Aún no hay usuarias registradas'}
              </Text>
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
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'center' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  searchContainer: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textMain },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  statItem:  { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500', marginTop: 2 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, gap: 8 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  avatar:     { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 15, fontWeight: '800' },
  userInfo:   { flex: 1, gap: 3 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName:   { fontSize: 15, fontWeight: '700', color: Colors.textMain, flex: 1 },
  rolePill:   { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  rolePillText: { fontSize: 10, fontWeight: '700' },
  userEmail:  { fontSize: 12, color: Colors.textMuted },
  userMeta:   { fontSize: 11, color: Colors.textLight },
  statusPill: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textMain },
  emptyBody:  { fontSize: 14, color: Colors.textMuted },
})
