import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { apiFetch } from '../../api';
import { Button, Card, EmptyState, Loader, Screen, styles } from '../../components/ui';

export default function CareerPathManagementScreen({ setScreen, goBack }) {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/career-paths')
      .then((data) => setPaths(Array.isArray(data) ? data : []))
      .catch((e) => Alert.alert('Could not load careers', e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <Screen title="Career Path Management" subtitle="Explore IT undergraduate career paths and the skills required for each path." onBack={goBack}>
      {paths.length === 0 ? <EmptyState title="No careers found" message="The backend did not return career paths." /> : paths.map((path) => (
        <Card key={path.id || path._id} style={styles.careerCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.careerIcon}><Text style={styles.careerIconText}>{path.title.slice(0, 1)}</Text></View>
            <View style={styles.flex}>
              <Text style={styles.sectionTitle}>{path.title}</Text>
              <Text style={styles.body}>{path.description}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}><Text style={styles.metaLabel}>Salary</Text><Text style={styles.metaValue}>{path.salaryRange}</Text></View>
            <View style={styles.metaPill}><Text style={styles.metaLabel}>Growth</Text><Text style={styles.metaValue}>{path.growthRate}</Text></View>
          </View>
          <Text style={styles.muted}>Required skills: {path.requiredSkills?.map((skill) => skill.name).join(', ')}</Text>
          <Button title="Analyze My Gap" variant="secondary" onPress={() => setScreen('gap')} />
        </Card>
      ))}
    </Screen>
  );
}