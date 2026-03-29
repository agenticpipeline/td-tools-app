import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';
import GlowButton from '../../components/GlowButton';
import DeptBadge from '../../components/DeptBadge';
import { Equipment, Department, PipelineStep } from '../../types';

interface InterviewScreenProps {
  equipment: Equipment[];
  notes: string | undefined;
  onNotesUpdate: (notes: string) => void;
  onNavigate: (step: PipelineStep) => void;
}

const QUESTION_GROUPS = [
  {
    title: 'Timeline',
    questions: [
      'How many days until the event?',
      'How many hours per day can crews work?',
      'Are there building/venue access restrictions?',
    ],
  },
  {
    title: 'Logistics',
    questions: [
      'Is there loading dock access?',
      'Are there weight restrictions?',
      'Do you need forklift or heavy equipment?',
    ],
  },
  {
    title: 'Safety & Compliance',
    questions: [
      'Are OSHA regulations required?',
      'Do you have certified riggers available?',
      'Are there insurance/liability requirements?',
    ],
  },
  {
    title: 'Special Considerations',
    questions: [
      'Are there union requirements?',
      'Do you need specific skill certifications?',
      'Are there noise or working hour restrictions?',
    ],
  },
];

export default function InterviewScreen({
  equipment,
  notes,
  onNotesUpdate,
  onNavigate,
}: InterviewScreenProps) {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const departments = Array.from(
    new Set(equipment.map((e) => e.department))
  ) as Department[];

  const totalQty = equipment.reduce((sum, e) => sum + e.quantity, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Step 4: Interview & Context</Text>
          <Text style={styles.description}>
            Provide context to refine crew estimates
          </Text>
        </View>

        {/* Equipment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Summary</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items:</Text>
              <Text style={styles.summaryValue}>{equipment.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Units:</Text>
              <Text style={styles.summaryValue}>{totalQty}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Departments:</Text>
              <View style={styles.deptBadges}>
                {departments.map((dept) => (
                  <DeptBadge key={dept} department={dept} size="sm" />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Interview Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interview Questions</Text>
          {QUESTION_GROUPS.map((group, groupIndex) => (
            <View key={group.title} style={styles.questionGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.questions.map((question, qIndex) => (
                <TouchableOpacity
                  key={`${groupIndex}-${qIndex}`}
                  style={styles.questionItem}
                  onPress={() => setSelectedNote(question)}
                  activeOpacity={0.7}
                >
                  <View style={styles.questionNumber}>
                    <Text style={styles.questionNumberText}>
                      {groupIndex * group.questions.length + qIndex + 1}
                    </Text>
                  </View>
                  <Text style={styles.questionText}>{question}</Text>
                  <Text style={styles.questionArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Notes Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <Text style={styles.notesHint}>
            Record answers to interview questions, constraints, or any other
            important context
          </Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={8}
            placeholder="Enter notes here..."
            placeholderTextColor={theme.colors.textTertiary}
            value={notes || ''}
            onChangeText={onNotesUpdate}
          />
        </View>

        {/* Common Notes Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Templates</Text>
          <View style={styles.templateButtons}>
            {[
              '5 days to event, 8 hours per day available',
              'All rigging required - certified riggers needed',
              'OSHA regulations apply - forklift access required',
              'Union crew required - overtime after 10 hours',
            ].map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateButton}
                onPress={() => onNotesUpdate((notes || '') + '\n' + template)}
              >
                <Text style={styles.templateText}>{template}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          <GlowButton
            title="← Validate"
            variant="secondary"
            fullWidth
            onPress={() => onNavigate('validate')}
          />
          <GlowButton
            title="Estimate →"
            variant="primary"
            fullWidth
            onPress={() => onNavigate('estimate')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
  },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[2],
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  section: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryBox: {
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
  },
  deptBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[1],
    justifyContent: 'flex-end',
  },
  questionGroup: {
    marginVertical: theme.spacing[3],
  },
  groupTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[2],
    paddingBottom: theme.spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    marginVertical: theme.spacing[1],
  },
  questionNumber: {
    width: theme.spacing[6],
    height: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[2],
  },
  questionNumberText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    fontFamily: theme.typography.families.monospace,
  },
  questionText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.families.monospace,
  },
  questionArrow: {
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing[2],
  },
  notesHint: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[2],
  },
  notesInput: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.families.monospace,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  templateButtons: {
    gap: theme.spacing[2],
  },
  templateButton: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  templateText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDim,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  actions: {
    gap: theme.spacing[2],
  },
});
