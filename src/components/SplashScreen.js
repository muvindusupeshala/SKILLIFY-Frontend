import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(38)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 86, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 560, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleSlide, { toValue: 0, duration: 460, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 460, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
      ]),
    ]).start();

    const bounceDot = (dot, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: -9, duration: 430, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 430, useNativeDriver: true }),
      ])
    );

    const dotLoops = [bounceDot(dot1, 0), bounceDot(dot2, 180), bounceDot(dot3, 360)];
    dotLoops.forEach((loop) => loop.start());
    return () => {
      dotLoops.forEach((loop) => loop.stop());
    };
  }, [dot1, dot2, dot3, logoOpacity, logoScale, subtitleOpacity, titleOpacity, titleSlide]);

  return (
    <View style={styles.splashContainer}>
      <View style={styles.splashCircleTop} />
      <View style={styles.splashCircleBottom} />
      <View style={styles.splashRing} />

      <Animated.View style={[styles.splashLogoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.splashLogoOuter}>
          <View style={styles.splashLogoInner}>
            <Text style={styles.splashLogoText}>S</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.splashTitleBlock, { opacity: titleOpacity, transform: [{ translateY: titleSlide }] }]}>
        <Text style={styles.splashTitle}>Skillify</Text>
        <Animated.Text style={[styles.splashSubtitle, { opacity: subtitleOpacity }]}>
          Career skill gap guidance
        </Animated.Text>
      </Animated.View>

      <View style={styles.splashDotsRow}>
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View key={index} style={[styles.splashDot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>

      <Text style={styles.splashFooter}>Skill assessment and career growth</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: '#1746d2', alignItems: 'center', justifyContent: 'center', gap: 20, overflow: 'hidden' },
  splashCircleTop: { position: 'absolute', top: -height * 0.12, right: -width * 0.24, width: width * 0.86, height: width * 0.86, borderRadius: width * 0.43, backgroundColor: 'rgba(255,255,255,0.09)' },
  splashCircleBottom: { position: 'absolute', bottom: -height * 0.08, left: -width * 0.18, width: width * 0.64, height: width * 0.64, borderRadius: width * 0.32, backgroundColor: 'rgba(5,16,40,0.16)' },
  splashRing: { position: 'absolute', width: width * 1.05, height: width * 1.05, borderRadius: width * 0.525, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  splashLogoWrap: { marginBottom: 8 },
  splashLogoOuter: { width: 132, height: 132, borderRadius: 66, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  splashLogoInner: { width: 94, height: 94, borderRadius: 34, backgroundColor: 'rgba(7,17,31,0.72)', justifyContent: 'center', alignItems: 'center', shadowColor: '#06142d', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.28, shadowRadius: 24, elevation: 8 },
  splashLogoText: { fontSize: 48, fontWeight: '900', color: '#fff' },
  splashTitleBlock: { alignItems: 'center' },
  splashTitle: { fontSize: 46, fontWeight: '900', color: '#fff', letterSpacing: 0, textShadowColor: 'rgba(0,0,0,0.18)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6 },
  splashSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.86)', marginTop: 6, fontWeight: '700', letterSpacing: 0 },
  splashDotsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  splashDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.72)' },
  splashFooter: { position: 'absolute', bottom: 30, color: 'rgba(255,255,255,0.62)', fontSize: 12, fontWeight: '700' },
});
