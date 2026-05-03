import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ title, onPress, variant = 'primary', disabled, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.buttonText, variant !== 'primary' && styles.buttonSecondaryText]}>{title}</Text>
    </Pressable>
  );
}

export function Screen({ title, subtitle, children, onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 124 + insets.bottom }]} showsVerticalScrollIndicator={false}>
      <View style={styles.titleBlock}>
        {!!onBack && (
          <Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} hitSlop={8}>
            <Text style={styles.backButtonText}>{'< Back'}</Text>
          </Pressable>
        )}
        <Text style={styles.screenTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {children}
    </ScrollView>
  );
}

export function ProgressBar({ value, color = '#2563eb' }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safeValue}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, message, action, onAction }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.emptyState, { paddingTop: 28 + insets.top, paddingBottom: 28 + insets.bottom }]}>
      <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>!</Text></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {!!action && <Button title={action} onPress={onAction} style={styles.emptyButton} />}
    </View>
  );
}

export function Metric({ label, value, tone = 'blue', style }) {
  return (
    <Card style={[styles.metricCard, style]}>
      <Text style={[styles.metricValue, tone === 'green' && styles.greenText, tone === 'orange' && styles.orangeText]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

export function Loader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.centerContent, { paddingTop: 24 + insets.top, paddingBottom: 24 + insets.bottom }]}>
      <ActivityIndicator size="large" color="#1746d2" />
    </View>
  );
}



