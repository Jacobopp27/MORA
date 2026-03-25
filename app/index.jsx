import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../constants/Colors'
import Svg, { Circle, Ellipse, Path } from 'react-native-svg'

const { width, height } = Dimensions.get('window')

function MoraBerryLogo({ size = 64 }) {
  const r = size / 2
  const dotR = size * 0.09
  const dots = [
    { cx: r, cy: r * 0.55 },
    { cx: r - size * 0.18, cy: r * 0.72 },
    { cx: r + size * 0.18, cy: r * 0.72 },
    { cx: r - size * 0.28, cy: r },
    { cx: r, cy: r },
    { cx: r + size * 0.28, cy: r },
    { cx: r - size * 0.18, cy: r * 1.28 },
    { cx: r + size * 0.18, cy: r * 1.28 },
    { cx: r, cy: r * 1.45 },
    { cx: r - size * 0.28, cy: r * 1.14 },
    { cx: r + size * 0.28, cy: r * 1.14 },
    { cx: r, cy: r * 0.82 },
  ]
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Ellipse cx={r} cy={r} rx={r * 0.78} ry={r * 0.88} fill="rgba(255,255,255,0.18)" />
      {dots.map((d, i) => (
        <Circle key={i} cx={d.cx} cy={d.cy} r={dotR} fill="white" opacity={0.92} />
      ))}
      <Path
        d={`M${r} ${r * 0.1} Q${r + size * 0.08} ${r * 0.28} ${r + size * 0.04} ${r * 0.42}`}
        stroke="white"
        strokeWidth={size * 0.055}
        strokeLinecap="round"
        fill="none"
        opacity={0.8}
      />
    </Svg>
  )
}

export default function BienvenidaScreen() {
  return (
    <View style={styles.container}>
      {/* Background purple */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgTop} />
        <View style={styles.bgBottom} />
      </View>

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTopLeft]} />
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Logo section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <MoraBerryLogo size={80} />
          </View>
          <Text style={styles.appName}>mora</Text>
          <Text style={styles.subtitle}>La red de confianza{'\n'}entre mujeres</Text>
          <Text style={styles.description}>
            Encuentra servicios prestados por{'\n'}mujeres verificadas
          </Text>

          {/* Dot indicators */}
          <View style={styles.dotRow}>
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotInactive]} />
          </View>
        </View>

        {/* Buttons section */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/registro')}
          >
            <Text style={styles.btnPrimaryText}>Busco servicios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/registro?role=proveedora')}
          >
            <Text style={styles.btnSecondaryText}>Ofrezco servicios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginLink}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.loginLinkBold}>Inicia sesión</Text>
            </Text>
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
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
    backgroundColor: '#7c3aed',
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#6d28d9',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  circleTopLeft: {
    width: 280,
    height: 280,
    top: -80,
    left: -80,
  },
  circleTopRight: {
    width: 200,
    height: 200,
    top: -40,
    right: -60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circleBottomLeft: {
    width: 160,
    height: 160,
    bottom: 120,
    left: -50,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 16,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -2,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotInactive: {
    width: 8,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.white,
  },
  buttonsSection: {
    gap: 12,
    paddingTop: 8,
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
  loginLink: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingVertical: 8,
  },
  loginLinkBold: {
    color: Colors.white,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
})
