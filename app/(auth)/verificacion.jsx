import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Alert, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { ChevronLeft, Camera, User, CheckCircle, Shield, Lock, RefreshCw } from 'lucide-react-native'
import { Colors } from '../../constants/Colors'
import { api } from '../../lib/api'

async function pickImage(source) {
  const { status } = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync()

  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesitamos acceso a tu ' + (source === 'camera' ? 'cámara' : 'galería') + ' para continuar.')
    return null
  }

  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: true,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: true,
      })

  if (result.canceled) return null
  return result.assets[0]
}

function UploadZone({ label, sublabel, icon: Icon, image, onPick, done }) {
  return (
    <View style={[styles.uploadZone, done && styles.uploadZoneDone]}>
      {done ? (
        <View style={styles.uploadedContent}>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
          <View style={styles.uploadedBadge}>
            <CheckCircle size={14} color={Colors.green} />
            <Text style={styles.uploadedLabel}>{label} cargada</Text>
          </View>
          <TouchableOpacity onPress={onPick} style={styles.retakeBtn} activeOpacity={0.7}>
            <RefreshCw size={14} color={Colors.primary} />
            <Text style={styles.retakeBtnText}>Volver a tomar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadContent}>
          <View style={styles.uploadIconCircle}>
            <Icon size={28} color={Colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>{label}</Text>
          <Text style={styles.uploadSub}>{sublabel}</Text>
          <View style={styles.uploadBtnsRow}>
            <TouchableOpacity
              style={styles.uploadActionBtn}
              onPress={() => onPick('camera')}
              activeOpacity={0.8}
            >
              <Camera size={14} color={Colors.primary} />
              <Text style={styles.uploadActionBtnText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadActionBtn}
              onPress={() => onPick('library')}
              activeOpacity={0.8}
            >
              <Text style={styles.uploadActionBtnText}>Galería</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

export default function VerificacionScreen() {
  const [cedula, setCedula] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handlePickCedula(source) {
    const img = await pickImage(source)
    if (img) setCedula(img)
  }

  async function handlePickSelfie(source) {
    const img = await pickImage(source)
    if (img) setSelfie(img)
  }

  async function handleSubmit() {
    if (!cedula || !selfie) return
    setLoading(true)
    try {
      await api.submitVerification({
        cedulaUrl: `data:image/jpeg;base64,${cedula.base64}`,
        selfieUrl: `data:image/jpeg;base64,${selfie.base64}`,
      })
      router.replace('/(auth)/en-revision')
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo enviar la verificación. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !!cedula && !!selfie

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={Colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificación</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.progressText}>Paso 2 de 3</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Verifica tu identidad</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Shield size={18} color={Colors.primary} />
            <Text style={styles.infoCardTitle}>Comunidad segura</Text>
          </View>
          <Text style={styles.infoCardText}>
            Solo mujeres verificadas pueden prestar servicios en mora. Este proceso
            protege a toda la comunidad y genera confianza genuina entre nuestras usuarias.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Documentos requeridos</Text>

        <UploadZone
          label="Foto de tu cédula"
          sublabel="Toma una foto clara de tu cédula (ambos lados visibles)"
          icon={Camera}
          image={cedula}
          done={!!cedula}
          onPick={handlePickCedula}
        />

        <UploadZone
          label="Selfie"
          sublabel="Tómate una foto sosteniendo tu cédula a la altura del pecho"
          icon={User}
          image={selfie}
          done={!!selfie}
          onPick={handlePickSelfie}
        />

        <View style={styles.privacyNote}>
          <Lock size={14} color={Colors.textMuted} />
          <Text style={styles.privacyText}>
            Tus documentos son encriptados y solo usados para verificación. No se comparten con terceros.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled, loading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Enviar verificación</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, backgroundColor: Colors.surface,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textMain },
  progressContainer: { paddingHorizontal: 24, paddingVertical: 12, gap: 6 },
  progressTrack: { height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  progressText: { fontSize: 12, color: Colors.textMuted, textAlign: 'right' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textMain, marginBottom: 16 },
  infoCard: {
    backgroundColor: Colors.primaryBg, borderRadius: 14, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  infoCardText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  uploadZone: {
    borderWidth: 2, borderColor: Colors.primaryBorder, borderStyle: 'dashed',
    borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16, backgroundColor: '#fff',
  },
  uploadZoneDone: { borderColor: Colors.green, backgroundColor: Colors.greenBg, borderStyle: 'solid' },
  uploadContent: { alignItems: 'center', gap: 8, width: '100%' },
  uploadIconCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: Colors.textMain },
  uploadSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  uploadBtnsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  uploadActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryBg, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  uploadActionBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  uploadedContent: { alignItems: 'center', gap: 10, width: '100%' },
  previewImage: { width: '100%', height: 140, borderRadius: 10, resizeMode: 'cover' },
  uploadedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  uploadedLabel: { fontSize: 14, fontWeight: '700', color: Colors.green },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  retakeBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  privacyNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 24,
  },
  privacyText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: Colors.textLight },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})
