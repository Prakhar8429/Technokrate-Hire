import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function OnboardingIllustration({ width = 320, height = 320 }) {
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 320 320" fill="none">
        <Defs>
          <LinearGradient id="circleGrad" x1="0" y1="0" x2="320" y2="320" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#4C1D95" />
            <Stop offset="1" stopColor="#2E1065" />
          </LinearGradient>
        </Defs>

        {/* Night sky circle for landing */}
        <Circle cx="160" cy="160" r="130" fill="url(#circleGrad)" />
        <Circle cx="215" cy="85" r="14" fill="#FDE047" opacity="0.9" />

        {/* Stars */}
        <Circle cx="100" cy="100" r="2" fill="#FFFFFF" />
        <Circle cx="130" cy="80" r="2.5" fill="#FFFFFF" />
        <Circle cx="240" cy="130" r="2" fill="#FFFFFF" />
        <Circle cx="80" cy="160" r="1.5" fill="#FFFFFF" />

        {/* Laptop & person working */}
        <G transform="translate(110, 110)">
          {/* Hair & head */}
          <Circle cx="50" cy="35" r="18" fill="#FCD34D" />
          <Path d="M36 30C38 18 52 14 62 22C66 28 62 36 54 36C44 36 38 34 36 30Z" fill="#1E293B" />
          <Path d="M34 34C24 24 26 50 28 75C34 78 44 76 46 64Z" fill="#1E293B" />
          {/* Torso & blouse */}
          <Path d="M32 55L36 90H64L68 55C60 52 40 52 32 55Z" fill="#06B6D4" />
          {/* Arms holding laptop */}
          <Path d="M34 60L20 85L40 92L48 75Z" fill="#FCD34D" />
          <Path d="M66 60L80 85L60 92L52 75Z" fill="#FCD34D" />
          {/* Laptop */}
          <Rect x="25" y="80" width="50" height="32" rx="4" fill="#1E293B" stroke="#06B6D4" strokeWidth="1" />
          <Rect x="15" y="110" width="70" height="6" rx="3" fill="#64748B" />
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
