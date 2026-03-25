import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import {
  ChevronLeft,
  ChevronDown,
  Plus,
  X,
  Camera,
  Home,
  MapPin,
  Layers,
} from 'lucide-react-native'
import { Colors } from '../constants/Colors'
import { api } from '../lib/api'
import { updateStoredProfile } from '../lib/auth'
import { InstagramIcon, TikTokIcon, FacebookIcon, GlobeIcon } from '../components/SocialIcons'

const SERVICE_TYPES = [
  { id: 'fitness', label: 'Fitness & Entrenamiento', emoji: '💪' },
  { id: 'nutricion', label: 'Nutrición', emoji: '🥗' },
  { id: 'psicologia', label: 'Psicología', emoji: '🧠' },
  { id: 'estetica', label: 'Estética & Belleza', emoji: '✨' },
  { id: 'cuidado', label: 'Cuidado de personas', emoji: '❤️' },
  { id: 'transporte', label: 'Transporte', emoji: '🚗' },
  { id: 'educacion', label: 'Educación & Tutorías', emoji: '📚' },
  { id: 'otro', label: 'Otro', emoji: '🔧' },
]

const CITIES = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
  'Bucaramanga', 'Manizales', 'Pereira', 'Santa Marta', 'Cúcuta',
]

const MODALITIES = [
  {
    id: 'home',
    label: 'A domicilio',
    icon: Home,
    desc: 'Vas donde tu clienta',
  },
  {
    id: 'local',
    label: 'En mi local / gym',
    icon: MapPin,
    desc: 'Tu clienta va a tu espacio',
  },
  {
    id: 'both',
    label: 'Ambas',
    icon: Layers,
    desc: 'Flexible según necesidad',
  },
]

