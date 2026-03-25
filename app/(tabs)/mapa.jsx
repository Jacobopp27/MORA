import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { MapPin, Navigation, X, CheckCircle, Star } from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { CATEGORIES } from '../../constants/providers'
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
function mapApiProvider(p) {
  return {
    id: p.id,
    name: p.providerFullName || '',
    initials: getInitials(p.providerFullName || ''),
    color: colorForId(String(p.id)),
    specialty: p.serviceType || '',
    rating: p.averageRating ?? 0,
    location: p.city || '',
    verified: true,
    lat: p.latitude,
    lng: p.longitude,
  }
}

const { width, height } = Dimensions.get('window')

const INITIAL_REGION = {
  latitude: 4.711,
  longitude: -74.0721,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

function CustomMarker({ provider, onPress, selected }) {
  return (
    <Marker
      coordinate={{ latitude: provider.lat, longitude: provider.lng }}
      onPress={onPress}
    >
      <View
        style={[
          styles.markerContainer,
          { backgroundColor: provider.color },
          selected && styles.markerSelected,
        ]}
      >
        <Text style={styles.markerInitials}>{provider.initials}</Text>
      </View>
    </Marker>
  )
}

export default function MapaScreen() {
  const [locationStatus, setLocationStatus] = useState('pending') // pending | granted | denied
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [providers, setProviders] = useState([])

  useEffect(() => {
    requestLocation()
  }, [])

  useEffect(() => {
    async function fetchProviders() {
      try {
        const params = activeCategory !== 'all' ? { category: activeCategory } : undefined
        const result = await api.getProviders(params)
        setProviders((result.providers || []).map(mapApiProvider).filter((p) => p.lat && p.lng))
      } catch {
        // silently fail — map stays empty
      }
    }
    fetchProviders()
  }, [activeCategory])

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync()
    setLocationStatus(status === 'granted' ? 'granted' : 'denied')
  }

  const filteredProviders = providers

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={INITIAL_REGION}
        showsUserLocation={locationStatus === 'granted'}
        showsMyLocationButton={false}
      >
        {filteredProviders.map((p) => (
          <CustomMarker
            key={p.id}
            provider={p}
            selected={selectedProvider?.id === p.id}
            onPress={() => setSelectedProvider(p)}
          />
        ))}
      </MapView>

      {/* Filter chips overlay */}
      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
          style={styles.filterBar}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
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
                  styles.filterChipText,
                  activeCategory === cat.id && { color: Colors.white },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Location button */}
      {locationStatus === 'granted' && (
        <TouchableOpacity style={styles.locationBtn} activeOpacity={0.8}>
          <Navigation size={18} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* Selected provider card */}
      {selectedProvider && (
        <View style={styles.selectedCard}>
          <TouchableOpacity
            style={styles.selectedCardClose}
            onPress={() => setSelectedProvider(null)}
            activeOpacity={0.7}
          >
            <X size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.selectedCardContent}>
            <View
              style={[
                styles.selectedAvatar,
                { backgroundColor: selectedProvider.color + '22' },
              ]}
            >
              <Text style={[styles.selectedAvatarText, { color: selectedProvider.color }]}>
                {selectedProvider.initials}
              </Text>
            </View>
            <View style={styles.selectedInfo}>
              <View style={styles.selectedNameRow}>
                <Text style={styles.selectedName}>{selectedProvider.name}</Text>
                {selectedProvider.verified && (
                  <CheckCircle size={14} color={Colors.green} />
                )}
              </View>
              <Text style={styles.selectedSpecialty}>{selectedProvider.specialty}</Text>
              <View style={styles.selectedMeta}>
                <Star size={12} color={Colors.amber} />
                <Text style={styles.selectedRating}>{selectedProvider.rating}</Text>
                <MapPin size={12} color={Colors.textMuted} />
                <Text style={styles.selectedLocation} numberOfLines={1}>
                  {selectedProvider.location}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            activeOpacity={0.85}
            onPress={() => router.push(`/proveedora/${selectedProvider.id}`)}
          >
            <Text style={styles.viewProfileBtnText}>Ver perfil</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom provider cards scrollable (when no selected) */}
      {!selectedProvider && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.bottomSheetTitle}>
            {filteredProviders.length} proveedoras en el área
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bottomCards}
          >
            {filteredProviders.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.bottomCard}
                activeOpacity={0.88}
                onPress={() => setSelectedProvider(p)}
              >
                <View
                  style={[styles.bottomCardAvatar, { backgroundColor: p.color + '22' }]}
                >
                  <Text style={[styles.bottomCardInitials, { color: p.color }]}>
                    {p.initials}
                  </Text>
                </View>
                <Text style={styles.bottomCardName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.bottomCardSpecialty} numberOfLines={1}>
                  {p.specialty}
                </Text>
                <View style={styles.bottomCardRating}>
                  <Star size={11} color={Colors.amber} />
                  <Text style={styles.bottomCardRatingText}>{p.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Location permission prompt */}
      {locationStatus === 'denied' && (
        <View style={styles.permissionPrompt}>
          <MapPin size={20} color={Colors.primary} />
          <Text style={styles.permissionText}>
            Activa la ubicación para ver proveedoras cerca de ti
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={requestLocation}
            activeOpacity={0.85}
          >
            <Text style={styles.permissionBtnText}>Activar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  filterBar: {
    marginTop: 8,
  },
  filterChips: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.borderMed,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  locationBtn: {
    position: 'absolute',
    bottom: 220,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerSelected: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  markerInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.white,
  },
  selectedCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedCardClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingRight: 32,
  },
  selectedAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedAvatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  selectedInfo: {
    flex: 1,
    gap: 3,
  },
  selectedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
  },
  selectedSpecialty: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  selectedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  selectedRating: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMain,
    marginRight: 4,
  },
  selectedLocation: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  viewProfileBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewProfileBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMed,
    alignSelf: 'center',
    marginBottom: 12,
  },
  bottomSheetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  bottomCards: {
    paddingHorizontal: 16,
    gap: 10,
  },
  bottomCard: {
    width: 110,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  bottomCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bottomCardInitials: {
    fontSize: 14,
    fontWeight: '800',
  },
  bottomCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMain,
    textAlign: 'center',
  },
  bottomCardSpecialty: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  bottomCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bottomCardRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMain,
  },
  permissionPrompt: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  permissionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMain,
    fontWeight: '500',
  },
  permissionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  permissionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
})
