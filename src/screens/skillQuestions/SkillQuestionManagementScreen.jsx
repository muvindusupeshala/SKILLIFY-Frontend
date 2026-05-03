import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { apiFetch } from '../../api';
import { Card, EmptyState, Loader, Screen, styles } from '../../components/ui';

export default function SkillQuestionManagementScreen({ goBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/skill-questions')
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch((e) => Alert.alert('Could not load questions', e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <Screen title="Skill Question Management" subtitle="System-generated questions focused on IT undergraduate technical and soft skills." onBack={goBack}>
      {questions.length === 0 ? <EmptyState title="No questions" message="No skill questions are available." /> : questions.map((question) => (
        <Card key={question.id || question._id}>
          <View style={styles.statusDotRow}>
            <Text style={styles.sectionTitle}>{question.category}</Text>
            <Text style={styles.resourceType}>{String(question.type || 'skill').toUpperCase()}</Text>
          </View>
          <Text style={styles.body}>{question.text}</Text>
          <Text style={styles.muted}>Skill: {question.skill}</Text>
          <Text style={styles.muted}>Weight: {question.weight}</Text>
        </Card>
      ))}
    </Screen>
  );
}