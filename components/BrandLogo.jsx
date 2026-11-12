import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Svg, { Path, Polygon, Circle } from 'react-native-svg';

export default function BrandLogo({ size = 'medium', align = 'center', useVector = false }) {
  const isLarge = size === 'large';
  const imgWidth = isLarge ? 250 : 195;
  const imgHeight = Math.round(imgWidth * (68 / 316));

  if (!useVector) {
    return (
      <View style={[styles.container, { alignItems: align, alignSelf: align === 'center' ? 'center' : 'flex-start' }]}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: imgWidth, height: imgHeight }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Vector rendering with exact colors and centered alignment
  const iconSize = isLarge ? 42 : 32;

  return (
    <View style={[styles.container, { alignItems: align, alignSelf: align === 'center' ? 'center' : 'flex-start' }]}>
      <View style={styles.row}>
        {/* Emblem on the left matching Figma */}
        <View style={[styles.iconWrapper, { width: iconSize, height: iconSize }]}>
          <Svg width={iconSize} height={iconSize} viewBox="0 0 54 54" fill="none">
            {/* Purple top slanting bar with search/circuit pin */}
            <Polygon
              points="10,24 40,6 45,13 15,31"
              fill="#7000B0"
            />
            {/* White circle pin on the purple bar */}
            <Circle cx="39" cy="11" r="4.5" fill="#FFFFFF" />
            <Circle cx="39" cy="11" r="2.2" fill="#7000B0" />

            {/* Pink / Magenta stripe */}
            <Polygon
              points="10,28 35,13 37,17 12,32"
              fill="#E11D48"
            />

            {/* Cyan triangle */}
            <Polygon
              points="15,29 27,24 27,38"
              fill="#06B6D4"
            />

            {/* Orange tilted square */}
            <Polygon
              points="16,36 27,39 27,51 16,48"
              fill="#F97316"
            />
          </Svg>
        </View>

        {/* Company Name */}
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={[styles.brandText, isLarge && styles.brandTextLarge]}>Technokrate </Text>
            <Text style={[styles.brandHighlight, isLarge && styles.brandHighlightLarge]}>Hire</Text>
          </View>
        </View>
      </View>

      {/* Tagline with Yellow 'SMART HIRING,' and Cyan 'FASTER CAREERS' */}
      <View style={styles.taglineWrapper}>
        <View style={styles.goldSwoosh} />
        <Text style={[styles.smartHiringText, isLarge && styles.taglineLarge]}>
          SMART HIRING,{' '}
        </Text>
        <Text style={[styles.fasterCareersText, isLarge && styles.taglineLarge]}>
          FASTER CAREERS
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColumn: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#17151A',
    letterSpacing: -0.5,
  },
  brandTextLarge: {
    fontSize: 27,
  },
  brandHighlight: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7000B0',
    letterSpacing: -0.5,
  },
  brandHighlightLarge: {
    fontSize: 27,
  },
  taglineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    paddingLeft: 24,
  },
  goldSwoosh: {
    width: 22,
    height: 2,
    backgroundColor: '#EAB308',
    borderRadius: 1,
    marginRight: 6,
  },
  smartHiringText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#EAB308', // Yellow colour as requested
    letterSpacing: 0.8,
  },
  fasterCareersText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#0284C7', // Cyan / blue
    letterSpacing: 0.8,
  },
  taglineLarge: {
    fontSize: 10,
  },
});