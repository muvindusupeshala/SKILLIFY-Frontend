import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { apiFetch } from '../../api';
import { levels } from '../../constants/app';
import { Card, Loader, Metric, ProgressBar, Screen, styles } from '../../components/ui';

export default function ProgressAnalyticsScreen({ goBack }) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch('/api/progress/stats'), apiFetch('/api/assessments/history')])
      .then(([statsData, historyData]) => {
        setStats(statsData);
        setHistory(Array.isArray(historyData) ? historyData : []);
      })
      .catch((e) => Alert.alert('Could not load progress', e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  const scores = history[0]?.scores || {};
  const programming = stats?.programming || 0;
  const data = stats?.data || 0;
  const infra = stats?.infra || 0;

  return (
    <Screen title="Progress Tracking & Analytics" subtitle="Track assessment scores, learning resource completion, and skill development by career goal." onBack={goBack}>
      <View style={styles.metricGrid}>
        <Metric label="Overall" value={`${stats?.overall || 0}%`} />
        <Metric label="Assessments" value={stats?.assessments || 0} tone="green" />
        <Metric label="Programming" value={`${programming}%`} tone="orange" />
        <Metric label="Infrastructure" value={`${infra}%`} />
        <Metric label="Completed" value={stats?.completedResources || 0} tone="green" />
        <Metric label="Tracked" value={stats?.trackedResources || 0} />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Focus Areas</Text>
        <Text style={styles.muted}>Data: {data}%</Text>
        <ProgressBar value={data} color="#0ea5e9" />
        <Text style={styles.muted}>Infrastructure: {infra}%</Text>
        <ProgressBar value={infra} color="#f97316" />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Latest Skill Scores</Text>
        {Object.keys(scores).length === 0 ? <Text style={styles.muted}>No assessment submitted yet.</Text> : Object.entries(scores).map(([name, score]) => (
          <View key={name} style={styles.skillRow}>
            <View style={styles.skillHeader}>
              <Text style={styles.bodyStrong}>{name}</Text>
              <Text style={styles.levelBadge}>{levels[score]}</Text>
            </View>
            <ProgressBar value={(score / 4) * 100} color={score >= 3 ? '#16a34a' : '#2563eb'} />
          </View>
        ))}
      </Card>
    </Screen>
  );
}