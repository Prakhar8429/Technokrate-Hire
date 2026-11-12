import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export default function LoginIllustration({ width = 360, height = 360 }) {
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 400 400" fill="none">
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#EDE9FE" />
            <Stop offset="0.5" stopColor="#DDD6FE" />
            <Stop offset="1" stopColor="#C4B5FD" />
          </LinearGradient>
          <LinearGradient id="phoneGrad" x1="0" y1="0" x2="0" y2="280" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#334155" />
            <Stop offset="1" stopColor="#1E293B" />
          </LinearGradient>
          <LinearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#F8FAFC" />
          </LinearGradient>
          <LinearGradient id="accentPurple" x1="0" y1="0" x2="1" y2="1">
            <Stop stopColor="#8B5CF6" />
            <Stop offset="1" stopColor="#6D28D9" />
          </LinearGradient>
        </Defs>

        {/* Soft decorative background puddle */}
        <Path
          d="M60 280C30 200 80 120 170 90C260 60 360 100 370 200C380 300 280 370 180 360C90 350 70 320 60 280Z"
          fill="url(#bgGrad)"
          opacity="0.6"
        />

        {/* Decorative foliage / leaves */}
        <G opacity="0.8">
          <Path
            d="M70 320C65 290 90 260 110 250C110 275 95 305 70 320Z"
            fill="#A78BFA"
          />
          <Path
            d="M50 310C40 285 55 260 75 250C80 275 70 300 50 310Z"
            fill="#C4B5FD"
          />
        </G>

        {/* 3D Slanted Mobile Device */}
        <G transform="translate(140, 90) rotate(5)">
          {/* Phone Body */}
          <Rect x="0" y="0" width="140" height="240" rx="20" fill="url(#phoneGrad)" />
          {/* Screen */}
          <Rect x="8" y="12" width="124" height="216" rx="14" fill="url(#screenGrad)" />
          {/* Speaker bar */}
          <Rect x="55" y="6" width="30" height="3" rx="1.5" fill="#64748B" />

          {/* Profile Card inside Screen */}
          <Rect x="18" y="26" width="104" height="188" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Avatar circle */}
          <Circle cx="70" cy="58" r="22" fill="#EDE9FE" />
          <Circle cx="70" cy="54" r="10" fill="#7C3AED" />
          <Path d="M56 73C56 65 62 62 70 62C78 62 84 65 84 73H56Z" fill="#7C3AED" />

          {/* Card Form Mock Lines */}
          <Rect x="30" y="92" width="80" height="7" rx="3.5" fill="#6D28D9" />
          <Rect x="30" y="106" width="60" height="5" rx="2.5" fill="#CBD5E1" />
          <Rect x="30" y="122" width="80" height="14" rx="4" fill="#F1F5F9" stroke="#E2E8F0" />
          <Rect x="30" y="144" width="80" height="14" rx="4" fill="#F1F5F9" stroke="#E2E8F0" />
          {/* Button inside Phone */}
          <Rect x="30" y="168" width="80" height="16" rx="4" fill="url(#accentPurple)" />
        </G>

        {/* Stylized Woman Character */}
        <G transform="translate(230, 160)">
          {/* Hair back */}
          <Path d="M40 25C30 20 20 40 22 65C30 70 45 65 50 50Z" fill="#1E293B" />
          {/* Head & Face */}
          <Circle cx="45" cy="30" r="13" fill="#FCD34D" />
          {/* Hair front */}
          <Path d="M34 26C35 18 45 15 52 20C55 24 53 30 48 30C40 30 36 28 34 26Z" fill="#1E293B" />
          {/* Neck */}
          <Rect x="43" y="42" width="5" height="7" fill="#FCD34D" />
          {/* Top / Blouse */}
          <Path d="M32 48L37 85H58L62 48C56 46 40 45 32 48Z" fill="#EC4899" />
          {/* Left Arm pointing to screen */}
          <Path d="M34 50L10 38L0 44L28 62Z" fill="#FCD34D" />
          {/* Right Arm */}
          <Path d="M60 52L68 75L62 78L56 56Z" fill="#FCD34D" />
          {/* Pants / Trousers */}
          <Path d="M37 84L32 150L44 150L47 98L50 150L62 150L58 84Z" fill="#6D28D9" />
          {/* Shoes */}
          <Rect x="26" y="150" width="19" height="7" rx="3.5" fill="#1E293B" />
          <Rect x="50" y="150" width="19" height="7" rx="3.5" fill="#1E293B" />
        </G>

        {/* Small floating sparkles */}
        <Circle cx="320" cy="110" r="3" fill="#F97316" />
        <Circle cx="120" cy="80" r="2.5" fill="#06B6D4" />
        <Circle cx="350" cy="240" r="4" fill="#A78BFA" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
