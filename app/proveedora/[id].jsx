import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  Star,
  MapPin,
  Home,
  MessageCircle,
  Bookmark,
  Map,
  CheckCircle,
  Calendar,
  DollarSign,
  Clock,
} from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { api } from '../../lib/api'

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

function StarRating({ rating, size = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color={Colors.amber}
          fill={i <= rating ? Colors.amber : 'transparent'}
        />
      ))}
    </View>
  )
}

export default function ProveedoraScreen() {
  const { id } = useLocalSearchParams()
  const [providerData, setProviderData] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [savingToggle, setSavingToggle] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [provResult, reviewsResult] = await Promise.allSettled([
          api.getProvider(String(id)),
          api.getReviews(String(id)),
        ])
        if (provResult.status === 'fulfilled') {
          setProviderData(provResult.value.provider)
        }
        if (reviewsResult.status === 'fulfilled') {
          setReviews(reviewsResult.value.reviews || [])
        }
      } catch (e) {
        // silent
      } finally {
        setLoading(false)
      }
    }
    if (id) loadData()
  }, [id])

  async function handleToggleSave() {
    if (savingToggle) return
    setSavingToggle(true)
    try {
      const result = await api.toggleSaved(String(id))
      setSaved(result.saved)
    } catch (e) {}
    finally { setSavingToggle(false) }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </SafeAreaView>
    )
  }

  if (!providerData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flexDirection: 'row', padding: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ChevronLeft size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 16, color: Colors.textMuted, textAlign: 'center' }}>
            No se pudo cargar el perfil de esta proveedora.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const provider = providerData
  const name = provider.fullName || provider.name || ''
  const initials = getInitials(name)
  const color = colorForId(String(provider.id))
  const specialty = provider.specialty || provider.category || ''
  const rating = provider.avgRating ?? provider.rating ?? 0
  const reviewCount = provider.reviewCount ?? provider.reviews ?? reviews.length
  const isVerified = provider.verificationStatus === 'approved' || provider.verified || false
  const location = provider.city || provider.location || ''
  const serviceMode = provider.serviceMode || provider.serviceType || 'both'
  const about = provider.about || provider.bio || ''
  const tags = provider.tags || provider.specialties || []
  const price = provider.price || provider.priceRange || ''
  const availability = provider.availability || ''
  const address = provider.address || location
  const whatsappNumber = provider.whatsapp || provider.phone || ''

  function handleWhatsApp() {
    if (whatsappNumber) {
      Linking.openURL(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Purple header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <View style={styles.headerDecCircle} />

        {/* Top nav */}
        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.7} onPress={handleToggleSave}>
            <Bookmark size={18} color={Colors.white} fill={saved ? Colors.white : 'transparent'} />
          </TouchableOpacity>
        </View>

        {/* Profile info */}
        <View style={styles.headerProfile}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.headerSpecialty}>{specialty}</Text>
          <View style={styles.headerMeta}>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle size={12} color={Colors.white} />
                <Text style={styles.verifiedBadgeText}>Verificada</Text>
              </View>
            )}
            {location ? (
              <View style={styles.locationBadge}>
                <MapPin size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.locationBadgeText}>
                  {location.split(',')[0]}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Rating summary */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingLeft}>
            <Text style={styles.ratingNumber}>{rating}</Text>
            <StarRating rating={Math.round(rating)} size={16} />
            <Text style={styles.ratingCount}>{reviewCount} reseñas</Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingRight}>
            {[5, 4, 3].map((star) => (
              <View key={star} style={styles.ratingBar}>
                <Text style={styles.ratingBarLabel}>{star}</Text>
                <View style={styles.ratingBarTrack}>
                  <View
                    style={[
                      styles.ratingBarFill,
                      { width: `${star === 5 ? 78 : star === 4 ? 18 : 4}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        {about ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={styles.aboutText}>{about}</Text>
          </View>
        ) : null}

        {/* Specialties */}
        {tags.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Especialidades</Text>
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Service details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del servicio</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                {serviceMode === 'home' ? (
                  <Home size={16} color={Colors.primary} />
                ) : (
                  <MapPin size={16} color={Colors.primary} />
                )}
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Modalidad</Text>
                <Text style={styles.detailValue}>
                  {serviceMode === 'home'
                    ? 'A domicilio'
                    : serviceMode === 'online'
                    ? 'Virtual / Online'
                    : 'A domicilio y en local'}
                </Text>
              </View>
            </View>
            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MapPin size={16} color={Colors.primary} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Dirección / Zona</Text>
                <Text style={styles.detailValue}>{address || '—'}</Text>
              </View>
              <TouchableOpacity
                style={styles.mapLink}
                onPress={() => router.push('/(tabs)/mapa')}
                activeOpacity={0.7}
              >
                <Map size={14} color={Colors.primary} />
                <Text style={styles.mapLinkText}>Ver mapa</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <DollarSign size={16} color={Colors.primary} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Precio</Text>
                <Text style={styles.detailValue}>{price || '—'}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Clock size={16} color={Colors.primary} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Disponibilidad</Text>
                <Text style={styles.detailValue}>{availability || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reseñas recientes</Text>
          {reviews.length === 0 ? (
            <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
              Aún no hay reseñas para esta proveedora.
            </Text>
          ) : (
            reviews.map((review) => {
              const reviewerName = review.reviewerName || review.userName || review.user?.fullName || 'Usuaria'
              const reviewDate = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
                : ''
              return (
                <View key={String(review.id)} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {reviewerName[0]}
                      </Text>
                    </View>
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewName}>{reviewerName}</Text>
                      <View style={styles.reviewRatingRow}>
                        <StarRating rating={review.rating} size={12} />
                        <Text style={styles.reviewDate}>{reviewDate}</Text>
                      </View>
                    </View>
                  </View>
                  {review.comment ? (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  ) : null}
                </View>
              )
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity
          style={[styles.whatsappBtn, !whatsappNumber && { opacity: 0.5 }]}
          activeOpacity={0.85}
          onPress={handleWhatsApp}
          disabled={!whatsappNumber}
        >
          <MessageCircle size={20} color={Colors.white} />
          <Text style={styles.whatsappBtnText}>Contactar por WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveGhostBtn} activeOpacity={0.7} onPress={handleToggleSave}>
          <Bookmark size={20} color={Colors.primary} fill={saved ? Colors.primary : 'transparent'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingBottom: 28,
    overflow: 'hidden',
  },
  headerDecCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProfile: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 6,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSpecialty: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16,185,129,0.3)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.5)',
  },
  verifiedBadgeText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  locationBadgeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  // Rating card
  ratingCard: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingLeft: {
    alignItems: 'center',
    gap: 6,
    paddingRight: 16,
    minWidth: 80,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textMain,
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  ratingDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  ratingRight: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    width: 12,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
  },
  ratingBarFill: {
    height: 6,
    backgroundColor: Colors.amber,
    borderRadius: 3,
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  tagChipText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Details
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMain,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapLinkText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Reviews
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  reviewMeta: {
    flex: 1,
    gap: 3,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  // Bottom CTA
  bottomCTA: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 15,
  },
  whatsappBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  saveGhostBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
  },
})
