import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  Settings,
  Eye,
  MessageCircle,
  Star,
  ShieldCheck,
  TrendingUp,
  Edit2,
  Share2,
  BarChart2,
  CheckCircle,
} from 'lucide-react-native'
import { Colors } from '../constants/Colors'

const STATS = [
  { icon: Eye, label: 'Visitas', value: '248', delta: '+12%', color: Colors.blue },
  { icon: MessageCircle, label: 'Consultas', value: '34', delta: '+5%', color: Colors.green },
  { icon: Star, label: 'Calificación', value: '4.9', delta: '87 reseñas', color: Colors.amber },
  { icon: ShieldCheck, label: 'Estado', value: 'Activa', delta: 'Verificada', color: Colors.primary },
]

const QUICK_ACTIONS = [
  { icon: Edit2, label: 'Editar perfil', color: Colors.primary, bg: Colors.primaryBg },
  { icon: Share2, label: 'Compartir', color: Colors.green, bg: Colors.greenBg },
  { icon: BarChart2, label: 'Estadísticas', color: Colors.blue, bg: Colors.blueBg },
  { icon: Settings, label: 'Ajustes', color: Colors.textMuted, bg: Colors.surface },
]

const ACTIVITY = [
  {
    id: '1',
    type: 'view',
    title: 'Julia M. vio tu perfil',
    time: 'Hace 5 min',
    color: Colors.primary,
  },
  {
    id: '2',
    type: 'message',
    title: 'Nueva consulta recibida',
    time: 'Hace 20 min',
    color: Colors.green,
  },
  {
    id: '3',
    type: 'review',
    title: 'Recibiste 5 estrellas',
    time: 'Hace 1 h',
    color: Colors.amber,
  },
  {
    id: '4',
    type: 'view',
    title: 'Ana P. guardó tu perfil',
    time: 'Hace 3 h',
    color: Colors.pink,
  },
]

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Purple header */}
      <View style={styles.header}>
        <View style={styles.headerDecCircle} />
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>Hola, Laura 👋</Text>
            <Text style={styles.headerSub}>Tu perfil está funcionando muy bien</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
            <Settings size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active banner */}
        <View style={styles.activeBanner}>
          <CheckCircle size={16} color={Colors.green} />
          <Text style={styles.activeBannerText}>
            Tu perfil está activo y visible para todas las usuarias
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIconCircle, { backgroundColor: stat.color + '18' }]}>
                  <Icon size={18} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={[styles.statDelta, { color: stat.color }]}>{stat.delta}</Text>
              </View>
            )
          })}
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.quickActionsRow}>
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.quickActionBtn}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.bg }]}>
                    <Icon size={20} color={action.color} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Activity chart placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visitas esta semana</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {[40, 65, 80, 55, 90, 70, 100].map((h, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: h * 0.8,
                        backgroundColor:
                          i === 6 ? Colors.primary : Colors.primaryBorder,
                      },
                    ]}
                  />
                  <Text style={styles.chartBarLabel}>
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.chartFooter}>
              <TrendingUp size={14} color={Colors.green} />
              <Text style={styles.chartFooterText}>
                +18% respecto a la semana pasada
              </Text>
            </View>
          </View>
        </View>

        {/* Activity feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          <View style={styles.activityList}>
            {ACTIVITY.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View
                  style={[styles.activityDot, { backgroundColor: item.color }]}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* View profile button */}
        <TouchableOpacity
          style={styles.viewProfileBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/proveedora/1')}
        >
          <Eye size={18} color={Colors.primary} />
          <Text style={styles.viewProfileBtnText}>Ver mi perfil público</Text>
        </TouchableOpacity>

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
    paddingBottom: 20,
    overflow: 'hidden',
  },
  headerDecCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.greenBg,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  activeBannerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMain,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textMain,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  statDelta: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionBtn: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
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
    height: 90,
    marginBottom: 8,
  },
  chartBarCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  chartBar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  chartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chartFooterText: {
    fontSize: 12,
    color: Colors.green,
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMain,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
  },
  viewProfileBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
})
