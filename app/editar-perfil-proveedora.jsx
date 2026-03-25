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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronDown,
  Plus,
  X,
  Check,
  Home,
  MapPin,
  Layers,
} from 'lucide-react-native'
import { Colors } from '../constants/Colors'
import { api } from '../lib/api'

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
  { id: 'A domicilio', label: 'A domicilio', icon: Home, desc: 'Vas donde tu clienta' },
  { id: 'En mi local/gym', label: 'En mi local / gym', icon: MapPin, desc: 'Tu clienta va a tu espacio' },
  { id: 'Ambas', label: 'Ambas', icon: Layers, desc: 'Flexible según necesidad' },
]

export default function EditarPerfilProveedoraScreen() {
  const [serviceType, setServiceType] = useState('')
  const [description, setDescription] = useState('')
  const [specialties, setSpecialties] = useState([])
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [modality, setModality] = useState('')
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [availability, setAvailability] = useState('')
  const [cityModal, setCityModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await api.getMyProviderProfile()
        const p = result.providerProfile
        if (p) {
          // Match serviceType to SERVICE_TYPES id or keep raw label
          const matchedType = SERVICE_TYPES.find(
            (s) => s.label === p.serviceType || s.id === p.serviceType
          )
          setServiceType(matchedType ? matchedType.id : p.serviceType || '')
          setDescription(p.description || '')
          setSpecialties(p.specialties || [])
          setCiudad(p.city || '')
          setModality(p.serviceMode || '')
          setAddress(p.address || '')
          setPrice(p.priceLabel || '')
          setWhatsapp(p.whatsapp?.replace('+57', '') || '')
          setAvailability(p.availability || '')
        }
      } catch (e) {
        Alert.alert('Error', 'No se pudo cargar tu perfil de servicios.')
      } finally {
        setInitialLoading(false)
      }
    }
    loadProfile()
  }, [])

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

  async function handleSave() {
    if (!description.trim()) return setError('Agrega una descripción.')
    if (!ciudad) return setError('Selecciona tu ciudad.')
    if (!modality) return setError('Selecciona la modalidad.')
    setError('')
    setLoading(true)
    try {
      const serviceLabel = SERVICE_TYPES.find((s) => s.id === serviceType)?.label || serviceType
      await api.updateProviderProfile({
        serviceType: serviceLabel || undefined,
        description: description.trim(),
        specialties,
        serviceMode: modality,
        address: address.trim() || undefined,
        city: ciudad,
        priceLabel: price.trim() || undefined,
        whatsapp: whatsapp.trim() ? `+57${whatsapp.replace(/\s/g, '')}` : undefined,
        availability: availability.trim() || undefined,
      })
      setSaved(true)
      setTimeout(() => router.back(), 1000)
    } catch (e) {
      setError(e.message || 'Error al guardar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={Colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar servicios</Text>
        <View style={{ width: 40 }} />
      </View>

      {initialLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tipo de servicio */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tipo de servicio</Text>
            <View style={styles.serviceTypeGrid}>
              {SERVICE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.serviceTypeCard, serviceType === type.id && styles.serviceTypeCardActive]}
                  onPress={() => setServiceType(type.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.serviceTypeEmoji}>{type.emoji}</Text>
                  <Text
                    style={[styles.serviceTypeLabel, serviceType === type.id && { color: Colors.primary, fontWeight: '700' }]}
                    numberOfLines={2}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descripción *</Text>
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

          {/* Especialidades */}
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
              <TouchableOpacity style={styles.addBtn} onPress={addSpecialty} activeOpacity={0.8}>
                <Plus size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
            {specialties.length > 0 && (
              <View style={styles.tagsRow}>
                {specialties.map((s) => (
                  <View key={s} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{s}</Text>
                    <TouchableOpacity onPress={() => removeSpecialty(s)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
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

          {/* Modalidad */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>¿Cómo ofreces tu servicio? *</Text>
            <View style={styles.modalityCards}>
              {MODALITIES.map((m) => {
                const Icon = m.icon
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.modalityCard, modality === m.id && styles.modalityCardActive]}
                    onPress={() => setModality(m.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.modalityIconCircle, modality === m.id && { backgroundColor: Colors.primary }]}>
                      <Icon size={20} color={modality === m.id ? Colors.white : Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalityLabel, modality === m.id && { color: Colors.primary, fontWeight: '700' }]}>
                        {m.label}
                      </Text>
                      <Text style={styles.modalityDesc}>{m.desc}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Dirección */}
          {(modality === 'En mi local/gym' || modality === 'Ambas') && (
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

          {/* Tarifa */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tarifa</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: $80.000/sesión"
              placeholderTextColor={Colors.textLight}
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* Disponibilidad */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Disponibilidad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Lunes a viernes 8am-6pm"
              placeholderTextColor={Colors.textLight}
              value={availability}
              onChangeText={setAvailability}
            />
          </View>

          {/* WhatsApp */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>WhatsApp de contacto</Text>
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

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }, saved && styles.saveBtnDone]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={loading || saved}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : saved ? (
              <>
                <Check size={18} color={Colors.white} />
                <Text style={styles.saveBtnText}>Guardado</Text>
              </>
            ) : (
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={cityModal} transparent animationType="slide" onRequestClose={() => setCityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecciona tu ciudad</Text>
            <FlatList
              data={CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.cityOption, item === ciudad && styles.cityOptionActive]}
                  onPress={() => { setCiudad(item); setCityModal(false) }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cityOptionText, item === ciudad && styles.cityOptionTextActive]}>{item}</Text>
                  {item === ciudad && <Check size={16} color={Colors.primary} />}
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
  safe: { flex: 1, backgroundColor: Colors.white },
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
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, backgroundColor: Colors.surface,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textMain },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
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
  textArea: { height: 100, paddingTop: 14 },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 16, color: Colors.textMain },
  selectPlaceholder: { fontSize: 16, color: Colors.textLight },
  serviceTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceTypeCard: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: 12,
    padding: 12, alignItems: 'flex-start', gap: 6,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  serviceTypeCardActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  serviceTypeEmoji: { fontSize: 22 },
  serviceTypeLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMain, lineHeight: 18 },
  specialtyInputRow: { flexDirection: 'row', gap: 8 },
  addBtn: { width: 50, backgroundColor: Colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryBg, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  tagChipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  modalityCards: { gap: 10 },
  modalityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 14, borderWidth: 1.5, borderColor: Colors.border,
  },
  modalityCardActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  modalityIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  modalityLabel: { fontSize: 15, fontWeight: '600', color: Colors.textMain },
  modalityDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  phonePrefix: {
    backgroundColor: Colors.surface, borderWidth: 1.5,
    borderColor: Colors.borderMed, borderRadius: 12,
    paddingHorizontal: 12, justifyContent: 'center',
  },
  phonePrefixText: { fontSize: 15, color: Colors.textMain, fontWeight: '600' },
  errorBox: {
    backgroundColor: '#fff5f5', borderRadius: 10, padding: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#fca5a5',
  },
  errorText: { fontSize: 13, color: '#ef4444', fontWeight: '500' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, marginTop: 8,
  },
  saveBtnDone: { backgroundColor: Colors.green },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, paddingTop: 12, maxHeight: '70%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: Colors.borderMed,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17, fontWeight: '700', color: Colors.textMain,
    textAlign: 'center', marginBottom: 12, paddingHorizontal: 24,
  },
  cityOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cityOptionActive: { backgroundColor: Colors.primaryBg },
  cityOptionText: { fontSize: 16, color: Colors.textMain },
  cityOptionTextActive: { color: Colors.primary, fontWeight: '700' },
})
