import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import {
  Edit2,
  Mail,
  Phone,
  MapPin,
  Shield,
  ChevronRight,
  LogOut,
  Bookmark,
  Star,
  CheckCircle,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Settings,
} from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { useState, useCallback } from 'react'
import { api } from '../../lib/api'
import { getStoredProfile, logout } from '../../lib/auth'

const STATUS_LABELS = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

const AVATAR_COLORS = [
  '#7c3aed', '#f472b6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1',
]
function colorForId(id) {
  const num = parseInt(id, 10) || String(id).charCodeAt(0)
  return AVATAR_COLORS[num % AVATAR_COLORS.length]
}
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function SavedProviderCard({ provider: item }) {
  const name = item.providerFullName || ''
  const initials = getInitials(name)
  const providerId = item.provider?.id
  const color = colorForId(String(providerId || item.savedId))
  const specialty = item.provider?.serviceType || ''
  const rating = Number(item.provider?.averageRating ?? 0)

  return (
    <TouchableOpacity
      style={styles.savedCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/proveedora/${providerId}`)}
    >
      <View
        style={[styles.savedAvatar, { backgroundColor: color + '22' }]}
      >
        <Text style={[styles.savedAvatarText, { color: color }]}>
          {initials}
        </Text>
      </View>
      <View style={styles.savedInfo}>
        <Text style={styles.savedName} numberOfLines={1}>{name}</Text>
        <Text style={styles.savedSpecialty} numberOfLines={1}>{specialty}</Text>
        <View style={styles.savedRating}>
          <Star size={11} color={Colors.amber} />
          <Text style={styles.savedRatingText}>{rating}</Text>
        </View>
      </View>
      <ChevronRight size={16} color={Colors.textLight} />
    </TouchableOpacity>
  )
}

export default function PerfilScreen() {
  const [profile, setProfile] = useState(null)
  const [savedProviders, setSavedProviders] = useState([])
  const [providerProfile, setProviderProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        setLoading(true)
        try {
          const cached = await getStoredProfile()
          if (cached) setProfile(cached)

          const [meResult, savedResult] = await Promise.allSettled([
            api.me(),
            api.getSaved(),
          ])
          if (meResult.status === 'fulfilled') {
            setProfile(meResult.value.profile)
          }
          if (savedResult.status === 'fulfilled') {
            setSavedProviders(savedResult.value.saved || [])
          }

          // Load provider profile if proveedora
          const currentProfile = meResult.status === 'fulfilled'
            ? meResult.value.profile
            : cached
          if (currentProfile?.role === 'proveedora') {
            const provResult = await api.getMyProviderProfile().catch(() => null)
            if (provResult?.providerProfile) {
              setProviderProfile(provResult.providerProfile)
            }
          }
        } catch (e) {
          // Use cached profile if API fails
        } finally {
          setLoading(false)
        }
      }
      loadData()
    }, [])
  )

  async function handleLogout() {
    await logout()
    router.replace('/')
  }

  const displayName = profile?.fullName || profile?.full_name || 'Mi perfil'
  const displayInitials = getInitials(displayName)
  const displayEmail = profile?.email || ''
  const displayPhone = profile?.whatsapp || ''
  const displayCity = profile?.city || ''
  const isVerified = profile?.verificationStatus === 'approved' || profile?.verification_status === 'approved'
  const isProveedora = profile?.role === 'proveedora'
  const avatarUrl = profile?.avatarUrl || null

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Purple header */}
        <View style={styles.headerBg}>
          <View style={styles.headerDecCircle1} />
          <View style={styles.headerDecCircle2} />
          <View style={styles.headerContent}>
            {loading ? (
              <ActivityIndicator color={Colors.white} style={{ marginBottom: 8 }} />
            ) : null}
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{displayInitials}</Text>
              </View>
            )}
            <Text style={styles.headerName}>{displayName}</Text>
            {displayCity ? (
              <View style={styles.locationRow}>
                <MapPin size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.locationText}>{displayCity}</Text>
              </View>
            ) : null}
            {isVerified ? (
              <View style={styles.verifiedBadge}>
                <CheckCircle size={13} color={Colors.green} />
                <Text style={styles.verifiedBadgeText}>Cuenta verificada</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/editar-perfil')}
          >
            <Edit2 size={15} color={Colors.primary} />
            <Text style={styles.editBtnText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>

          {/* ── PROVIDER DASHBOARD ── */}
          {isProveedora && (
            <View style={styles.dashboardSection}>
              <View style={styles.dashboardHeader}>
                <TrendingUp size={16} color={Colors.primary} />
                <Text style={styles.dashboardTitle}>Mi perfil profesional</Text>
                {providerProfile && (
                  <View style={[styles.activePill, !providerProfile.isActive && styles.inactivePill]}>
                    <Text style={[styles.activePillText, !providerProfile.isActive && styles.inactivePillText]}>
                      {providerProfile.isActive ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Stats grid */}
              {providerProfile ? (
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Eye size={20} color={Colors.primary} />
                    <Text style={styles.statNumber}>{providerProfile.profileViews ?? 0}</Text>
                    <Text style={styles.statLabel}>Visitas</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Heart size={20} color="#f472b6" />
                    <Text style={styles.statNumber}>{providerProfile.savedCount ?? 0}</Text>
                    <Text style={styles.statLabel}>Guardadas</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Star size={20} color={Colors.amber} />
                    <Text style={styles.statNumber}>
                      {Number(providerProfile.averageRating ?? 0).toFixed(1)}
                    </Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statCard}>
                    <MessageCircle size={20} color={Colors.green} />
                    <Text style={styles.statNumber}>{providerProfile.reviewCount ?? 0}</Text>
                    <Text style={styles.statLabel}>Reseñas</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noProviderCard}>
                  <Text style={styles.noProviderText}>
                    Aún no has configurado tu perfil de servicios.
                  </Text>
                  <TouchableOpacity
                    style={styles.setupProfileBtn}
                    onPress={() => router.push('/registro-proveedora')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.setupProfileBtnText}>Configurar perfil →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action buttons */}
              {providerProfile && (
                <View style={styles.dashboardActions}>
                  <TouchableOpacity
                    style={styles.dashActionBtn}
                    activeOpacity={0.8}
                    onPress={() => router.push('/editar-perfil-proveedora')}
                  >
                    <Settings size={15} color={Colors.primary} />
                    <Text style={styles.dashActionBtnText}>Editar servicios</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dashActionBtn, styles.dashActionBtnSecondary]}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/proveedora/${providerProfile.id}`)}
                  >
                    <Eye size={15} color={Colors.white} />
                    <Text style={[styles.dashActionBtnText, { color: Colors.white }]}>Ver mi perfil</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Saved providers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bookmark size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Proveedoras guardadas</Text>
            </View>
            {savedProviders.length === 0 && !loading ? (
              <Text style={{ color: Colors.textMuted, fontSize: 14, marginBottom: 12 }}>
                Aún no has guardado ninguna proveedora
              </Text>
            ) : (
              savedProviders.map((p) => (
                <SavedProviderCard key={String(p.savedId || p.provider?.id)} provider={p} />
              ))
            )}
          </View>

          {/* My data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis datos</Text>
            <View style={styles.dataCard}>
              <View style={styles.dataRow}>
                <View style={styles.dataIconCircle}>
                  <Mail size={16} color={Colors.primary} />
                </View>
                <View style={styles.dataText}>
                  <Text style={styles.dataLabel}>Correo electrónico</Text>
                  <Text style={styles.dataValue}>{displayEmail || '—'}</Text>
                </View>
              </View>
              <View style={styles.dataDivider} />

              <View style={styles.dataRow}>
                <View style={styles.dataIconCircle}>
                  <Phone size={16} color={Colors.primary} />
                </View>
                <View style={styles.dataText}>
                  <Text style={styles.dataLabel}>WhatsApp</Text>
                  <Text style={styles.dataValue}>{displayPhone || '—'}</Text>
                </View>
              </View>
              <View style={styles.dataDivider} />

              <View style={styles.dataRow}>
                <View style={styles.dataIconCircle}>
                  <MapPin size={16} color={Colors.primary} />
                </View>
                <View style={styles.dataText}>
                  <Text style={styles.dataLabel}>Ciudad</Text>
                  <Text style={styles.dataValue}>{displayCity || '—'}</Text>
                </View>
              </View>
              <View style={styles.dataDivider} />

              <View style={styles.dataRow}>
                <View style={styles.dataIconCircle}>
                  <Shield size={16} color={isVerified ? Colors.green : Colors.textMuted} />
                </View>
                <View style={styles.dataText}>
                  <Text style={styles.dataLabel}>Estado de cuenta</Text>
                  {isVerified ? (
                    <View style={styles.verifiedPill}>
                      <CheckCircle size={12} color={Colors.green} />
                      <Text style={styles.verifiedPillText}>Verificada</Text>
                    </View>
                  ) : (
                    <Text style={styles.dataValue}>{STATUS_LABELS[profile?.verificationStatus] || 'Pendiente'}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            <View style={styles.optionsList}>
              {[
                'Notificaciones',
                'Privacidad',
                'Términos y condiciones',
                'Ayuda y soporte',
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.optionRow,
                    i < 3 && { borderBottomWidth: 1, borderBottomColor: Colors.border },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  <ChevronRight size={16} color={Colors.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <LogOut size={18} color="#ef4444" />
            <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
          </TouchableOpacity>

          <Text style={styles.version}>mora v1.0.0 · Hecho con 💜 en Colombia</Text>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  headerBg: {
    backgroundColor: Colors.primary,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  headerDecCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -50,
    right: -40,
  },
  headerDecCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -20,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 8,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  // Dashboard
  dashboardSection: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  dashboardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textMain,
    flex: 1,
  },
  activePill: {
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  inactivePill: {
    backgroundColor: '#fef9c3',
    borderColor: '#fde047',
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
  },
  inactivePillText: {
    color: '#a16207',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textMain,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  noProviderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  noProviderText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  setupProfileBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  setupProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  dashboardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dashActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  dashActionBtnSecondary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dashActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  verifiedBadgeText: {
    fontSize: 12,
    color: '#6ee7b7',
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  body: {
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 12,
  },
  // Saved cards
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  savedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedAvatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  savedInfo: {
    flex: 1,
    gap: 2,
  },
  savedName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
  },
  savedSpecialty: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  savedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  savedRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain,
  },
  // Data card
  dataCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  dataIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataText: {
    flex: 1,
    gap: 3,
  },
  dataLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMain,
  },
  dataDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.greenBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  verifiedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
  },
  // Options
  optionsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 15,
    color: Colors.textMain,
    fontWeight: '500',
  },
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
    marginBottom: 12,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
})
