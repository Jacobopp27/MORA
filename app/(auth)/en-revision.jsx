import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useRef, useEffect } from 'react'
import { Clock, MessageCircle } from 'lucide-react-native'
import { Colors } from '../../constants/Colors'

export default function EnRevisionScreen() {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Pulsing animation + icon */}
        <View style={styles.iconWrapper}>
          <Animated.View
            style={[
              styles.pulseRing,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          />
          <View style={styles.iconCircle}>
            <Clock size={36} color={Colors.amber} />
          </View>
        </View>

        {/* Status badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>En revisión</Text>
        </View>

        <Text style={styles.title}>Tu solicitud está{'\n'}siendo revisada</Text>
        <Text style={styles.description}>
          Nuestro equipo verifica cada solicitud cuidadosamente para garantizar la
          seguridad de toda la comunidad mora.
        </Text>
        <Text style={styles.timeEstimate}>⏱ Tiempo estimado: 24 a 48 horas</Text>

        {/* WhatsApp contact */}
        <View style={styles.contactCard}>
          <MessageCircle size={18} color={Colors.green} />
          <View style={styles.contactCardText}>
            <Text style={styles.contactCardTitle}>¿Tienes preguntas?</Text>
            <Text style={styles.contactCardSub}>Escríbenos al +57 300 000 0000</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.7}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.amberBg,
    borderWidth: 2,
    borderColor: Colors.amber,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.amberBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.amber,
  },
  statusBadge: {
    backgroundColor: Colors.amberBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.amber,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.amber,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textMain,
    textAlign: 'center',
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  timeEstimate: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.greenBg,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.green,
  },
  contactCardText: {
    flex: 1,
  },
  contactCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
  },
  contactCardSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutBtnText: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
