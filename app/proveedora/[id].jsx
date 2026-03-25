import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
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
  PenLine,
  Send,
  X,
} from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { api } from '../../lib/api'
import { getStoredProfile } from '../../lib/auth'
import { InstagramIcon, TikTokIcon, FacebookIcon, GlobeIcon } from '../../components/SocialIcons'

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

function InteractiveStarRating({ rating, onRate, size = 28 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onRate(i)} activeOpacity={0.7}>
          <Star
            size={size}
            color={Colors.amber}
            fill={i <= rating ? Colors.amber : 'transparent'}
          />
        </TouchableOpacity>
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
  const [photoModalUrl, setPhotoModalUrl] = useState(null)

  // Review form state
  const [currentUserId, setCurrentUserId] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    getStoredProfile().then((p) => {
      if (p?.id) setCurrentUserId(p.id)
    })
  }, [])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [provResult, reviewsResult, savedResult] = await Promise.allSettled([
          api.getProvider(String(id)),
          api.getReviews(String(id)),
          api.getSaved(),
        ])
        if (provResult.status === 'fulfilled') {
          setProviderData(provResult.value.provider)
        }
        if (reviewsResult.status === 'fulfilled') {
          const fetchedReviews = reviewsResult.value.reviews || []
          setReviews(fetchedReviews)
          // Check if current user already reviewed
          const storedProfile = await getStoredProfile()
          if (storedProfile?.id) {
            setCurrentUserId(storedProfile.id)
            const alreadyReviewed = fetchedReviews.some(
              (r) => r.reviewerId === storedProfile.id
            )
            setHasReviewed(alreadyReviewed)
          }
        }
        if (savedResult.status === 'fulfilled') {
          const isSaved = (savedResult.value.saved || []).some(
            (s) => s.provider?.id === String(id)
          )
          setSaved(isSaved)
        }
      } catch (e) {
        // silent
      } finally {
        setLoading(false)
      }
    }
    if (id) loadData()
  }, [id])

  // Detect if current user is the owner of this profile
  useEffect(() => {
    if (providerData && currentUserId) {
      setIsOwner(providerData.userId === currentUserId)
    }
  }, [providerData, currentUserId])

  async function handleToggleSave() {
    if (savingToggle) return
    setSavingToggle(true)
    try {
      const result = await api.toggleSaved(String(id))
      setSaved(result.saved)
    } catch (e) {}
    finally { setSavingToggle(false) }
  }

  async function handleSubmitReview() {
    if (reviewRating === 0) {
      setReviewError('Selecciona una calificación')
      return
    }
    setReviewSubmitting(true)
    setReviewError('')
    try {
      await api.createReview(String(id), {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      })
      // Refresh reviews
      const res = await api.getReviews(String(id))
      setReviews(res.reviews || [])
      setHasReviewed(true)
      setReviewSuccess(true)
      setShowReviewForm(false)
      setReviewRating(0)
      setReviewComment('')
    } catch (e) {
      setReviewError(e.message || 'Error al enviar la reseña')
    } finally {
      setReviewSubmitting(false)
    }
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
  const name = provider.providerFullName || ''
  const initials = getInitials(name)
  const color = colorForId(String(provider.id))
  const avatarUrl = provider.providerAvatarUrl || null
  const specialty = provider.serviceType || ''
  const rating = Number(provider.averageRating ?? 0)
  const reviewCount = provider.reviewCount ?? reviews.length
  const isVerified = true // API only returns active/approved providers
  const location = provider.city || provider.providerCity || ''
  const serviceMode = provider.serviceMode || ''
  const about = provider.description || ''
  const tags = provider.specialties || []
  const price = provider.priceLabel || ''
  const availability = provider.availability || ''
  const address = provider.address || location
  const whatsappNumber = provider.whatsapp || provider.providerWhatsapp || ''
  const websiteUrl = provider.websiteUrl || null
  const instagramUrl = provider.instagramUrl || null
  const tiktokUrl = provider.tiktokUrl || null
  const facebookUrl = provider.facebookUrl || null
  const hasSocialLinks = websiteUrl || instagramUrl || tiktokUrl || facebookUrl

  function handleWhatsApp() {
    if (whatsappNumber) {
      // Track contact click (fire-and-forget)
      api.trackContact(String(provider.id)).catch(() => {})
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
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => avatarUrl && setPhotoModalUrl(avatarUrl)}
            disabled={!avatarUrl}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
          </TouchableOpacity>
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
                {serviceMode === 'A domicilio' ? (
                  <Home size={16} color={Colors.primary} />
                ) : (
                  <MapPin size={16} color={Colors.primary} />
                )}
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Modalidad</Text>
                <Text style={styles.detailValue}>{serviceMode || '—'}</Text>
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

        {/* Social links — icon-only buttons */}
        {hasSocialLinks ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Encuéntrame en</Text>
            <View style={styles.socialIconsRow}>
              {websiteUrl ? (
                <TouchableOpacity
                  style={styles.socialIconBtn}
                  onPress={() => Linking.openURL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)}
                  activeOpacity={0.75}
                >
                  <GlobeIcon size={28} color="#6b7280" />
                </TouchableOpacity>
              ) : null}
              {instagramUrl ? (
                <TouchableOpacity
                  style={styles.socialIconBtn}
                  onPress={() => Linking.openURL(instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`)}
                  activeOpacity={0.75}
                >
                  <InstagramIcon size={28} />
                </TouchableOpacity>
              ) : null}
              {tiktokUrl ? (
                <TouchableOpacity
                  style={styles.socialIconBtn}
                  onPress={() => Linking.openURL(tiktokUrl.startsWith('http') ? tiktokUrl : `https://${tiktokUrl}`)}
                  activeOpacity={0.75}
                >
                  <TikTokIcon size={28} />
                </TouchableOpacity>
              ) : null}
              {facebookUrl ? (
                <TouchableOpacity
                  style={styles.socialIconBtn}
                  onPress={() => Linking.openURL(facebookUrl.startsWith('http') ? facebookUrl : `https://${facebookUrl}`)}
                  activeOpacity={0.75}
                >
                  <FacebookIcon size={28} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reseñas recientes</Text>
            {!isOwner && !hasReviewed && !showReviewForm && (
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setShowReviewForm(true)}
                activeOpacity={0.8}
              >
                <PenLine size={14} color={Colors.primary} />
                <Text style={styles.writeReviewBtnText}>Dejar reseña</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Review success message */}
          {reviewSuccess && (
            <View style={styles.reviewSuccessBanner}>
              <CheckCircle size={16} color={Colors.green} />
              <Text style={styles.reviewSuccessText}>¡Reseña publicada! Gracias por tu opinión.</Text>
            </View>
          )}

          {/* Already reviewed notice */}
          {hasReviewed && !reviewSuccess && (
            <View style={styles.alreadyReviewedBanner}>
              <CheckCircle size={14} color={Colors.primary} />
              <Text style={styles.alreadyReviewedText}>Ya dejaste una reseña para esta proveedora.</Text>
            </View>
          )}

          {/* Inline review form */}
          {showReviewForm && (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={styles.reviewFormCard}>
                <View style={styles.reviewFormHeader}>
                  <Text style={styles.reviewFormTitle}>Tu reseña</Text>
                  <TouchableOpacity onPress={() => { setShowReviewForm(false); setReviewError('') }} activeOpacity={0.7}>
                    <X size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.reviewFormLabel}>Calificación *</Text>
                <InteractiveStarRating rating={reviewRating} onRate={setReviewRating} />
                <Text style={[styles.reviewFormLabel, { marginTop: 14 }]}>Comentario (opcional)</Text>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Cuéntanos tu experiencia..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={3}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  textAlignVertical="top"
                />
                {reviewError ? (
                  <Text style={styles.reviewErrorText}>{reviewError}</Text>
                ) : null}
                <TouchableOpacity
                  style={[styles.reviewSubmitBtn, reviewSubmitting && { opacity: 0.6 }]}
                  onPress={handleSubmitReview}
                  disabled={reviewSubmitting}
                  activeOpacity={0.85}
                >
                  {reviewSubmitting ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <>
                      <Send size={15} color={Colors.white} />
                      <Text style={styles.reviewSubmitBtnText}>Publicar reseña</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}

          {reviews.length === 0 ? (
            <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
              Aún no hay reseñas para esta proveedora.
            </Text>
          ) : (
            reviews.map((review) => {
              const reviewerName = review.reviewerFullName || 'Usuaria'
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

      {/* Full-screen photo viewer */}
      <Modal
        visible={!!photoModalUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalUrl(null)}
      >
        <TouchableOpacity
          style={styles.photoModalBackdrop}
          activeOpacity={1}
          onPress={() => setPhotoModalUrl(null)}
        >
          <Image
            source={{ uri: photoModalUrl }}
            style={styles.photoModalImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

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
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
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
  // Social links
  socialIconsRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  socialIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  // Reviews header + write button
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  writeReviewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  // Review success / already reviewed banners
  reviewSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  reviewSuccessText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
  alreadyReviewedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  alreadyReviewedText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  // Inline review form
  reviewFormCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reviewFormTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textMain,
  },
  reviewFormLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  reviewInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textMain,
    minHeight: 80,
  },
  reviewErrorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },
  reviewSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 14,
  },
  reviewSubmitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
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
  // Photo viewer modal
  photoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoModalImage: {
    width: '100%',
    height: '80%',
  },
})
