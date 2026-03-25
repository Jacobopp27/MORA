import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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

function SavedProviderCard({ provider }) {
  const name = provider.fullName || provider.name || ''
  const initials = getInitials(name)
  const color = colorForId(String(provider.id))
  const specialty = provider.specialty || provider.category || ''
  const rating = provider.avgRating ?? provider.rating ?? 0

  return (
    <TouchableOpacity
      style={styles.savedCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/proveedora/${provider.id}`)}
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
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        setLoading(true)
        try {
          // Load profile from cache first, then try API
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
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{displayInitials}</Text>
            </View>
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
                <SavedProviderCard key={String(p.id)} provider={p} />
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
