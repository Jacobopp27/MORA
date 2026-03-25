import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg'

export function InstagramIcon({ size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#f09433" />
          <Stop offset="25%" stopColor="#e6683c" />
          <Stop offset="50%" stopColor="#dc2743" />
          <Stop offset="75%" stopColor="#cc2366" />
          <Stop offset="100%" stopColor="#bc1888" />
        </LinearGradient>
      </Defs>
      <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#igGrad)" />
      <Circle cx="12" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="1.8" />
      <Circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </Svg>
  )
}

export function TikTokIcon({ size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect width="24" height="24" rx="5" fill="#010101" />
      <Path
        d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5 2.592 2.592 0 0 1-2.59-2.5 2.592 2.592 0 0 1 2.59-2.5c.28 0 .54.04.79.1V9.84a5.633 5.633 0 0 0-.79-.05 5.674 5.674 0 0 0-5.67 5.67 5.674 5.674 0 0 0 5.67 5.67 5.674 5.674 0 0 0 5.67-5.67V9.19a7.305 7.305 0 0 0 4.27 1.36V7.46s-1.88.09-3.2-1.64z"
        fill="white"
      />
      <Path
        d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5 2.592 2.592 0 0 1-2.59-2.5 2.592 2.592 0 0 1 2.59-2.5c.28 0 .54.04.79.1V9.84a5.633 5.633 0 0 0-.79-.05 5.674 5.674 0 0 0-5.67 5.67 5.674 5.674 0 0 0 5.67 5.67 5.674 5.674 0 0 0 5.67-5.67V9.19a7.305 7.305 0 0 0 4.27 1.36V7.46s-1.88.09-3.2-1.64z"
        fill="#69C9D0"
        opacity="0.5"
      />
    </Svg>
  )
}

export function FacebookIcon({ size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect width="24" height="24" rx="5" fill="#1877F2" />
      <Path
        d="M16.5 3H14c-2.76 0-4.5 1.79-4.5 4.5V9H7.5v3H9.5v6h3V12h2l.5-3h-2.5V7.75C12.5 7 12.94 6.5 13.75 6.5H16.5V3z"
        fill="white"
      />
    </Svg>
  )
}

export function GlobeIcon({ size = 24, color = '#6b7280' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <Path d="M12 3c-2 2.5-3 5.5-3 9s1 6.5 3 9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M12 3c2 2.5 3 5.5 3 9s-1 6.5-3 9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M3 12h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  )
}
