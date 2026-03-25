import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, ActivityIndicator, Alert, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { ChevronLeft, CheckCircle, XCircle, User, Mail, MapPin, Calendar, Shield } from 'lucide-react-native'
import { Colors } from '../../../constants/Colors'
import { api } from '../../../lib/api'

const { width } = Dimensions.get('window')

export default function SolicitudDetailScreen() {
  const { id } = useLocalSearchParams()
  const [solicitud, setSolicitud] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [acting, setActing]       = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPendingVerifications()
        const found = (data.requests || []).find(r => r.id === id)
        setSolicitud(found || null)
      } catch (e) {
        Alert.alert('Error', 'No se pudo cargar la solicitud.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleApprove() {
    Alert.alert('Aprobar', '¿Confirmas que deseas aprobar esta verificación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aprobar', style: 'default',
        onPress: async () => {
          setActing(true)
          try {
            await api.approveVerification({ requestId: id })
            Alert.alert('Aprobada', 'La solicitud fue aprobada exitosamente.', [
              { text: 'OK', onPress: () => router.back() },
            ])
          } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo aprobar.')
          } finally {
            setActing(false)
          }
        },
      },
    ])
  }

  async function handleReject() {
    Alert.alert('Rechazar', '¿Confirmas que deseas rechazar esta solicitud?\nMotivo: "Documentos no válidos"', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar', style: 'destructive',
        onPress: async () => {
          setActing(true)
          try {
            await api.rejectVerification({ requestId: id, notes: 'Documentos no válidos' })
            Alert.alert('Rechazada', 'La solicitud fue rechazada.', [
              { text: 'OK', onPress: () => router.back() },
            ])
          } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo rechazar.')
          } finally {
            setActing(false)
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Solicitud</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (!solicitud) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Solicitud</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centered}>
          <Shield size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Solicitud no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  const isPending = solicitud.status === 'pending'
  const initials  = (solicitud.userFullName || 'XX').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitud de verificación</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{solicitud.userFullName || 'Sin nombre'}</Text>

          <View style={[styles.statusBadge,
            solicitud.status === 'approved' ? styles.statusApproved :
            solicitud.status === 'rejected' ? styles.statusRejected :
            styles.statusPending
          ]}>
            <Text style={styles.statusBadgeText}>
              {solicitud.status === 'approved' ? 'Aprobada' :
               solicitud.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
            </Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Mail size={14} color={Colors.textMuted} />
              <Text style={styles.infoText}>{solicitud.userEmail || '—'}</Text>
            </View>
            <View style={styles.infoItem}>
              <MapPin size={14} color={Colors.textMuted} />
              <Text style={styles.infoText}>{solicitud.userCity || '—'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar size={14} color={Colors.textMuted} />
              <Text style={styles.infoText}>
                {solicitud.createdAt ? new Date(solicitud.createdAt).toLocaleString('es-CO') : '—'}
              </Text>
            </View>
            {solicitud.adminNotes ? (
              <View style={styles.infoItem}>
                <XCircle size={14} color="#ef4444" />
                <Text style={[styles.infoText, { color: '#ef4444' }]}>{solicitud.adminNotes}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Cédula */}
        <Text style={styles.sectionLabel}>Foto de cédula</Text>
        {solicitud.cedulaUrl ? (
          <View style={styles.imageCard}>
            <Image
              source={{ uri: solicitud.cedulaUrl }}
              style={styles.docImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}

        {/* Selfie */}
        <Text style={styles.sectionLabel}>Selfie</Text>
        {solicitud.selfieUrl ? (
          <View style={styles.imageCard}>
            <Image
              source={{ uri: solicitud.selfieUrl }}
              style={styles.docImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}

        {/* Acciones */}
        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.rejectBtn, acting && { opacity: 0.6 }]}
              onPress={handleReject}
              disabled={acting}
              activeOpacity={0.85}
            >
              {acting ? <ActivityIndicator color="#ef4444" /> : (
                <>
                  <XCircle size={18} color="#ef4444" />
                  <Text style={styles.rejectBtnText}>Rechazar</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.approveBtn, acting && { opacity: 0.6 }]}
              onPress={handleApprove}
              disabled={acting}
              activeOpacity={0.85}
            >
              {acting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <CheckCircle size={18} color="#fff" />
                  <Text style={styles.approveBtnText}>Aprobar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.surface },
  header:  {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle:  { fontSize: 16, fontWeight: '700', color: Colors.textMuted },
  scroll:      { padding: 16 },

  userCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText:  { fontSize: 24, fontWeight: '800', color: Colors.primary },
  userName:    { fontSize: 20, fontWeight: '800', color: Colors.textMain, marginBottom: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16 },
  statusPending:  { backgroundColor: Colors.amberBg },
  statusApproved: { backgroundColor: Colors.greenBg },
  statusRejected: { backgroundColor: '#fff5f5' },
  statusBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.textMain },
  infoGrid:    { width: '100%', gap: 10 },
  infoItem:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText:    { fontSize: 14, color: Colors.textSecondary, flex: 1 },

  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  imageCard: {
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    marginBottom: 20, borderWidth: 1, borderColor: Colors.border,
  },
  docImage:  { width: '100%', height: 220 },
  noImage:   {
    backgroundColor: Colors.surface, borderRadius: 14, height: 100,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
  },
  noImageText: { fontSize: 14, color: Colors.textLight },

  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#fca5a5',
  },
  rejectBtnText:  { fontSize: 15, fontWeight: '700', color: '#ef4444' },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14, backgroundColor: Colors.green,
  },
  approveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
