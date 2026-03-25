import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { Bell, Search, MapPin, Home, Star, ChevronRight, CheckCircle } from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { CATEGORIES } from '../../constants/providers'
import { api } from '../../lib/api'
import { getStoredProfile } from '../../lib/auth'

function ProviderAvatar({ initials, color, size = 48, avatarUrl }) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color + '44',
        }}
      />
    )
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color + '22',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: color + '44',
      }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: color }}>
        {initials}
      </Text>
    </View>
  )
}

function FeaturedCard({ provider }) {
  return (
    <TouchableOpacity
      style={styles.featuredCard}
      activeOpacity={0.88}
      onPress={() => router.push(`/proveedora/${provider.id}`)}
    >
      {/* Top area — full photo or initials */}
      {provider.avatarUrl ? (
        <Image
          source={{ uri: provider.avatarUrl }}
          style={styles.featuredCardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.featuredCardTop, { backgroundColor: provider.color + '18' }]}>
          <ProviderAvatar initials={provider.initials} color={provider.color} size={56} />
        </View>
      )}

      {/* Verified badge overlaid on top-right corner */}
      {provider.verified && (
        <View style={styles.featuredVerifiedOverlay}>
          <CheckCircle size={12} color={Colors.green} />
          <Text style={styles.featuredVerifiedText}>Verificada</Text>
        </View>
      )}

      <View style={styles.featuredCardBody}>
        <Text style={styles.featuredName} numberOfLines={1}>{provider.name}</Text>
        <Text style={styles.featuredSpecialty} numberOfLines={1}>{provider.specialty}</Text>
        <View style={styles.featuredRatingRow}>
          <Star size={12} color={Colors.amber} />
          <Text style={styles.featuredRating}>{provider.rating}</Text>
          <Text style={styles.featuredReviews}>({provider.reviews})</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function ProviderRow({ provider }) {
  return (
    <TouchableOpacity
      style={styles.providerRow}
      activeOpacity={0.88}
      onPress={() => router.push(`/proveedora/${provider.id}`)}
    >
      <ProviderAvatar initials={provider.initials} color={provider.color} size={52} avatarUrl={provider.avatarUrl} />
      <View style={styles.providerRowInfo}>
        <View style={styles.providerRowTopLine}>
          <Text style={styles.providerRowName}>{provider.name}</Text>
          {provider.verified && (
            <View style={styles.verifiedBadge}>
              <CheckCircle size={11} color={Colors.green} />
              <Text style={styles.verifiedText}>Verificada</Text>
            </View>
          )}
        </View>
        <Text style={styles.providerRowSpecialty}>{provider.specialty}</Text>
        <View style={styles.providerRowMeta}>
          <View style={styles.metaChip}>
            {provider.serviceMode === 'A domicilio' ? (
              <Home size={11} color={Colors.textMuted} />
            ) : (
              <MapPin size={11} color={Colors.textMuted} />
            )}
            <Text style={styles.metaChipText}>{provider.serviceMode || 'Ambos'}</Text>
          </View>
          <View style={styles.ratingChip}>
            <Star size={11} color={Colors.amber} />
            <Text style={styles.ratingText}>{provider.rating}</Text>
          </View>
        </View>
      </View>
      <View style={styles.viewProfileBtn}>
        <ChevronRight size={16} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  )
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  '#7c3aed', '#f472b6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1',
]

function colorForId(id) {
  const num = parseInt(id, 10) || id.charCodeAt(0)
  return AVATAR_COLORS[num % AVATAR_COLORS.length]
}

function mapApiProvider(p) {
  return {
    id: p.id,
    name: p.providerFullName || '',
    initials: getInitials(p.providerFullName || ''),
    color: colorForId(String(p.id)),
    avatarUrl: p.providerAvatarUrl || null,
    specialty: p.serviceType || '',
    category: p.serviceType || '',
    rating: p.averageRating ?? 0,
    reviews: p.reviewCount ?? 0,
    location: p.city || p.providerCity || '',
    serviceMode: p.serviceMode || 'Ambos',
    verified: true, // API already filters to approved providers only
  }
}

export default function ExplorarScreen() {
  const { search: searchParam } = useLocalSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userCity, setUserCity] = useState('')

  useEffect(() => {
    getStoredProfile().then((p) => {
      if (p?.city) setUserCity(p.city)
    })
  }, [])

  async function fetchProviders(category, search) {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (category && category !== 'all') params.category = category
      if (search) params.search = search
      const result = await api.getProviders(Object.keys(params).length ? params : undefined)
      setProviders((result.providers || []).map(mapApiProvider))
    } catch (e) {
      setError('No se pudieron cargar los servicios. Verifica tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders(activeCategory, searchParam)
  }, [activeCategory, searchParam])

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLogo}>mora</Text>
          <Text style={styles.headerSub}>{userCity ? `${userCity}, Colombia` : 'Colombia'}</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push('/notificaciones')}
          activeOpacity={0.7}
        >
          <Bell size={22} color={Colors.textMain} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/buscar')}
        >
          <Search size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>
            Busca servicios, especialidades…
          </Text>
        </TouchableOpacity>

        {/* Category filter chips */}
        <View style={styles.chipsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  activeCategory === cat.id && {
                    backgroundColor: Colors.primary,
                    borderColor: Colors.primary,
                  },
                ]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    activeCategory === cat.id && { color: Colors.white },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured providers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proveedoras destacadas</Text>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
          ) : (
            <FlatList
              data={providers.slice(0, 4)}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
              renderItem={({ item }) => <FeaturedCard provider={item} />}
              scrollEnabled={true}
              ListEmptyComponent={
                <Text style={{ paddingHorizontal: 20, color: Colors.textMuted, fontSize: 14 }}>
                  Sin proveedoras disponibles
                </Text>
              }
            />
          )}
        </View>

        {/* Nearby providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Cerca de ti</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {error ? (
            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
              <Text style={{ color: '#ef4444', fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
          ) : (
            <View style={styles.providerList}>
              {providers.length === 0 ? (
                <Text style={{ color: Colors.textMuted, fontSize: 14, paddingVertical: 8 }}>
                  No hay proveedoras en esta categoría
                </Text>
              ) : (
                providers.map((p) => (
                  <ProviderRow key={String(p.id)} provider={p} />
                ))
              )}
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLogo: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pink,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: Colors.textLight,
  },
  chipsWrapper: {
    backgroundColor: Colors.white,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.borderMed,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  section: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textMain,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Featured card
  featuredCard: {
    width: 150,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  featuredCardImage: {
    width: '100%',
    height: 110,
  },
  featuredCardTop: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  featuredVerifiedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  featuredVerifiedText: {
    fontSize: 10,
    color: Colors.green,
    fontWeight: '700',
  },
  featuredCardBody: {
    padding: 10,
    gap: 3,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMain,
  },
  featuredSpecialty: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  featuredRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  featuredRating: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMain,
  },
  featuredReviews: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  // Provider row
  providerList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  providerRowInfo: {
    flex: 1,
    gap: 3,
  },
  providerRowTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerRowName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.greenBg,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 10,
    color: Colors.green,
    fontWeight: '700',
  },
  providerRowSpecialty: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  providerRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaChipText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMain,
  },
  viewProfileBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
