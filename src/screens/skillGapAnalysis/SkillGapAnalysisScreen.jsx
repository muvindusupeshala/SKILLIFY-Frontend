import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { apiFetch } from '../../api';
import { levels } from '../../constants/app';
import { Button, Card, Chip, EmptyState, Loader, Metric, ProgressBar, Screen, styles } from '../../components/ui';

export default function SkillGapAnalysisScreen({ setScreen, goBack }) {
  const [paths, setPaths] = useState([]);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch('/api/career-paths'), apiFetch('/api/assessments/history')])
      .then(([pathData, historyData]) => {
        setPaths(Array.isArray(pathData) ? pathData : []);
        setHistory(Array.isArray(historyData) ? historyData : []);
      })
      .catch((e) => Alert.alert('Could not load gap analysis', e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  const latest = history[0];
  const career = paths[selected];

  if (!latest) return <EmptyState title="No Assessment Yet" message="Complete an assessment first to see your skill gaps." action="Start Assessment" onAction={() => setScreen('assessments')} />;
  if (!career) return <EmptyState title="No Career Paths" message="The backend did not return career path data." action="View Careers" onAction={() => setScreen('careers')} />;

  const gaps = career.requiredSkills.map((skill) => {
    const have = latest.scores[skill.name] || 0;
    return { ...skill, have, gap: Math.max(0, skill.level - have) };
  });
  const readiness = gaps.length ? Math.round((gaps.filter((item) => item.gap === 0).length / gaps.length) * 100) : 0;

  return (
    <Screen title="Skill Gap Analysis" subtitle="Compare your current skill level with your expected career path requirements." onBack={goBack}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {paths.map((path, index) => <Chip key={path.id || path._id} label={path.title} active={selected === index} onPress={() => setSelected(index)} />)}
      </ScrollView>

      <View style={styles.metricGridThree}>
        <Metric label="Readiness" value={`${readiness}%`} tone="green" style={styles.metricThreeCard} />
        <Metric label="Improve" value={gaps.filter((item) => item.gap > 0).length} tone="orange" style={styles.metricThreeCard} />
        <Metric label="Met" value={gaps.filter((item) => item.gap === 0).length} style={styles.metricThreeCard} />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>{career.title}</Text>
        {gaps.map((skill) => (
          <View key={skill.name} style={styles.skillRow}>
            <View style={styles.skillHeader}>
              <Text style={styles.bodyStrong}>{skill.name}</Text>
              <Text style={[styles.levelBadge, skill.gap === 0 && styles.metBadge]}>{skill.gap === 0 ? 'Met' : `Gap ${skill.gap}`}</Text>
            </View>
            <Text style={styles.muted}>Have {levels[skill.have]} | Need {levels[skill.level]}</Text>
            <ProgressBar value={(skill.have / skill.level) * 100} color={skill.gap === 0 ? '#16a34a' : '#f97316'} />
          </View>
        ))}
        <Button title="Get Learning Resources" onPress={() => setScreen('resources')} />
      </Card>
    </Screen>
  );
}