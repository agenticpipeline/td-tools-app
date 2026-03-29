import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { theme } from '../../theme';
import GlowButton from '../../components/GlowButton';
import DeptBadge from '../../components/DeptBadge';
import { Equipment, PipelineStep } from '../../types';
import { generateEstimate } from '../../services/estimationEngine';

interface ReportScreenProps {
  equipment: Equipment[];
  projectId: string;
  projectName: string;
  onNavigate: (step: PipelineStep) => void;
}

export default function ReportScreen({
  equipment,
  projectId,
  projectName,
  onNavigate,
}: ReportScreenProps) {
  const estimate = useMemo(() => {
    return generateEstimate(projectId, equipment, 8, 5);
  }, [equipment, projectId]);

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    const report = {
      projectId,
      projectName,
      generatedAt: new Date().toISOString(),
      summary: {
        totalCrew: estimate.totalCrew,
        totalInstallHours: estimate.totalInstallHours,
        totalDismantleHours: estimate.totalDismantleHours,
        totalCost: estimate.totalCost,
        feasible: estimate.feasible,
      },
      departments: estimate.departmentEstimates,
      equipment: equipment.map((e) => ({
        name: e.name,
        department: e.department,
        quantity: e.quantity,
        complexity: e.complexity,
        weight: e.baseWeight,
      })),
    };

    Alert.alert(
      `Export as ${format.toUpperCase()}`,
      `Report would be exported as ${format.toUpperCase()} format`,
      [{ text: 'OK' }]
    );
  };

  const handlePrint = () => {
    Alert.alert('Print Report', 'Report would be sent to printer', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Print', onPress: () => {} },
    ]);
  };

  const handleSave = () => {
    Alert.alert(
      'Save Project',
      'Project estimate has been saved to your account',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Step 6: Report</Text>
          <Text style={styles.projectName}>{projectName}</Text>
          <Text style={styles.generatedDate}>
            Generated {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Crew Required:</Text>
              <Text style={styles.summaryHighlight}>
                {estimate.totalCrew} people
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Installation Time:</Text>
              <Text style={styles.summaryHighlight}>
                {estimate.totalInstallHours.toFixed(1)} hours
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Dismantle Time:</Text>
              <Text style={styles.summaryHighlight}>
                {estimate.totalDismantleHours.toFixed(1)} hours
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Budget:</Text>
              <Text style={[styles.summaryHighlight, { color: theme.colors.success }]}>
                ${estimate.totalCost.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Department Summary Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Breakdown</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.deptColumn]}>Dept</Text>
              <Text style={[styles.tableCell, styles.numberColumn]}>Items</Text>
              <Text style={[styles.tableCell, styles.numberColumn]}>Crew</Text>
              <Text style={[styles.tableCell, styles.numberColumn]}>Hours</Text>
              <Text style={[styles.tableCell, styles.costColumn]}>Cost</Text>
            </View>

            {/* Rows */}
            {estimate.departmentEstimates.map((dept, index) => (
              <View
                key={dept.department}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? {} : { backgroundColor: theme.colors.surfaceSecondary },
                ]}
              >
                <View style={[styles.tableCell, styles.deptColumn]}>
                  <DeptBadge department={dept.department} size="sm" />
                </View>
                <Text style={[styles.tableCell, styles.numberColumn]}>
                  {dept.totalItems}
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn]}>
                  {dept.adjustedCrew}
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn]}>
                  {(dept.installHours + dept.dismantleHours).toFixed(1)}
                </Text>
                <Text style={[styles.tableCell, styles.costColumn]}>
                  ${dept.totalCost.toLocaleString()}
                </Text>
              </View>
            ))}

            {/* Footer */}
            <View style={styles.tableFooter}>
              <Text style={[styles.tableCell, styles.deptColumn]}>TOTAL</Text>
              <Text style={[styles.tableCell, styles.numberColumn]}>
                {equipment.length}
              </Text>
              <Text style={[styles.tableCell, styles.numberColumn]}>
                {estimate.totalCrew}
              </Text>
              <Text style={[styles.tableCell, styles.numberColumn]}>
                {(estimate.totalInstallHours + estimate.totalDismantleHours).toFixed(1)}
              </Text>
              <Text style={[styles.tableCell, styles.costColumn]}>
                ${estimate.totalCost.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Risk Assessment */}
        {estimate.departmentEstimates.some((d) => d.riskFlags.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Assessment</Text>
            {estimate.departmentEstimates
              .filter((d) => d.riskFlags.length > 0)
              .map((dept) => (
                <View key={dept.department} style={styles.riskCard}>
                  <DeptBadge department={dept.department} size="sm" />
                  <View style={styles.riskItems}>
                    {dept.riskFlags.map((flag, index) => (
                      <View key={index} style={styles.riskItem}>
                        <Text style={styles.riskIcon}>⚠</Text>
                        <Text style={styles.riskLabel}>{flag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Feasibility & Constraints */}
        {estimate.constraints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule Feasibility</Text>
            <View
              style={[
                styles.constraintCard,
                {
                  borderLeftColor: estimate.feasible
                    ? theme.colors.success
                    : theme.colors.warning,
                },
              ]}
            >
              <Text
                style={[
                  styles.constraintStatus,
                  {
                    color: estimate.feasible
                      ? theme.colors.success
                      : theme.colors.warning,
                  },
                ]}
              >
                {estimate.feasible ? '✓ FEASIBLE' : '⚠ REVIEW REQUIRED'}
              </Text>
              <View style={styles.constraintList}>
                {estimate.constraints.map((constraint, index) => (
                  <Text key={index} style={styles.constraintItem}>
                    • {constraint}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Safety Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Notes</Text>
          <View style={styles.safetyBox}>
            {estimate.departmentEstimates.some((d) =>
              d.notes.some((n) => n.includes('OSHA'))
            ) && (
              <View style={styles.safetyItem}>
                <Text style={styles.safetyIcon}>⚖</Text>
                <Text style={styles.safetyText}>
                  OSHA regulations apply for heavy equipment handling
                </Text>
              </View>
            )}

            {estimate.departmentEstimates.some((d) =>
              d.notes.some((n) => n.includes('rigging'))
            ) && (
              <View style={styles.safetyItem}>
                <Text style={styles.safetyIcon}>🪝</Text>
                <Text style={styles.safetyText}>
                  Certified riggers required for rigged equipment
                </Text>
              </View>
            )}

            {estimate.totalInstallHours > 16 && (
              <View style={styles.safetyItem}>
                <Text style={styles.safetyIcon}>⏱</Text>
                <Text style={styles.safetyText}>
                  Consider fatigue management for extended installations
                </Text>
              </View>
            )}

            <View style={styles.safetyItem}>
              <Text style={styles.safetyIcon}>✓</Text>
              <Text style={styles.safetyText}>
                All crew should have safety training and PPE
              </Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export & Share</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExport('pdf')}
            >
              <Text style={styles.exportIcon}>📄</Text>
              <Text style={styles.exportText}>PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExport('csv')}
            >
              <Text style={styles.exportIcon}>📊</Text>
              <Text style={styles.exportText}>CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExport('json')}
            >
              <Text style={styles.exportIcon}>{ }</Text>
              <Text style={styles.exportText}>JSON</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportButton}
              onPress={handlePrint}
            >
              <Text style={styles.exportIcon}>🖨</Text>
              <Text style={styles.exportText}>Print</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          <GlowButton
            title="← Estimate"
            variant="secondary"
            fullWidth
            onPress={() => onNavigate('estimate')}
          />
          <GlowButton
            title="✓ Save Project"
            variant="success"
            fullWidth
            onPress={handleSave}
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
  },
  projectName: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    marginTop: theme.spacing[1],
  },
  generatedDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    marginTop: theme.spacing[1],
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
  summaryCard: {
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[1],
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  summaryHighlight: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
  },
  table: {
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSecondary,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  tableCell: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.families.monospace,
    color: theme.colors.text,
  },
  deptColumn: {
    flex: 1,
  },
  numberColumn: {
    width: 40,
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
  costColumn: {
    width: 80,
    textAlign: 'right',
    color: theme.colors.success,
    fontWeight: theme.typography.weights.bold,
  },
  riskCard: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    borderTopRightRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    marginVertical: theme.spacing[2],
    gap: theme.spacing[2],
  },
  riskItems: {
    gap: theme.spacing[1],
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  riskIcon: {
    fontSize: theme.typography.sizes.base,
  },
  riskLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.warning,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.bold,
  },
  constraintCard: {
    backgroundColor: theme.colors.surfacePrimary,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    borderTopRightRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    gap: theme.spacing[2],
  },
  constraintStatus: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    fontFamily: theme.typography.families.monospace,
  },
  constraintList: {
    gap: theme.spacing[1],
  },
  constraintItem: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  safetyBox: {
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    gap: theme.spacing[2],
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  safetyIcon: {
    fontSize: theme.typography.sizes.lg,
  },
  safetyText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  exportButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    justifyContent: 'space-between',
  },
  exportButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  exportIcon: {
    fontSize: theme.typography.sizes['2xl'],
  },
  exportText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.bold,
  },
  footer: {
    height: theme.spacing[6],
  },
  actions: {
    gap: theme.spacing[2],
  },
});
