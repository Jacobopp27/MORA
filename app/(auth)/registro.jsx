import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ChevronLeft, ChevronDown, Eye, EyeOff } from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { api } from '../../lib/api'
import { saveAuth } from '../../lib/auth'

const CITIES = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
  'Bucaramanga', 'Manizales', 'Pereira', 'Santa Marta', 'Cúcuta',
  'Ibagué', 'Villavicencio', 'Pasto', 'Montería', 'Neiva',
]

export default function RegistroScreen() {
  const { role } = useLocalSearchParams()
  const isProveedora = role === 'proveedora'
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [cityModal, setCityModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    if (!nombre || !email || !password) {
      setError('Por favor completa nombre, correo y contraseña.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await api.register({
        fullName: nombre,
        email,
        password,
        whatsapp: whatsapp || undefined,
        city: ciudad || undefined,
        role: isProveedora ? 'proveedora' : 'usuaria',
      })
      await saveAuth(result.token, result.profile)
      if (isProveedora) {
        router.replace('/registro-proveedora')
      } else {
        router.replace('/(auth)/verificacion')
      }
    } catch (e) {
      setError(e.message || 'Error al crear la cuenta. Intenta de nuevo.')
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
        <Text style={styles.headerTitle}>{isProveedora ? 'Registro proveedora' : 'Crear cuenta'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Únete a la comunidad de mujeres que se apoyan entre sí
        </Text>

        {/* Nombre */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre completo"
            placeholderTextColor={Colors.textLight}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={Colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* WhatsApp */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>WhatsApp</Text>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>🇨🇴 +57</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="300 000 0000"
              placeholderTextColor={Colors.textLight}
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Ciudad */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ciudad</Text>
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

        {/* Contraseña */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              {showPassword
                ? <EyeOff size={18} color={Colors.textMuted} />
                : <Eye size={18} color={Colors.textMuted} />
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>o continúa con</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Google button */}
        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Continuar con Google</Text>
        </TouchableOpacity>

        {/* Error message */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Create account button */}
        <TouchableOpacity
          style={[styles.createBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.createBtnText}>Crear cuenta</Text>
          }
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          Al crear una cuenta aceptas nuestros{' '}
          <Text style={styles.termsLink}>Términos de uso</Text> y{' '}
          <Text style={styles.termsLink}>Política de privacidad</Text>
        </Text>

        {/* Ya tengo cuenta */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
          <Text style={[styles.terms, { color: Colors.textMuted }]}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(auth)/login')}>
            <Text style={[styles.terms, { color: Colors.primary, fontWeight: '700' }]}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* City Picker Modal */}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
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
  phoneInput: {
    flex: 1,
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
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderMed,
  },
  separatorText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.borderMed,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 10,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMain,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  terms: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
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
})