export const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  loginWrap: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoBox: { alignSelf: 'center', width: 62, height: 62, borderRadius: 20, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoText: { color: '#fff', fontSize: 30, fontWeight: '900' },
  brand: { textAlign: 'center', fontSize: 36, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  brandSmall: { fontSize: 22, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  loginSubtitle: { color: '#64748b', fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 20, textAlign: 'center' },
  subtitle: { color: '#64748b', fontSize: 15, lineHeight: 22, marginTop: 8 },
  loginCard: { marginTop: 18 },
  content: { paddingHorizontal: 18, paddingTop: 18 },
  screenWrap: { flex: 1 },
  titleBlock: { marginBottom: 18 },
  backButton: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 12 },
  backButtonText: { color: '#0f172a', fontSize: 13, fontWeight: '900' },
  screenTitle: { fontSize: 30, fontWeight: '900', color: '#0f172a', letterSpacing: -0.9 },
  formTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a', letterSpacing: -0.6, marginBottom: 16 },
  kicker: { color: '#2563eb', fontSize: 11, fontWeight: '900', letterSpacing: 1.8, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 26, padding: 18, marginBottom: 14, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 3 },
  heroCard: { backgroundColor: '#dbeafe', padding: 20 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a', letterSpacing: -0.4 },
  heroText: { color: '#334155', lineHeight: 22, marginVertical: 14, fontSize: 15 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: '#0f172a', marginBottom: 8, letterSpacing: -0.2 },
  body: { color: '#1e293b', fontSize: 15, lineHeight: 22, marginBottom: 8 },
  bodyStrong: { color: '#0f172a', fontSize: 15, fontWeight: '900' },
  muted: { color: '#64748b', fontSize: 13, lineHeight: 19 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#dbe3ef', borderRadius: 16, minHeight: 52, paddingHorizontal: 14, marginBottom: 12, color: '#0f172a', fontSize: 15 },
  textArea: { minHeight: 118, textAlignVertical: 'top', paddingTop: 14 },
  button: { backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', marginTop: 8, minHeight: 50 },
  buttonSecondary: { backgroundColor: '#e2e8f0' },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  buttonSecondaryText: { color: '#2563eb' },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 },
  actionCard: { width: '48%', borderRadius: 22, padding: 16, minHeight: 116, justifyContent: 'center', marginBottom: 12 },
  actionTitle: { color: '#0f172a', fontSize: 16, fontWeight: '900', marginBottom: 6, letterSpacing: -0.2 },
  statusCard: { borderWidth: 1, borderColor: '#e2e8f0' },
  statusDotRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 999 },
  onlineDot: { backgroundColor: '#16a34a' },
  offlineDot: { backgroundColor: '#ef4444' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: '#2563eb', fontSize: 12, fontWeight: '900' },
  assessmentCard: { marginTop: 12 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  rowButton: { flex: 1 },
  levelGrid: { gap: 10, marginTop: 12 },
  levelButton: { padding: 15, borderRadius: 16, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  levelSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  levelText: { color: '#475569', fontWeight: '900', textAlign: 'center' },
  levelSelectedText: { color: '#fff' },
  progressTrack: { height: 9, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden', marginVertical: 9 },
  progressFill: { height: '100%', borderRadius: 999 },
  horizontalList: { marginBottom: 14 },
  chip: { backgroundColor: '#e2e8f0', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 999, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#475569', fontSize: 12, fontWeight: '900' },
  chipTextActive: { color: '#fff' },
  careerCard: { padding: 18 },
  cardTopRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  careerIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  careerIconText: { color: '#2563eb', fontWeight: '900', fontSize: 18 },
  metaRow: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  metaPill: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 12 },
  metaLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 },
  metaValue: { color: '#0f172a', fontSize: 13, fontWeight: '900' },
  resourceCard: { padding: 18 },
  resourceHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  providerBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  providerText: { color: '#0f172a', fontSize: 17, fontWeight: '900' },
  resourceType: { alignSelf: 'flex-start', backgroundColor: '#dcfce7', color: '#166534', borderRadius: 999, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5, fontSize: 10, fontWeight: '900', marginTop: 10 },
  resourceProgressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 2 },
  metricGridThree: { flexDirection: 'row', gap: 10, marginBottom: 2 },
  metricCard: { width: '48%', alignItems: 'center', paddingVertical: 18 },
  metricThreeCard: { flex: 1, width: undefined },
  metricValue: { color: '#2563eb', fontSize: 25, fontWeight: '900' },
  metricLabel: { color: '#64748b', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginTop: 4, textAlign: 'center' },
  greenText: { color: '#16a34a' },
  orangeText: { color: '#f97316' },
  skillRow: { marginBottom: 16 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 4 },
  levelBadge: { backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: 999, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4, fontSize: 10, fontWeight: '900' },
  metBadge: { backgroundColor: '#dcfce7', color: '#166534' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: '#f8fafc' },
  emptyIcon: { width: 54, height: 54, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyIconText: { color: '#64748b', fontSize: 24, fontWeight: '900' },
  emptyTitle: { color: '#0f172a', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  emptyMessage: { color: '#64748b', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8, marginBottom: 12 },
  emptyButton: { minWidth: 180 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },


  topInset: { backgroundColor: '#f8fafc' },
  appHeader: { paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerEmail: { color: '#64748b', fontSize: 12, maxWidth: 230 },
  logout: { color: '#ef4444', fontWeight: '900' },
  tabBar: { position: 'absolute', left: 14, right: 14, backgroundColor: '#07111f', borderRadius: 32, paddingVertical: 8, paddingHorizontal: 8, flexDirection: 'row', justifyContent: 'space-between', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.32, shadowRadius: 26, elevation: 12, borderWidth: 1, borderColor: '#16243a', overflow: 'hidden' },
  tabLiquidPill: { position: 'absolute', top: 8, bottom: 8, left: 8, borderRadius: 26, backgroundColor: '#f8fafc', shadowColor: '#60a5fa', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 7, borderRadius: 24, minHeight: 58, zIndex: 2 },
  tabItemActive: {},
  tabPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  tabIcon: { width: 25, height: 25, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 3, backgroundColor: '#172033' },
  tabIconActive: { backgroundColor: '#2563eb' },
  tabIconText: { color: '#94a3b8', fontSize: 11, fontWeight: '900' },
  tabIconTextActive: { color: '#fff' },
  tabText: { color: '#94a3b8', fontSize: 10, fontWeight: '900' },
  tabTextActive: { color: '#0f172a' },
});
