import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch, clearAuthSession, getCurrentUser } from './src/api';
import { styles } from './src/components/ui';
import SplashScreen from './src/components/SplashScreen';
import { tabs } from './src/constants/app';
import LoginScreen from './src/screens/auth/LoginScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import SkillAssessmentScreen from './src/screens/skillAssessment/SkillAssessmentScreen';
import SkillQuestionManagementScreen from './src/screens/skillQuestions/SkillQuestionManagementScreen';
import CareerPathManagementScreen from './src/screens/careerPaths/CareerPathManagementScreen';
import SkillGapAnalysisScreen from './src/screens/skillGapAnalysis/SkillGapAnalysisScreen';
import LearningResourceManagementScreen from './src/screens/learningResources/LearningResourceManagementScreen';
import ProgressAnalyticsScreen from './src/screens/progressAnalytics/ProgressAnalyticsScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';

function AppContent() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('dashboard');
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(null);
  const [booting, setBooting] = useState(true);
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const tabSlide = useRef(new Animated.Value(0)).current;

  const navigate = useCallback((target, options = {}) => {
    setScreen((current) => {
      if (current === target) return current;
      if (!options.replace) setHistory((items) => [...items, current].slice(-12));
      return target;
    });
  }, []);

  const goBack = useCallback(() => {
    setHistory((items) => {
      if (!items.length) {
        setScreen('dashboard');
        return [];
      }

      const nextHistory = items.slice(0, -1);
      setScreen(items[items.length - 1]);
      return nextHistory;
    });
  }, []);

  useEffect(() => {
    let alive = true;
    const minimumLoadingTime = new Promise((resolve) => setTimeout(resolve, 3100));

    apiFetch('/api/settings')
      .then(setSettings)
      .catch(() => setSettings(null))
      .finally(() => {
        minimumLoadingTime.then(() => {
          if (alive) setBooting(false);
        });
      });

    return () => {
      alive = false;
    };
  }, [user]);

  const activeTabIndex = Math.max(0, tabs.findIndex((tab) => tab.key === screen));
  const tabItemWidth = tabBarWidth ? (tabBarWidth - 16) / tabs.length : 0;

  useEffect(() => {
    Animated.spring(tabSlide, {
      toValue: activeTabIndex * tabItemWidth,
      useNativeDriver: true,
      damping: 18,
      stiffness: 170,
      mass: 0.65,
    }).start();
  }, [activeTabIndex, tabItemWidth, tabSlide]);

  useEffect(() => {
    if (!user) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen !== 'dashboard') {
        goBack();
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [goBack, screen, user]);

  const activeScreen = useMemo(() => {
    if (!user) return <LoginScreen onAuthenticated={setUser} />;

    if (user.role === 'admin') return <AdminDashboardScreen />;

    const screenProps = { setScreen: navigate, goBack };
    const screens = {
      dashboard: <DashboardScreen user={user} setScreen={navigate} settings={settings} />,
      assessments: <SkillAssessmentScreen {...screenProps} />,
      skillQuestions: <SkillQuestionManagementScreen goBack={goBack} />,
      careers: <CareerPathManagementScreen {...screenProps} />,
      gap: <SkillGapAnalysisScreen {...screenProps} />,
      resources: <LearningResourceManagementScreen goBack={goBack} />,
      progress: <ProgressAnalyticsScreen goBack={goBack} />,
    };

    return screens[screen] || screens.dashboard;
  }, [goBack, screen, user, settings, navigate]);

  if (booting) return <SplashScreen />;
  if (!user) return activeScreen;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={[styles.topInset, { height: insets.top }]} />
      <View style={styles.appHeader}>
        <View style={styles.flex}>
          <Text style={styles.brandSmall}>Skillify</Text>
          <Text style={styles.headerEmail} numberOfLines={1}>{getCurrentUser()?.email}</Text>
        </View>
        <Pressable onPress={() => { clearAuthSession(); setHistory([]); setUser(null); setScreen('dashboard'); }} hitSlop={12}>
          <Text style={styles.logout}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.screenWrap}>
        {activeScreen}
      </View>

      {user.role !== 'admin' && <View
        style={[styles.tabBar, { bottom: Math.max(10, insets.bottom + 8) }]}
        onLayout={(event) => setTabBarWidth(event.nativeEvent.layout.width)}
      >
        {!!tabItemWidth && (
          <Animated.View
            pointerEvents="none"
            style={[styles.tabLiquidPill, { width: tabItemWidth, transform: [{ translateX: tabSlide }] }]}
          />
        )}
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => navigate(tab.key, { replace: tab.key === screen })}
            style={({ pressed }) => [styles.tabItem, screen === tab.key && styles.tabItemActive, pressed && styles.tabPressed]}
          >
            <View style={[styles.tabIcon, screen === tab.key && styles.tabIconActive]}>
              <Text style={[styles.tabIconText, screen === tab.key && styles.tabIconTextActive]}>{tab.icon}</Text>
            </View>
            <Text style={[styles.tabText, screen === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
