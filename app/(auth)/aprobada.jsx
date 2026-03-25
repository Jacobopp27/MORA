import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CheckCircle, Star } from 'lucide-react-native'
import { Colors } from '../../constants/Colors'

const { width } = Dimensions.get('window')

export default function AprobadaScreen() {
  return (
    <View style={styles.container}>
      {/* Purple gradient bg */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#7c3aed' }]} />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* Stars decoration */}
          <View style={styles.starsRow}>
            <Star size={16} color="rgba(255,255,255,0.4)" />
            <Star size={20} color="rgba(255,255,255,0.6)" />
            <Star size={16} color="rgba(255,255,255,0.4)" />
          </View>

          {/* Checkmark circle */}
          <View style={styles.checkCircle}>
            <CheckCircle size={56} color={Colors.green} />
          </View>

          {/* Confetti dots */}
          <View style={styles.confettiRow}>
            {['#f472b6', '#10b981', '#f59e0b', '#3b82f6', '#f472b6'].map((c, i) => (
              <View key={i} style={[styles.confettiDot, { backgroundColor: c }]} />
            ))}
          </View>

          <Text style={styles.title}>¡Bienvenida a Mora!</Text>
          <Text style={styles.subtitle}>
            Tu identidad ha sido verificada. Ya puedes publicar tus servicios y conectar
            con cientos de mujeres en tu ciudad.
          </Text>

          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Identidad verificada</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>💜 Red de confianza</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={() => router.replace('/(tabs)/explorar')}
          >
            <Text style={styles.btnPrimaryText}>Explorar servicios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.85}
            onPress={() => router.push('/registro-proveedora')}
          >
            <Text style={styles.btnSecondaryText}>Completar perfil de proveedora</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -80,
    right: -60,
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: 100,
    left: -60,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 8,
  },
  checkCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  confettiRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  confettiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '600',
  },
  buttonsSection: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
})
