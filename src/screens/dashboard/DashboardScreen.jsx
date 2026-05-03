import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Screen, styles } from '../../components/ui';

export default function DashboardScreen({ user, setScreen, settings }) {
  const actions = [
    ['Take Assessment', 'Evaluate your current skill level', 'assessments', '#dbeafe'],
    ['Skill Questions', 'View generated IT skill questions', 'skillQuestions', '#fef3c7'],
    ['Career Paths', 'Explore IT role expectations', 'careers', '#dcfce7'],
    ['Skill Gaps', 'Compare yourself to a target role', 'gap', '#ffedd5'],
    ['Learning Resources', 'Find courses for weak skills', 'resources', '#f1f5f9'],
    ['Progress Analytics', 'Track completed resources', 'progress', '#e0e7ff'],
  ];

  return (
    <Screen title={`Welcome, ${user?.name?.split(' ')[0] || 'Student'}`} subtitle={`Complete your skill assessment, choose a career path, close the gaps, and track your growth${settings?.audience ? ` as ${settings.audience}` : ''}.`}>
      <Card style={styles.heroCard}>
        <Text style={styles.kicker}>{String(settings?.audience || 'CAREER PATHWAY').toUpperCase()}</Text>
        <Text style={styles.heroTitle}>{settings?.heroTitle || 'Start with your skill assessment'}</Text>
        <Text style={styles.heroText}>{settings?.heroText || 'Complete your assessment, compare against a career path, and use resources assigned by your admin.'}</Text>
        <Button title="Start Assessment" onPress={() => setScreen('assessments')} />
      </Card>

      <View style={styles.grid}>
        {actions.map(([title, description, target, color]) => (
          <Pressable key={title} onPress={() => setScreen(target)} style={({ pressed }) => [styles.actionCard, { backgroundColor: color }, pressed && styles.pressed]}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.muted}>{description}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
