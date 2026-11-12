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
  Text as SvgText,
} from 'react-native-svg';

export default function ForgotPasswordIllustration({ width = 360, height = 360 }) {
  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 400 400" fill="none">
        <Defs>
          <LinearGradient id="bgOvalGrad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#EDE9FE" />
            <Stop offset="0.6" stopColor="#DDD6FE" />
            <Stop offset="1" stopColor="#C4B5FD" />
          </LinearGradient>
          <LinearGradient id="phoneCardGrad" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#1E293B" />
            <Stop offset="1" stopColor="#0F172A" />
          </LinearGradient>
        </Defs>

        {/* Soft floor oval */}
        <Path
          d="M80 290C40 250 80 200 170 180C260 160 360 190 360 270C360 340 270 360 180 350C100 340 90 320 80 290Z"
          fill="url(#bgOvalGrad)"
          opacity="0.6"
        />

        {/* Decorative foliage */}
        <Path d="M60 330C55 295 85 270 105 260C105 285 85 315 60 330Z" fill="#A78BFA" />
        <Path d="M45 320C35 295 50 270 70 260C75 285 65 310 45 320Z" fill="#C4B5FD" />
        <Path d="M350 330C355 295 325 270 305 260C305 285 325 315 350 330Z" fill="#A78BFA" />

        {/* Floating Password Dialog Screen */}
        <G transform="translate(230, 140) rotate(-4)">
          <Rect x="0" y="0" width="130" height="150" rx="14" fill="url(#phoneCardGrad)" />
          {/* Lock / user badge */}
          <Circle cx="65" cy="45" r="18" fill="#FFFFFF" opacity="0.9" />
          <Circle cx="65" cy="41" r="7" fill="#6D28D9" />
          <Path d="M54 56C54 50 59 48 65 48C71 48 76 50 76 56H54Z" fill="#6D28D9" />

          {/* Password label */}
          <SvgText x="65" y="76" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">
            PASSWORD
          </SvgText>

          {/* Password dot input */}
          <Rect x="20" y="86" width="90" height="16" rx="4" fill="#334155" />
          <Circle cx="35" cy="94" r="3" fill="#A78BFA" />
          <Circle cx="47" cy="94" r="3" fill="#A78BFA" />
          <Circle cx="59" cy="94" r="3" fill="#A78BFA" />
          <Circle cx="71" cy="94" r="3" fill="#A78BFA" />
          <Circle cx="83" cy="94" r="3" fill="#A78BFA" />
          <Circle cx="95" cy="94" r="3" fill="#A78BFA" />

          {/* Reset button snippet */}
          <Rect x="30" y="112" width="70" height="12" rx="3" fill="#7C3AED" />
        </G>

        {/* Perplexed Character / Woman */}
        <G transform="translate(140, 110)">
          {/* Hair back */}
          <Path d="M30 40C20 30 15 60 16 95C25 100 40 95 44 80Z" fill="#1E293B" />
          {/* Head */}
          <Circle cx="38" cy="48" r="15" fill="#FCD34D" />
          {/* Glasses */}
          <Circle cx="33" cy="48" r="4.5" stroke="#1E293B" strokeWidth="1.5" fill="none" />
          <Circle cx="44" cy="48" r="4.5" stroke="#1E293B" strokeWidth="1.5" fill="none" />
          <Path d="M37.5 48H39.5" stroke="#1E293B" strokeWidth="1.5" />
          {/* Hair front */}
          <Path d="M26 44C28 32 40 28 48 35C52 40 48 46 42 46C34 46 28 45 26 44Z" fill="#1E293B" />

          {/* Hand to head (thinking gesture) */}
          <Path d="M48 40L62 30L68 36L56 50Z" fill="#FCD34D" />

          {/* Neck */}
          <Rect x="36" y="62" width="6" height="8" fill="#FCD34D" />
          {/* Top */}
          <Path d="M26 68L30 115H55L60 68C52 65 34 65 26 68Z" fill="#F472B6" />
          {/* Left Hand holding phone / notes */}
          <Path d="M28 72L12 90L16 96L32 82Z" fill="#FCD34D" />
          <Rect x="8" y="88" width="10" height="16" rx="2" fill="#7C3AED" />

          {/* Trousers */}
          <Path d="M30 114L24 195L38 195L42 135L45 195L59 195L55 114Z" fill="#334155" />
          {/* Shoes */}
          <Rect x="18" y="195" width="22" height="8" rx="4" fill="#0F172A" />
          <Rect x="44" y="195" width="22" height="8" rx="4" fill="#0F172A" />
        </G>

        {/* Floating Question Marks */}
        <G>
          <SvgText x="210" y="110" fill="#A78BFA" fontSize="26" fontWeight="bold">?</SvgText>
          <SvgText x="235" y="130" fill="#C4B5FD" fontSize="20" fontWeight="bold">?</SvgText>
          <SvgText x="195" y="140" fill="#8B5CF6" fontSize="18" fontWeight="bold">?</SvgText>
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
