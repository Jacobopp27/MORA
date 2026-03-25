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
import { ChevronLeft, ChevronDown, Check } from 'lucide-react-native'
import { Colors } from '../constants/Colors'
import { api } from '../lib/api'
import { getStoredProfile, updateStoredProfile } from '../lib/auth'

const CITIES = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
  'Bucaramanga', 'Manizales', 'Pereira', 'Santa Marta', 'Cúcuta',
]

export default function EditarPerfilScreen() {
  const [fullName, setFullName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity] = useState('')
  const [cityModal, setCityModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const cached = await getStoredProfile()
        if (cached) {
          setFullName(cached.fullName || '')
          setWhatsapp(cached.whatsapp || '')
          setCity(cached.city || '')
        }
        const result = await api.me()
        if (result.profile) {
          setFullName(result.profile.fullName || '')
          setWhatsapp(result.profile.whatsapp || '')
          setCity(result.profile.city || '')
        }
      } catch (e) {
        // use cached data
      } finally {
        setInitialLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function handleSave() {
    if (!fullName.trim()) return setError('El nombre no puede estar vacío.')
    setError('')
    setLoading(true)
    try {
      const result = await api.updateProfile({
        fullName: fullName.trim(),
        whatsapp: whatsapp.trim() || undefined,
        city: city || undefined,
      })
      await updateStoredProfile(result.profile)
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={Colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
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
          {/* Nombre */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre completo"
              placeholderTextColor={Colors.textLight}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* WhatsApp */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>WhatsApp</Text>
            <TextInput
              style={styles.input}
              placeholder="+57 300 000 0000"
              placeholderTextColor={Colors.textLight}
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
            />
          </View>

          {/* Ciudad */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ciudad</Text>
            <TouchableOpacity
              style={[styles.input, styles.selectRow]}
              onPress={() => setCityModal(true)}
              activeOpacity={0.8}
            >
              <Text style={city ? styles.selectText : styles.selectPlaceholder}>
                {city || 'Selecciona tu ciudad'}
              </Text>
              <ChevronDown size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Save button */}
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
                    item === city && styles.cityOptionActive,
                  ]}
                  onPress={() => {
                    setCity(item)
                    setCityModal(false)
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cityOptionText,
                      item === city && styles.cityOptionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === city && <Check size={16} color={Colors.primary} />}
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
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  saveBtnDone: {
    backgroundColor: Colors.green,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
})
