import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { apiFetch } from '../../api';
import { resourceFilters } from '../../constants/app';
import { Button, Card, Chip, EmptyState, Loader, ProgressBar, Screen, styles } from '../../components/ui';

export default function LearningResourceManagementScreen({ goBack }) {
  const [resources, setResources] = useState([]);
  const [resourceProgress, setResourceProgress] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch('/api/resources'), apiFetch('/api/progress/resources')])
      .then(([resourceData, progressData]) => {
        setResources(Array.isArray(resourceData) ? resourceData : []);
        setResourceProgress(Array.isArray(progressData) ? progressData : []);
      })
      .catch((e) => Alert.alert('Could not load resources', e.message))
      .finally(() => setLoading(false));
  }, []);

  const updateProgress = async (resource, status, percent) => {
    try {
      const id = resource.id || resource._id;
      const updated = await apiFetch(`/api/learning-resources/${id}/progress`, {
        method: 'PATCH',
        body: JSON.stringify({ status, percent }),
      });
      setResourceProgress((items) => {
        const existing = items.find((item) => item.resourceId === id);
        if (!existing) return [...items, updated];
        return items.map((item) => (item.resourceId === id ? updated : item));
      });
    } catch (error) {
      Alert.alert('Progress update failed', error.message);
    }
  };

  const getProgress = (resource) => resourceProgress.find((item) => item.resourceId === (resource.id || resource._id));
  const visible = filter === 'all' ? resources : resources.filter((item) => item.type === filter);

  if (loading) return <Loader />;

  return (
    <Screen title="Learning Resource Management" subtitle="Use recommended resources for lacking skills and mark them complete as you improve." onBack={goBack}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {resourceFilters.map((item) => <Chip key={item} label={item.toUpperCase()} active={filter === item} onPress={() => setFilter(item)} />)}
      </ScrollView>

      {visible.length === 0 ? <EmptyState title="No resources" message="Try another filter or complete an assessment for better recommendations." /> : visible.map((resource) => {
        const progress = getProgress(resource);
        return (
          <Card key={resource.id || resource._id} style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <View style={styles.providerBadge}><Text style={styles.providerText}>{resource.provider.slice(0, 1)}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.sectionTitle}>{resource.title}</Text>
                <Text style={styles.muted}>{resource.provider} | {resource.duration} | Rating {resource.rating}</Text>
              </View>
            </View>
            <Text style={styles.resourceType}>{resource.type.toUpperCase()} {resource.isPaid ? '| PAID' : '| FREE'} | {resource.skill}</Text>
            <View style={styles.resourceProgressRow}>
              <Text style={styles.muted}>Progress: {progress?.percent || 0}%</Text>
              <Text style={[styles.levelBadge, progress?.status === 'completed' && styles.metBadge]}>{(progress?.status || 'not-started').toUpperCase()}</Text>
            </View>
            <ProgressBar value={progress?.percent || 0} color={progress?.status === 'completed' ? '#16a34a' : '#2563eb'} />
            <Button title="Open Resource" variant="secondary" onPress={() => Linking.openURL(resource.url)} />
            <View style={styles.buttonRow}>
              <Button title="Start" variant="secondary" onPress={() => updateProgress(resource, 'in-progress', 25)} style={styles.rowButton} />
              <Button title="Complete" onPress={() => updateProgress(resource, 'completed', 100)} style={styles.rowButton} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}