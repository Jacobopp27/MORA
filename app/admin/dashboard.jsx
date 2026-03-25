import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  Users,
  ShieldCheck,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
} from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { api } from '../../lib/api'
import { logout } from '../../lib/auth'

const STATUS_CONFIG = {
  pending: { icon: Clock, color: Colors.amber, bg: Colors.amberBg },
  approved: { icon: CheckCircle, color: Colors.green, bg: Colors.greenBg },
  rejected: { icon: XCircle, color: '#ef4444', bg: '#fff5f5' },
}

const CHART_MONTHS = [
  { label: 'Oct', value: 45 },
  { label: 'Nov', value: 62 },
  { label: 'Dic', value: 55 },
  { label: 'Ene', value: 78 },
  { label: 'Feb', value: 91 },
  { label: 'Mar', value: 100 },
]

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null)
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const colors = ['#7c3aed', '#f472b6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899']

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, verificationsData] = await Promise.all([
          api.getAdminStats(),
          api.getPendingVerifications(),
        ])
        setStats(statsData)
        const mapped = verificationsData.requests.slice(0, 4).map((r, i) => ({
          id: r.id,
          name: r.profile?.fullName || 'Sin nombre',
          initials: (r.profile?.fullName || 'XX')
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          color: colors[i % colors.length],
          specialty: r.providerProfile?.serviceType || 'Pendiente',
          status: r.status,
          time: new Date(r.createdAt).toLocaleDateString('es-CO'),
        }))
        setRecentRequests(mapped)
      } catch (err) {
        // silently fail — UI will remain in loading state or show empty
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const headerSubDate = new Date().toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Dashboard Admin</Text>
            <Text style={styles.headerSub}>{headerSubDate}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login') } },
              ])
            }}
            activeOpacity={0.7}
          >
            <LogOut size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  const metrics = stats
    ? [
        {
          icon: Users,
          label: 'Total usuarias',
          value: String(stats.totalUsers),
          delta: `+${stats.newToday} hoy`,
          color: Colors.primary,
        },
        {
          icon: ShieldCheck,
          label: 'Verificadas',
          value: String(stats.approved),
          delta: `${stats.totalUsers > 0 ? Math.round((stats.approved / stats.totalUsers) * 100) : 0}% del total`,
          color: Colors.green,
        },
        {
          icon: Clock,
          label: 'Pendientes',
          value: String(stats.pending),
          delta: 'Por revisar',
          color: Colors.amber,
        },
        {
          icon: TrendingUp,
          label: 'Nuevas hoy',
          value: String(stats.newToday),
          delta: 'Registros hoy',
          color: Colors.blue,
        },
      ]
    : []

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Dashboard Admin</Text>
          <Text style={styles.headerSub}>{headerSubDate}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Salir', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login') } },
            ])
          }}
          activeOpacity={0.7}
        >
          <LogOut size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Metrics grid */}
        <View style={styles.metricsGrid}>
          {metrics.map((m, i) => {
            const Icon = m.icon
            return (
              <View key={i} style={styles.metricCard}>
                <View style={[styles.metricIconCircle, { backgroundColor: m.color + '18' }]}>
                  <Icon size={20} color={m.color} />
                </View>
                <Text style={styles.metricValue}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={[styles.metricDelta, { color: m.color }]}>{m.delta}</Text>
              </View>
            )
          })}
        </View>

        {/* Bar chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuevos registros por mes</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {CHART_MONTHS.map((m, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <Text style={styles.chartBarValue}>
                    {Math.round((m.value / 100) * 34)}
                  </Text>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: m.value * 0.85,
                        backgroundColor:
                          i === CHART_MONTHS.length - 1
                            ? Colors.primary
                            : Colors.primaryBorder,
                      },
                    ]}
                  />
                  <Text style={styles.chartBarLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Solicitudes recientes</Text>
            <TouchableOpacity
              onPress={() => router.push('/admin')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.requestsList}>
            {recentRequests.map((item, i) => {
              const config = STATUS_CONFIG[item.status]
              const StatusIcon = config.icon
              return (
                <View
                  key={item.id}
                  style={[
                    styles.recentRow,
                    i < recentRequests.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.border,
                    },
                  ]}
                >
                  <View
                    style={[styles.recentAvatar, { backgroundColor: item.color + '22' }]}
                  >
                    <Text style={[styles.recentAvatarText, { color: item.color }]}>
                      {item.initials}
                    </Text>
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName}>{item.name}</Text>
                    <Text style={styles.recentSpecialty}>
                      {item.specialty} · {item.time}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
                    <StatusIcon size={12} color={config.color} />
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.reviewBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/admin')}
          >
            <Eye size={18} color={Colors.white} />
            <Text style={styles.reviewBtnText}>Revisar solicitudes pendientes</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  metricIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textMain,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  metricDelta: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
  },
  chartBarCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  chartBarValue: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  chartBar: {
    width: '55%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  requestsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentAvatarText: {
    fontSize: 13,
    fontWeight: '800',
  },
  recentInfo: {
    flex: 1,
    gap: 3,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
  },
  recentSpecialty: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusPill: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
  },
  reviewBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
})
