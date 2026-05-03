import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { apiFetch } from '../../api';
import { Button, Card, Chip, EmptyState, Loader, Metric, Screen, styles } from '../../components/ui';

const sections = [
  { key: 'settings', label: 'Settings' },
  { key: 'questions', label: 'Questions' },
  { key: 'careers', label: 'Careers' },
  { key: 'resources', label: 'Resources' },
  { key: 'users', label: 'Users' },
  { key: 'assessments', label: 'Assessments' },
];

const questionBlank = { category: '', skill: '', type: 'technical', text: '', weight: '1' };
const careerBlank = { title: '', description: '', salaryRange: '', growthRate: '', targetAudience: '', requiredSkillsText: '' };
const resourceBlank = { skill: '', title: '', provider: '', type: 'course', duration: '', rating: '0', isPaid: false, url: '' };

function idOf(item) {
  return item?.id || item?._id;
}

function parseRequiredSkills(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, level = '3'] = line.split(':').map((part) => part.trim());
      return { name, level: Math.max(0, Math.min(4, Number(level) || 0)) };
    })
    .filter((skill) => skill.name);
}

function formatRequiredSkills(skills = []) {
  return skills.map((skill) => `${skill.name}:${skill.level}`).join('\n');
}

export default function AdminDashboardScreen() {
  const [active, setActive] = useState('settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(null);
  const [settings, setSettings] = useState({ appName: '', audience: '', heroTitle: '', heroText: '' });
  const [questions, setQuestions] = useState([]);
  const [careers, setCareers] = useState([]);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [questionForm, setQuestionForm] = useState(questionBlank);
  const [careerForm, setCareerForm] = useState(careerBlank);
  const [resourceForm, setResourceForm] = useState(resourceBlank);
  const [editing, setEditing] = useState({ questions: null, careers: null, resources: null });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, settingsData, questionData, careerData, resourceData, userData, assessmentData] = await Promise.all([
        apiFetch('/api/admin/summary'),
        apiFetch('/api/admin/settings'),
        apiFetch('/api/skill-questions'),
        apiFetch('/api/career-paths'),
        apiFetch('/api/resources'),
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/assessments'),
      ]);

      setSummary(summaryData);
      setSettings(settingsData);
      setQuestions(Array.isArray(questionData) ? questionData : []);
      setCareers(Array.isArray(careerData) ? careerData : []);
      setResources(Array.isArray(resourceData) ? resourceData : []);
      setUsers(Array.isArray(userData) ? userData : []);
      setAssessments(Array.isArray(assessmentData) ? assessmentData : []);
    } catch (error) {
      Alert.alert('Admin data failed', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const totals = useMemo(() => summary || {
    students: users.filter((user) => user.role === 'student').length,
    skillQuestions: questions.length,
    careerPaths: careers.length,
    learningResources: resources.length,
  }, [careers.length, questions.length, resources.length, summary, users]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      setSettings(await apiFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }));
      await loadAll();
      Alert.alert('Settings saved', 'Student dashboard messaging has been updated.');
    } catch (error) {
      Alert.alert('Save failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveQuestion = async () => {
    if (!questionForm.category || !questionForm.skill || !questionForm.text) {
      Alert.alert('Missing question details', 'Category, skill, and question text are required.');
      return;
    }

    setSaving(true);
    try {
      const id = editing.questions;
      await apiFetch(id ? `/api/skill-questions/${id}` : '/api/skill-questions', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...questionForm, weight: Number(questionForm.weight) || 1 }),
      });
      setQuestionForm(questionBlank);
      setEditing((value) => ({ ...value, questions: null }));
      await loadAll();
    } catch (error) {
      Alert.alert('Question save failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveCareer = async () => {
    if (!careerForm.title || !careerForm.description) {
      Alert.alert('Missing career details', 'Title and description are required.');
      return;
    }

    setSaving(true);
    try {
      const id = editing.careers;
      await apiFetch(id ? `/api/career-paths/${id}` : '/api/career-paths', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({
          title: careerForm.title,
          description: careerForm.description,
          salaryRange: careerForm.salaryRange,
          growthRate: careerForm.growthRate,
          targetAudience: careerForm.targetAudience || settings.audience,
          requiredSkills: parseRequiredSkills(careerForm.requiredSkillsText),
        }),
      });
      setCareerForm(careerBlank);
      setEditing((value) => ({ ...value, careers: null }));
      await loadAll();
    } catch (error) {
      Alert.alert('Career save failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveResource = async () => {
    if (!resourceForm.skill || !resourceForm.title || !resourceForm.provider || !resourceForm.url) {
      Alert.alert('Missing resource details', 'Skill, title, provider, and URL are required.');
      return;
    }

    setSaving(true);
    try {
      const id = editing.resources;
      await apiFetch(id ? `/api/learning-resources/${id}` : '/api/learning-resources', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...resourceForm, rating: Number(resourceForm.rating) || 0 }),
      });
      setResourceForm(resourceBlank);
      setEditing((value) => ({ ...value, resources: null }));
      await loadAll();
    } catch (error) {
      Alert.alert('Resource save failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = (title, endpoint) => {
    Alert.alert(`Delete ${title}?`, 'This removes it from the in-memory system.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiFetch(endpoint, { method: 'DELETE' });
            await loadAll();
          } catch (error) {
            Alert.alert('Delete failed', error.message);
          }
        },
      },
    ]);
  };

  const updateUser = async (user, changes) => {
    try {
      await apiFetch(`/api/admin/users/${idOf(user)}`, { method: 'PUT', body: JSON.stringify(changes) });
      await loadAll();
    } catch (error) {
      Alert.alert('User update failed', error.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <Screen title="Admin Dashboard" subtitle="Manage the content and records that power every student screen.">
      <View style={styles.metricGrid}>
        <Metric label="Students" value={totals.students || 0} tone="green" />
        <Metric label="Questions" value={totals.skillQuestions || 0} />
        <Metric label="Careers" value={totals.careerPaths || 0} tone="orange" />
        <Metric label="Resources" value={totals.learningResources || 0} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {sections.map((section) => (
          <Chip key={section.key} label={section.label} active={active === section.key} onPress={() => setActive(section.key)} />
        ))}
      </ScrollView>

      {active === 'settings' && (
        <Card>
          <Text style={styles.sectionTitle}>Student App Settings</Text>
          <TextInput style={styles.input} placeholder="App name" placeholderTextColor="#94a3b8" value={settings.appName} onChangeText={(value) => setSettings({ ...settings, appName: value })} />
          <TextInput style={styles.input} placeholder="Audience" placeholderTextColor="#94a3b8" value={settings.audience} onChangeText={(value) => setSettings({ ...settings, audience: value })} />
          <TextInput style={styles.input} placeholder="Dashboard hero title" placeholderTextColor="#94a3b8" value={settings.heroTitle} onChangeText={(value) => setSettings({ ...settings, heroTitle: value })} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="Dashboard hero text" placeholderTextColor="#94a3b8" multiline value={settings.heroText} onChangeText={(value) => setSettings({ ...settings, heroText: value })} />
          <Button title={saving ? 'Saving...' : 'Save Settings'} disabled={saving} onPress={saveSettings} />
        </Card>
      )}

      {active === 'questions' && (
        <>
          <Card>
            <Text style={styles.sectionTitle}>{editing.questions ? 'Edit Question' : 'Add Question'}</Text>
            <TextInput style={styles.input} placeholder="Category" placeholderTextColor="#94a3b8" value={questionForm.category} onChangeText={(value) => setQuestionForm({ ...questionForm, category: value })} />
            <TextInput style={styles.input} placeholder="Skill" placeholderTextColor="#94a3b8" value={questionForm.skill} onChangeText={(value) => setQuestionForm({ ...questionForm, skill: value })} />
            <TextInput style={styles.input} placeholder="Type: technical / soft" placeholderTextColor="#94a3b8" value={questionForm.type} onChangeText={(value) => setQuestionForm({ ...questionForm, type: value })} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Question text" placeholderTextColor="#94a3b8" multiline value={questionForm.text} onChangeText={(value) => setQuestionForm({ ...questionForm, text: value })} />
            <TextInput style={styles.input} placeholder="Weight" placeholderTextColor="#94a3b8" keyboardType="decimal-pad" value={String(questionForm.weight)} onChangeText={(value) => setQuestionForm({ ...questionForm, weight: value })} />
            <View style={styles.buttonRow}>
              <Button title={saving ? 'Saving...' : editing.questions ? 'Update' : 'Add'} disabled={saving} onPress={saveQuestion} style={styles.rowButton} />
              <Button title="Clear" variant="secondary" onPress={() => { setQuestionForm(questionBlank); setEditing((value) => ({ ...value, questions: null })); }} style={styles.rowButton} />
            </View>
          </Card>
          {questions.length === 0 ? <EmptyState title="No questions" message="Add questions to enable student assessments." /> : questions.map((question) => (
            <Card key={idOf(question)}>
              <Text style={styles.sectionTitle}>{question.category}</Text>
              <Text style={styles.body}>{question.text}</Text>
              <Text style={styles.muted}>{question.skill} | {question.type} | Weight {question.weight}</Text>
              <View style={styles.buttonRow}>
                <Button title="Edit" variant="secondary" onPress={() => { setQuestionForm({ category: question.category, skill: question.skill, type: question.type, text: question.text, weight: String(question.weight) }); setEditing((value) => ({ ...value, questions: idOf(question) })); }} style={styles.rowButton} />
                <Button title="Delete" variant="secondary" onPress={() => deleteItem('question', `/api/skill-questions/${idOf(question)}`)} style={styles.rowButton} />
              </View>
            </Card>
          ))}
        </>
      )}

      {active === 'careers' && (
        <>
          <Card>
            <Text style={styles.sectionTitle}>{editing.careers ? 'Edit Career Path' : 'Add Career Path'}</Text>
            <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#94a3b8" value={careerForm.title} onChangeText={(value) => setCareerForm({ ...careerForm, title: value })} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" placeholderTextColor="#94a3b8" multiline value={careerForm.description} onChangeText={(value) => setCareerForm({ ...careerForm, description: value })} />
            <TextInput style={styles.input} placeholder="Salary range" placeholderTextColor="#94a3b8" value={careerForm.salaryRange} onChangeText={(value) => setCareerForm({ ...careerForm, salaryRange: value })} />
            <TextInput style={styles.input} placeholder="Growth rate" placeholderTextColor="#94a3b8" value={careerForm.growthRate} onChangeText={(value) => setCareerForm({ ...careerForm, growthRate: value })} />
            <TextInput style={styles.input} placeholder="Target audience" placeholderTextColor="#94a3b8" value={careerForm.targetAudience} onChangeText={(value) => setCareerForm({ ...careerForm, targetAudience: value })} />
            <TextInput style={[styles.input, styles.textArea]} placeholder={'Required skills, one per line: JavaScript:4'} placeholderTextColor="#94a3b8" multiline value={careerForm.requiredSkillsText} onChangeText={(value) => setCareerForm({ ...careerForm, requiredSkillsText: value })} />
            <View style={styles.buttonRow}>
              <Button title={saving ? 'Saving...' : editing.careers ? 'Update' : 'Add'} disabled={saving} onPress={saveCareer} style={styles.rowButton} />
              <Button title="Clear" variant="secondary" onPress={() => { setCareerForm(careerBlank); setEditing((value) => ({ ...value, careers: null })); }} style={styles.rowButton} />
            </View>
          </Card>
          {careers.length === 0 ? <EmptyState title="No career paths" message="Add career paths so students can compare their skills." /> : careers.map((career) => (
            <Card key={idOf(career)}>
              <Text style={styles.sectionTitle}>{career.title}</Text>
              <Text style={styles.body}>{career.description}</Text>
              <Text style={styles.muted}>Skills: {career.requiredSkills?.map((skill) => `${skill.name} ${skill.level}`).join(', ') || 'None'}</Text>
              <View style={styles.buttonRow}>
                <Button title="Edit" variant="secondary" onPress={() => { setCareerForm({ title: career.title, description: career.description, salaryRange: career.salaryRange, growthRate: career.growthRate, targetAudience: career.targetAudience, requiredSkillsText: formatRequiredSkills(career.requiredSkills) }); setEditing((value) => ({ ...value, careers: idOf(career) })); }} style={styles.rowButton} />
                <Button title="Delete" variant="secondary" onPress={() => deleteItem('career path', `/api/career-paths/${idOf(career)}`)} style={styles.rowButton} />
              </View>
            </Card>
          ))}
        </>
      )}

      {active === 'resources' && (
        <>
          <Card>
            <Text style={styles.sectionTitle}>{editing.resources ? 'Edit Learning Resource' : 'Add Learning Resource'}</Text>
            <TextInput style={styles.input} placeholder="Skill" placeholderTextColor="#94a3b8" value={resourceForm.skill} onChangeText={(value) => setResourceForm({ ...resourceForm, skill: value })} />
            <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#94a3b8" value={resourceForm.title} onChangeText={(value) => setResourceForm({ ...resourceForm, title: value })} />
            <TextInput style={styles.input} placeholder="Provider" placeholderTextColor="#94a3b8" value={resourceForm.provider} onChangeText={(value) => setResourceForm({ ...resourceForm, provider: value })} />
            <TextInput style={styles.input} placeholder="Type: course / certificate / video" placeholderTextColor="#94a3b8" value={resourceForm.type} onChangeText={(value) => setResourceForm({ ...resourceForm, type: value })} />
            <TextInput style={styles.input} placeholder="Duration" placeholderTextColor="#94a3b8" value={resourceForm.duration} onChangeText={(value) => setResourceForm({ ...resourceForm, duration: value })} />
            <TextInput style={styles.input} placeholder="Rating" placeholderTextColor="#94a3b8" keyboardType="decimal-pad" value={String(resourceForm.rating)} onChangeText={(value) => setResourceForm({ ...resourceForm, rating: value })} />
            <TextInput style={styles.input} placeholder="URL" placeholderTextColor="#94a3b8" autoCapitalize="none" value={resourceForm.url} onChangeText={(value) => setResourceForm({ ...resourceForm, url: value })} />
            <Button title={resourceForm.isPaid ? 'Paid Resource' : 'Free Resource'} variant="secondary" onPress={() => setResourceForm({ ...resourceForm, isPaid: !resourceForm.isPaid })} />
            <View style={styles.buttonRow}>
              <Button title={saving ? 'Saving...' : editing.resources ? 'Update' : 'Add'} disabled={saving} onPress={saveResource} style={styles.rowButton} />
              <Button title="Clear" variant="secondary" onPress={() => { setResourceForm(resourceBlank); setEditing((value) => ({ ...value, resources: null })); }} style={styles.rowButton} />
            </View>
          </Card>
          {resources.length === 0 ? <EmptyState title="No resources" message="Add resources so recommendations can appear after assessments." /> : resources.map((resource) => (
            <Card key={idOf(resource)}>
              <Text style={styles.sectionTitle}>{resource.title}</Text>
              <Text style={styles.body}>{resource.provider} | {resource.skill}</Text>
              <Text style={styles.muted}>{resource.type} | {resource.duration} | Rating {resource.rating} | {resource.isPaid ? 'Paid' : 'Free'}</Text>
              <View style={styles.buttonRow}>
                <Button title="Edit" variant="secondary" onPress={() => { setResourceForm({ skill: resource.skill, title: resource.title, provider: resource.provider, type: resource.type, duration: resource.duration, rating: String(resource.rating), isPaid: !!resource.isPaid, url: resource.url }); setEditing((value) => ({ ...value, resources: idOf(resource) })); }} style={styles.rowButton} />
                <Button title="Delete" variant="secondary" onPress={() => deleteItem('resource', `/api/learning-resources/${idOf(resource)}`)} style={styles.rowButton} />
              </View>
            </Card>
          ))}
        </>
      )}

      {active === 'users' && (
        <>
          {users.length === 0 ? <EmptyState title="No users" message="Registered students and admins will appear here." /> : users.map((user) => (
            <Card key={idOf(user)}>
              <Text style={styles.sectionTitle}>{user.name}</Text>
              <Text style={styles.body}>{user.email}</Text>
              <Text style={styles.muted}>Role: {user.role} | Target career: {user.targetCareerId || 'Not selected'}</Text>
              <View style={styles.buttonRow}>
                <Button title={user.role === 'admin' ? 'Make Student' : 'Make Admin'} variant="secondary" onPress={() => updateUser(user, { role: user.role === 'admin' ? 'student' : 'admin' })} style={styles.rowButton} />
                <Button title="Delete" variant="secondary" onPress={() => deleteItem('user', `/api/admin/users/${idOf(user)}`)} style={styles.rowButton} />
              </View>
            </Card>
          ))}
        </>
      )}

      {active === 'assessments' && (
        <>
          {assessments.length === 0 ? <EmptyState title="No assessments" message="Student submissions will appear here after assessments are completed." /> : assessments.map((assessment) => (
            <Card key={idOf(assessment)}>
              <Text style={styles.sectionTitle}>{assessment.user?.name || 'Deleted user'}</Text>
              <Text style={styles.body}>{assessment.careerTitle}</Text>
              <Text style={styles.muted}>{new Date(assessment.createdAt).toLocaleString()}</Text>
              <Text style={styles.muted}>Scores: {Object.entries(assessment.scores || {}).map(([name, score]) => `${name} ${score}`).join(', ') || 'None'}</Text>
              <Button title="Delete Assessment" variant="secondary" onPress={() => deleteItem('assessment', `/api/admin/assessments/${idOf(assessment)}`)} />
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