export default function RegistroProveedoraScreen() {
  const [serviceType, setServiceType] = useState(null)
  const [description, setDescription] = useState('')
  const [specialties, setSpecialties] = useState([])
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [modality, setModality] = useState(null)
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [cityModal, setCityModal] = useState(false)
  const [photoUri, setPhotoUri] = useState(null)
  const [photoBase64, setPhotoBase64] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a tu galería para subir una foto de perfil.'
      )
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    })
    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri)
      setPhotoBase64(result.assets[0].base64 || null)
    }
  }

  async function handleContinuar() {
    if (!serviceType) return setError('Selecciona el tipo de servicio.')
    if (!description.trim()) return setError('Agrega una descripción de tu servicio.')
    if (!ciudad) return setError('Selecciona tu ciudad.')
    if (!modality) return setError('Selecciona cómo ofreces tu servicio.')
    if (!whatsapp.trim()) return setError('Agrega tu número de WhatsApp.')
    setError('')
    setLoading(true)
    try {
      const serviceLabel = SERVICE_TYPES.find(s => s.id === serviceType)?.label || serviceType
      const modalityLabel = modality === 'home' ? 'A domicilio' : modality === 'local' ? 'En mi local/gym' : 'Ambas'
      await api.createProviderProfile({
        serviceType: serviceLabel,
        description,
        specialties,
        serviceMode: modalityLabel,
        address: address || undefined,
        city: ciudad,
        priceLabel: price || undefined,
        whatsapp: `+57${whatsapp.replace(/\s/g, '')}`,
        websiteUrl: websiteUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        tiktokUrl: tiktokUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
      })
      // Save avatar if a photo was picked
      if (photoBase64) {
        try {
          const avatarDataUrl = `data:image/jpeg;base64,${photoBase64}`
          const profileResult = await api.updateProfile({ avatarUrl: avatarDataUrl })
          await updateStoredProfile(profileResult.profile)
        } catch (_) {
          // Photo upload failure is non-blocking
        }
      }
      router.replace('/(auth)/verificacion')
    } catch (e) {
      setError(e.message || 'Error al guardar el perfil. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function addSpecialty() {
    const val = specialtyInput.trim()
    if (val && !specialties.includes(val)) {
      setSpecialties((prev) => [...prev, val])
      setSpecialtyInput('')
    }
  }

  function removeSpecialty(item) {
    setSpecialties((prev) => prev.filter((s) => s !== item))
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={Colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro proveedora</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.progressText}>Paso 1 de 2</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Cuéntanos sobre tu servicio</Text>

        {/* Service type */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tipo de servicio *</Text>
          <View style={styles.serviceTypeGrid}>
            {SERVICE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.serviceTypeCard,
                  serviceType === type.id && styles.serviceTypeCardActive,
                ]}
                onPress={() => setServiceType(type.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.serviceTypeEmoji}>{type.emoji}</Text>
                <Text
                  style={[
                    styles.serviceTypeLabel,
                    serviceType === type.id && { color: Colors.primary, fontWeight: '700' },
                  ]}
                  numberOfLines={2}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Descripción de tu servicio *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe qué haces, tu experiencia y qué hace especial tu servicio..."
            placeholderTextColor={Colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Specialties */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Especialidades</Text>
          <View style={styles.specialtyInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ej: HIIT, Yoga, TCC..."
              placeholderTextColor={Colors.textLight}
              value={specialtyInput}
              onChangeText={setSpecialtyInput}
              onSubmitEditing={addSpecialty}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={addSpecialty}
              activeOpacity={0.8}
            >
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          {specialties.length > 0 && (
            <View style={styles.tagsRow}>
              {specialties.map((s) => (
                <View key={s} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{s}</Text>
                  <TouchableOpacity
                    onPress={() => removeSpecialty(s)}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <X size={13} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Ciudad */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ciudad *</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectRow]}
            onPress={() => setCityModal(true)}
            activeOpacity={0.8}
          >
            <Text style={ciudad ? styles.selectText : styles.selectPlaceholder}>
              {ciudad || 'Selecciona tu ciudad'}
            </Text>
            <ChevronDown size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Modality */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>¿Cómo ofreces tu servicio? *</Text>
          <View style={styles.modalityCards}>
            {MODALITIES.map((m) => {
              const Icon = m.icon
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.modalityCard,
                    modality === m.id && styles.modalityCardActive,
                  ]}
                  onPress={() => setModality(m.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.modalityIconCircle,
                      modality === m.id && { backgroundColor: Colors.primary },
                    ]}
                  >
                    <Icon
                      size={20}
                      color={modality === m.id ? Colors.white : Colors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.modalityLabel,
                      modality === m.id && { color: Colors.primary, fontWeight: '700' },
                    ]}
                  >
                    {m.label}
                  </Text>
                  <Text style={styles.modalityDesc}>{m.desc}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Address (conditional) */}
        {(modality === 'local' || modality === 'both') && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Dirección de tu local</Text>
            <TextInput
              style={styles.input}
              placeholder="Cra 7 # 45-12, Bogotá"
              placeholderTextColor={Colors.textLight}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        )}

        {/* Price */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tarifa (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: $80.000/sesión"
            placeholderTextColor={Colors.textLight}
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* WhatsApp */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>WhatsApp de contacto *</Text>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>🇨🇴 +57</Text>
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="300 000 0000"
              placeholderTextColor={Colors.textLight}
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Links sociales */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Links y redes sociales (opcionales)</Text>
          <View style={styles.socialLinksCard}>
            <View style={styles.socialRow}>
              <View style={styles.socialIconBox}>
                <GlobeIcon size={22} color="#6b7280" />
              </View>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="https://mipagina.com"
                placeholderTextColor={Colors.textLight}
                value={websiteUrl}
                onChangeText={setWebsiteUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View style={styles.socialDivider} />
            <View style={styles.socialRow}>
              <View style={[styles.socialIconBox, { backgroundColor: '#fce7f3' }]}>
                <InstagramIcon size={22} />
              </View>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="https://instagram.com/tu_usuario"
                placeholderTextColor={Colors.textLight}
                value={instagramUrl}
                onChangeText={setInstagramUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View style={styles.socialDivider} />
            <View style={styles.socialRow}>
              <View style={[styles.socialIconBox, { backgroundColor: '#f0f0f0' }]}>
                <TikTokIcon size={22} />
              </View>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="https://tiktok.com/@tu_usuario"
                placeholderTextColor={Colors.textLight}
                value={tiktokUrl}
                onChangeText={setTiktokUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View style={styles.socialDivider} />
            <View style={styles.socialRow}>
              <View style={[styles.socialIconBox, { backgroundColor: '#dbeafe' }]}>
                <FacebookIcon size={22} />
              </View>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="https://facebook.com/tu_pagina"
                placeholderTextColor={Colors.textLight}
                value={facebookUrl}
                onChangeText={setFacebookUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>
        </View>

        {/* Photo upload */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Foto de perfil</Text>
          <TouchableOpacity
            style={[
              styles.photoUploadZone,
              photoUri && styles.photoUploadZoneDone,
            ]}
            onPress={handlePickPhoto}
            activeOpacity={0.8}
          >
            {photoUri ? (
              <>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <Text style={[styles.photoUploadTitle, { color: Colors.green }]}>
                  Foto cargada ✓
                </Text>
                <Text style={styles.photoUploadSub}>Toca para cambiar</Text>
              </>
            ) : (
              <>
                <View style={styles.photoIconCircle}>
                  <Camera size={28} color={Colors.primary} />
                </View>
                <Text style={styles.photoUploadTitle}>Subir foto de perfil</Text>
                <Text style={styles.photoUploadSub}>
                  Una foto profesional genera más confianza
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.continueBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleContinuar}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.continueBtnText}>Continuar →</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      {/* City modal */}
      <Modal
        visible={cityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecciona tu ciudad</Text>
            <FlatList
              data={CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityOption,
                    item === ciudad && styles.cityOptionActive,
                  ]}
                  onPress={() => {
                    setCiudad(item)
                    setCityModal(false)
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cityOptionText,
                      item === ciudad && styles.cityOptionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textMain,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 6,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.borderMed,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textMain,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: Colors.textMain,
  },
  selectPlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  phonePrefix: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderMed,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 15,
    color: Colors.textMain,
    fontWeight: '600',
  },
  serviceTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTypeCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  serviceTypeCardActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  serviceTypeEmoji: {
    fontSize: 22,
  },
  serviceTypeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMain,
    lineHeight: 18,
  },
  specialtyInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    width: 50,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  tagChipText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalityCards: {
    gap: 10,
  },
  modalityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modalityCardActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  modalityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMain,
  },
  modalityDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    position: 'absolute',
    bottom: 10,
    left: 66,
  },
  photoUploadZone: {
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  photoUploadZoneDone: {
    borderStyle: 'solid',
    borderColor: Colors.green,
    backgroundColor: Colors.greenBg,
  },
  photoIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 4,
  },
  photoUploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  photoUploadSub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderMed,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textMain,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  cityOption: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cityOptionActive: {
    backgroundColor: Colors.primaryBg,
  },
  cityOptionText: {
    fontSize: 16,
    color: Colors.textMain,
  },
  cityOptionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  // Social links
  socialLinksCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  socialIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
})
