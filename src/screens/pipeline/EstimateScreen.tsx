import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../theme';
import GlowButton from '../../components/GlowButton';
import ProgressBar from '../../components/ProgressBar';
import DeptBadge from '../../components/DeptBadge';
import { Equipment, Department, PipelineStep, Estimate } from '../../types';
import { generateEstimate, calculateSchedule } from '../../services/estimationEngine';

interface EstimateScreenProps {
  equipment: Equipment[];
  projectId: string;
  onNavigate: (step: PipelineStep) => void;
}

export default function EstimateScreen({
  equipment,
  projectId,
  onNavigate,
}: EstimateScreenProps) {
  const estimate = useMemo(() => {
    return generateEstimate(projectId, equipment, 8, 5);
  }, [equipment, projectId]);

  const schedule = useMemo(() => {
    return calculateSchedule(estimate);
  }, [estimate]);

  const [expandedDept, setExpandedDept] = useState<Department | null>(null);

  const animateValue = useSharedValue(0);

  const handleExpandDept = (dept: Department) => {
    setExpandedDept(expandedDept === dept ? null : dept);
    animateValue.value = withTiming(expandedDept === dept ? 0 : 1, {
      duration: theme.animations.duration.base,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animateValue.value,
    };
  });

  // Department breakdown
  const getDeptColor = (dept: Department) => {
    return theme.colors.dept[dept];
  };

  // Summary stats
  const totalCost = estimate.totalCost;
  const costPerPerson = Math.round(totalCost / estimate.totalCrew);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Step 5: Estimate</Text>
          <Text style={styles.description}>
            Calculated crew requirements and costs
          </Text>
        </View>

        {/* Feasibility Status */}
        <View style={styles.section}>
          <View
            style={[
              styles.feasibilityCard,
              {
                borderLeftColor: estimate.feasible
                  ? theme.colors.success
                  : theme.colors.warning,
              },
            ]}
          >
            <View style={styles.feasibilityContent}>
              <Text
                style={[
                  styles.feasibilityStatus,
                  {
                    color: estimate.feasible
                      ? theme.colors.success
                      : theme.colors.warning,
                  },
                ]}
              >
                {estimate.feasible ? '✓ FEASIBLE' : '⚠ REVIEW REQUIRED'}
              </Text>
              {estimate.constraints.length > 0 && (
                <View style={styles.constraintsList}>
                  {estimate.constraints.map((constraint, index) => (
                    <Text key={index} style={styles.constraintText}>
                      • {constraint}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{estimate.totalCrew}</Text>
              <Text style={styles.metricLabel}>Total Crew</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {estimate.totalInstallHours.toFixed(1)}h
              </Text>
              <Text style={styles.metricLabel}>Install Time</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {estimate.totalDismantleHours.toFixed(1)}h
              </Text>
              <Text style={styles.metricLabel}>Dismantle Time</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${costPerPerson}</Text>
              <Text style={styles.metricLabel}>Cost per Person</Text>
            </View>
          </View>
        </View>

        {/* Cost Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Summary</Text>
          <View style={styles.costBox}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Total Crew Cost:</Text>
              <Text style={styles.costValue}>
                ${totalCost.toLocaleString()}
              </Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Schedule:</Text>
              <Text style={styles.costValue}>
                {schedule.totalShifts} shifts
              </Text>
            </View>
          </View>
        </View>

        {/* Department Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Breakdown</Text>
          <FlatList
            data={estimate.departmentEstimates}
            keyExtractor={(item) => item.department}
            scrollEnabled={false}
            renderItem={({ item: dept }) => (
              <View key={dept.department}>
                <TouchableOpacity
                  style={styles.deptHeader}
                  onPress={() => handleExpandDept(dept.department)}
                  activeOpacity={0.7}
                >
                  <View style={styles.deptHeaderLeft}>
                    <View
                      style={[
                        styles.deptIndicator,
                        { backgroundColor: getDeptColor(dept.department) },
                      ]}
                    />
                    <View style={styles.deptInfo}>
                      <DeptBadge department={dept.department} size="sm" />
                      <Text style={styles.deptSubtext}>
                        {dept.totalItems} items • {dept.adjustedCrew} crew
                      </Text>
                    </View>
                  </View>
                  <View style={styles.deptCost}>
                    <Text style={styles.deptCostValue}>
                      ${dept.totalCost.toLocaleString()}
                    </Text>
                    <Text style={styles.deptArrow}>
                      {expandedDept === dept.department ? '▼' : '▶'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {expandedDept === dept.department && (
                  <Animated.View
                    style={[styles.deptDetails, animatedStyle]}
                  >
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Base Crew:</Text>
                      <Text style={styles.detailValue}>{dept.baseCrew}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Adjusted Crew:</Text>
                      <Text style={styles.detailValue}>
                        {dept.adjustedCrew}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Avg Complexity:</Text>
                      <Text style={styles.detailValue}>
                        {dept.avgComplexity.toFixed(1)}/5
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Install Hours:</Text>
                      <Text style={styles.detailValue}>
                        {dept.installHours.toFixed(1)}h
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Dismantle Hours:</Text>
                      <Text style={styles.detailValue}>
                        {dept.dismantleHours.toFixed(1)}h
                      </Text>
                    </View>

                    {dept.notes.length > 0 && (
                      <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>Notes</Text>
                        {dept.notes.map((note, index) => (
                          <Text
                            key={index}
                            style={styles.noteItem}
                          >
                            • {note}
                          </Text>
                        ))}
                      </View>
                    )}

                    {dept.riskFlags.length > 0 && (
                      <View style={styles.risksSection}>
                        <Text style={styles.risksTitle}>Risk Flags</Text>
                        {dept.riskFlags.map((flag, index) => (
                          <View key={index} style={styles.riskBadge}>
                            <Text style={styles.riskText}>{flag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Animated.View>
                )}
              </View>
            )}
          />
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineBox}>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>Install:</Text>
              <View style={styles.timelineBar}>
                <ProgressBar
                  progress={
                    estimate.totalInstallHours /
                    (estimate.totalInstallHours +
                      estimate.totalDismantleHours)
                  }
                  height={20}
                  variant="primary"
                />
              </View>
              <Text style={styles.timelineValue}>
                {estimate.totalInstallHours.toFixed(1)}h
              </Text>
            </View>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>Dismantle:</Text>
              <View style={styles.timelineBar}>
                <ProgressBar
                  progress={
                    estimate.totalDismantleHours /
                    (estimate.totalInstallHours +
                      estimate.totalDismantleHours)
                  }
                  height={20}
                  variant="success"
                />
              </View>
              <Text style={styles.timelineValue}>
                {estimate.totalDismantleHours.toFixed(1)}h
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          <GlowButton
            title="← Interview"
            variant="secondary"
            fullWidth
            onPress={() => onNavigate('interview')}
          />
          <GlowButton
            title="Report →"
            variant="primary"
            fullWidth
            onPress={() => onNavigate('report')}
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
  feasibilityCard: {
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
  },
  feasibilityContent: {
    gap: theme.spacing[2],
  },
  feasibilityStatus: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    fontFamily: theme.typography.families.monospace,
  },
  constraintsList: {
    gap: theme.spacing[1],
  },
  constraintText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    alignItems: 'center',
  },
  metricValue: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  metricLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  costBox: {
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    gap: theme.spacing[2],
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[1],
  },
  costLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  costValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    marginVertical: theme.spacing[1],
  },
  deptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
  },
  deptIndicator: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
  },
  deptInfo: {
    gap: theme.spacing[1],
  },
  deptSubtext: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  deptCost: {
    alignItems: 'flex-end',
    gap: theme.spacing[1],
  },
  deptCostValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
  },
  deptArrow: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
  },
  deptDetails: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.borderDim,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    marginHorizontal: theme.spacing[1],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  detailValue: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.bold,
  },
  notesSection: {
    marginTopY: theme.spacing[2],
    paddingTopY: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDim,
  },
  notesTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.info,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  noteItem: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  risksSection: {
    marginTopY: theme.spacing[2],
    paddingTopY: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDim,
    gap: theme.spacing[1],
  },
  risksTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.danger,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  riskBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
  },
  riskText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.danger,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.bold,
  },
  timelineBox: {
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    gap: theme.spacing[3],
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  timelineLabel: {
    width: 80,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  timelineBar: {
    flex: 1,
  },
  timelineValue: {
    width: 60,
    textAlign: 'right',
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.bold,
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
