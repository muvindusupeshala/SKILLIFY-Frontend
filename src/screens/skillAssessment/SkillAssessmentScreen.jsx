import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { apiFetch } from '../../api';
import { levels } from '../../constants/app';
import { Button, Card, EmptyState, Loader, ProgressBar, Screen, styles } from '../../components/ui';

export default function SkillAssessmentScreen({ setScreen, goBack }) {
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [gpa, setGpa] = useState('');
  const [certifications, setCertifications] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/api/skill-questions')
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch((e) => Alert.alert('Could not load questions', e.message))
      .finally(() => setLoading(false));
  }, []);

  const question = questions[step];
  const isResultStep = step >= questions.length;
  const progress = questions.length ? ((step + 1) / (questions.length + 1)) * 100 : 0;

  const next = () => {
    if (question && answers[question.category] === undefined) {
      Alert.alert('Choose a level', 'Please rate this skill before moving forward.');
      return;
    }
    setStep((current) => Math.min(current + 1, questions.length));
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await apiFetch('/api/assessments/submit', {
        method: 'POST',
        body: JSON.stringify({ scores: answers, gpa, certifications }),
      });
      Alert.alert('Assessment submitted', 'Your result and gap analysis are ready.');
      setScreen('gap', { replace: true });
    } catch (error) {
      Alert.alert('Submit failed', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!questions.length) return <EmptyState title="No questions yet" message="The backend did not return assessment questions." action="Go Home" onAction={() => setScreen('dashboard')} />;

  return (
    <Screen title="Skill Assessment & Result" subtitle="Answer system-generated technical and soft-skill questions for IT undergraduate career guidance." onBack={step > 0 ? () => setStep((current) => Math.max(0, current - 1)) : goBack}>
      <View style={styles.progressHeader}>
        <Text style={styles.kicker}>STEP {Math.min(step + 1, questions.length + 1)} OF {questions.length + 1}</Text>
        <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
      </View>
      <ProgressBar value={progress} />

      <Card style={styles.assessmentCard}>
        {!isResultStep ? (
          <>
            <Text style={styles.sectionTitle}>{question.category}</Text>
            <Text style={styles.body}>{question.text}</Text>
            <Text style={styles.muted}>Question type: {question.type}</Text>
            <View style={styles.levelGrid}>
              {levels.map((label, index) => {
                const selected = answers[question.category] === index;
                return (
                  <Pressable key={label} onPress={() => setAnswers({ ...answers, [question.category]: index })} style={[styles.levelButton, selected && styles.levelSelected]}>
                    <Text style={[styles.levelText, selected && styles.levelSelectedText]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Assessment Result Details</Text>
            <Text style={styles.body}>Add optional academic context before generating your result and skill gap analysis.</Text>
            <TextInput style={styles.input} placeholder="GPA / CGPA" placeholderTextColor="#94a3b8" value={gpa} onChangeText={setGpa} keyboardType="decimal-pad" />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Certifications and extra qualifications" placeholderTextColor="#94a3b8" multiline value={certifications} onChangeText={setCertifications} />
          </>
        )}
      </Card>

      <View style={styles.buttonRow}>
        <Button title="Back" variant="secondary" disabled={step === 0 || submitting} onPress={() => setStep((current) => Math.max(0, current - 1))} style={styles.rowButton} />
        {!isResultStep ? <Button title="Next" onPress={next} style={styles.rowButton} /> : <Button title={submitting ? 'Submitting...' : 'Submit'} disabled={submitting} onPress={submit} style={styles.rowButton} />}
      </View>
    </Screen>
  );
}