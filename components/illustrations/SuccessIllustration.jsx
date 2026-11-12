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
  Polygon,
} from 'react-native-svg';

export default function SuccessIllustration({ width = 360, height = 360 }) {
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 400 400" fill="none">
        <Defs>
          <LinearGradient id="bgCelebGrad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#EDE9FE" />
            <Stop offset="0.7" stopColor="#DDD6FE" />
            <Stop offset="1" stopColor="#C4B5FD" />
          </LinearGradient>
          <LinearGradient id="trophyGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop stopColor="#FBBF24" />
            <Stop offset="1" stopColor="#D97706" />
          </LinearGradient>
        </Defs>

        {/* Soft ground oval */}
        <Path
          d="M50 300C30 250 90 200 200 190C310 180 370 230 360 290C350 350 270 370 190 360C110 350 70 330 50 300Z"
          fill="url(#bgCelebGrad)"
          opacity="0.6"
        />

        {/* Foliage accents */}
        <Path d="M40 330C35 300 65 280 85 270C85 295 65 320 40 330Z" fill="#A78BFA" />
        <Path d="M360 330C365 300 335 280 315 270C315 295 335 320 360 330Z" fill="#A78BFA" />

        {/* Floating Thumbs Up Icons */}
        <G transform="translate(90, 80) rotate(-15)">
          <Path
            d="M8 12V24H14V12H8ZM16 24H26C27.5 24 28.8 23 29.2 21.6L32.2 14.6C32.4 14.1 32.5 13.6 32.5 13V11C32.5 9.9 31.6 9 30.5 9H23.5L24.6 3.7C24.7 3.4 24.6 3 24.4 2.7L23.3 1.6L15.4 9.5C15 9.9 14.8 10.4 14.8 11V22C14.8 23.1 15.7 24 16.8 24H16Z"
            fill="#DDD6FE"
          />
        </G>
        <G transform="translate(320, 80) rotate(15)">
          <Path
            d="M8 12V24H14V12H8ZM16 24H26C27.5 24 28.8 23 29.2 21.6L32.2 14.6C32.4 14.1 32.5 13.6 32.5 13V11C32.5 9.9 31.6 9 30.5 9H23.5L24.6 3.7C24.7 3.4 24.6 3 24.4 2.7L23.3 1.6L15.4 9.5C15 9.9 14.8 10.4 14.8 11V22C14.8 23.1 15.7 24 16.8 24H16Z"
            fill="#DDD6FE"
          />
        </G>

        {/* Confetti & Sparkles */}
        <Circle cx="160" cy="90" r="3" fill="#F97316" />
        <Circle cx="290" cy="110" r="3.5" fill="#8B5CF6" />
        <Polygon points="140,65 143,72 150,72 144,76 146,83 140,78 134,83 136,76 130,72 137,72" fill="#FCD34D" />
        <Polygon points="260,60 262,65 268,65 263,68 265,74 260,70 255,74 257,68 252,65 258,65" fill="#A78BFA" />

        {/* Left Colleague (Guy with thumbs up) */}
        <G transform="translate(80, 130)">
          <Circle cx="35" cy="28" r="14" fill="#B45309" />
          <Path d="M22 24C23 15 32 12 42 16C47 20 46 26 40 28C32 28 25 26 22 24Z" fill="#1E293B" />
          <Rect x="32" y="42" width="6" height="6" fill="#B45309" />
          <Path d="M20 48L24 105H46L50 48C44 44 26 44 20 48Z" fill="#1E293B" />
          {/* Raised Arm */}
          <Path d="M48 50L68 35L74 41L54 58Z" fill="#B45309" />
          {/* Legs */}
          <Path d="M24 104L20 185L32 185L35 125L38 185L50 185L46 104Z" fill="#334155" />
          <Rect x="14" y="185" width="20" height="7" rx="3.5" fill="#0F172A" />
          <Rect x="36" y="185" width="20" height="7" rx="3.5" fill="#0F172A" />
        </G>

        {/* Center Woman (Holding Trophy) */}
        <G transform="translate(160, 95)">
          {/* Hair back */}
          <Path d="M25 45C15 35 15 65 18 100C26 105 44 100 48 85Z" fill="#1E293B" />
          {/* Head */}
          <Circle cx="38" cy="48" r="15" fill="#FCD34D" />
          <Path d="M26 42C28 32 40 28 48 34C52 38 48 44 42 44C34 44 28 43 26 42Z" fill="#1E293B" />
          <Rect x="35" y="62" width="6" height="6" fill="#FCD34D" />

          {/* Top & Purple Blazer */}
          <Path d="M24 68L28 128H48L52 68C46 64 30 64 24 68Z" fill="#FFFFFF" />
          <Path d="M22 68L24 128H32L30 68Z" fill="#7C3AED" />
          <Path d="M44 68L42 128H50L52 68Z" fill="#7C3AED" />

          {/* Right Arm raised with Trophy */}
          <Path d="M50 70L78 28L86 34L58 78Z" fill="#FCD34D" />

          {/* Golden Trophy */}
          <G transform="translate(74, 5)">
            <Path d="M4 8C4 18 12 24 20 24C28 24 36 18 36 8H4Z" fill="url(#trophyGrad)" />
            <Path d="M4 11C-1 11 -1 18 4 18H5" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
            <Path d="M36 11C41 11 41 18 36 18H35" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
            <Rect x="17" y="24" width="6" height="10" fill="#D97706" />
            <Rect x="12" y="34" width="16" height="6" rx="2" fill="#78350F" />
          </G>

          {/* Trousers */}
          <Path d="M28 126L22 220L36 220L40 150L44 220L58 220L52 126Z" fill="#334155" />
          <Rect x="16" y="220" width="22" height="8" rx="4" fill="#1E293B" />
          <Rect x="42" y="220" width="22" height="8" rx="4" fill="#1E293B" />
        </G>

        {/* Right Colleague (Cheering) */}
        <G transform="translate(260, 140)">
          <Circle cx="35" cy="28" r="14" fill="#FCD34D" />
          <Path d="M22 24C23 15 32 12 42 16C47 20 46 26 40 28C32 28 25 26 22 24Z" fill="#1E293B" />
          <Rect x="32" y="42" width="6" height="6" fill="#FCD34D" />
          <Path d="M22 48L26 100H44L48 48C42 44 28 44 22 48Z" fill="#FFFFFF" />
          {/* Hands near face clapping/excited */}
          <Path d="M20 52L14 36L20 34L26 48Z" fill="#FCD34D" />
          <Path d="M48 50L54 36L60 38L52 52Z" fill="#FCD34D" />
          {/* Pants */}
          <Path d="M26 98L22 175L34 175L37 120L40 175L52 175L48 98Z" fill="#334155" />
          <Rect x="16" y="175" width="20" height="7" rx="3.5" fill="#0F172A" />
          <Rect x="38" y="175" width="20" height="7" rx="3.5" fill="#0F172A" />
        </G>
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
