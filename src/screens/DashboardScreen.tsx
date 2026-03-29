import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { theme } from '../theme';
import GlowButton from '../components/GlowButton';
import DeptBadge from '../components/DeptBadge';
import { Project } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation: NavigationProp;
}

const SAMPLE_PROJECTS: Project[] = [
  {
    projectId: 'proj-001',
    projectName: 'Corporate Tech Summit 2026',
    eventDate: new Date('2026-04-15'),
    eventDuration: 8,
    venue: 'San Francisco Convention Center',
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-25'),
    status: 'in_progress',
    equipment: [],
  },
  {
    projectId: 'proj-002',
    projectName: 'Live Concert Series',
    eventDate: new Date('2026-04-22'),
    eventDuration: 12,
    venue: 'Red Rocks Amphitheater',
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-03-24'),
    status: 'estimated',
    equipment: [],
    estimate: {
      projectId: 'proj-002',
      equipment: [],
      departmentEstimates: [],
      totalCrew: 24,
      totalInstallHours: 16,
      totalDismantleHours: 12,
      totalCost: 18200,
      timelineHours: 8,
      feasible: true,
      constraints: [],
      generatedAt: new Date(),
    },
  },
  {
    projectId: 'proj-003',
    projectName: 'Brand Activation Event',
    eventDate: new Date('2026-03-30'),
    eventDuration: 6,
    venue: 'Downtown LA Parking Lot',
    createdAt: new Date('2026-02-28'),
    updatedAt: new Date('2026-03-22'),
    status: 'completed',
    equipment: [],
    estimate: {
      projectId: 'proj-003',
      equipment: [],
      departmentEstimates: [],
      totalCrew: 12,
      totalInstallHours: 6,
      totalDismantleHours: 4,
      totalCost: 8600,
      timelineHours: 4,
      feasible: true,
      constraints: [],
      generatedAt: new Date(),
    },
  },
];

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);

  useFocusEffect(
    React.useCallback(() => {
      // Refresh data when screen comes into focus
    }, [])
  );

  const handleNewProject = () => {
    const newProjectId = `proj-${Date.now()}`;
    const newProjectName = 'New Event';
    navigation.navigate('Pipeline', {
      projectId: newProjectId,
      projectName: newProjectName,
    });
  };

  const handleOpenProject = (project: Project) => {
    navigation.navigate('Pipeline', {
      projectId: project.projectId,
      projectName: project.projectName,
    });
  };

  // Calculate lifetime stats
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const totalCrewHours = projects
    .filter((p) => p.estimate)
    .reduce((sum, p) => sum + ((p.estimate?.totalInstallHours || 0) + (p.estimate?.totalDismantleHours || 0)), 0);
  const totalBudget = projects
    .filter((p) => p.estimate)
    .reduce((sum, p) => sum + (p.estimate?.totalCost || 0), 0);

  const getStatusBadgeColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'estimated':
      case 'approved':
        return theme.colors.primary;
      case 'in_progress':
        return theme.colors.warning;
      case 'draft':
        return theme.colors.textSecondary;
      default:
        return theme.colors.border;
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TD Tools</Text>
          <Text style={styles.subtitle}>Labor Estimation System</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <GlowButton
            title="+ New Event"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleNewProject}
          />
        </View>

        {/* Lifetime Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifetime Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedProjects}</Text>
              <Text style={styles.statLabel}>Completed Events</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalCrewHours.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Crew Hours</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${(totalBudget / 1000).toFixed(0)}k</Text>
              <Text style={styles.statLabel}>Total Budget</Text>
            </View>
          </View>
        </View>

        {/* Recent Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <View style={styles.projectList}>
            {projects.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No projects yet</Text>
                <Text style={styles.emptySubtext}>
                  Create your first event to get started
                </Text>
              </View>
            ) : (
              projects.map((project) => (
                <TouchableOpacity
                  key={project.projectId}
                  style={styles.projectCard}
                  onPress={() => handleOpenProject(project)}
                  activeOpacity={0.7}
                >
                  <View style={styles.projectHeader}>
                    <View style={styles.projectTitleContainer}>
                      <Text style={styles.projectName}>{project.projectName}</Text>
                      <Text style={styles.projectDate}>
                        {project.eventDate.toLocaleDateString()}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBadgeColor(project.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusLabel(project.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.projectVenue}>{project.venue}</Text>

                  {project.estimate && (
                    <View style={styles.estimateInfo}>
                      <View style={styles.estimateRow}>
                        <Text style={styles.estimateLabel}>Crew:</Text>
                        <Text style={styles.estimateValue}>
                          {project.estimate.totalCrew} people
                        </Text>
                      </View>
                      <View style={styles.estimateRow}>
                        <Text style={styles.estimateLabel}>Cost:</Text>
                        <Text style={styles.estimateValue}>
                          ${project.estimate.totalCost.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TD Tools v0.1.0</Text>
          <Text style={styles.footerText}>Blueprint Aesthetic • Production Ready</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
  },
  title: {
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    textAlign: 'center',
  },
  projectList: {
    gap: theme.spacing[3],
  },
  projectCard: {
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[2],
  },
  projectTitleContainer: {
    flex: 1,
  },
  projectName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  projectDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  statusBadge: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.borderRadius.lg,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textInverse,
    fontFamily: theme.typography.families.monospace,
  },
  projectVenue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[3],
  },
  estimateInfo: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDim,
    paddingTopY: theme.spacing[2],
    marginTopY: theme.spacing[2],
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing[1],
  },
  estimateLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  estimateValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.bold,
  },
  emptyState: {
    paddingVertical: theme.spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[2],
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.families.monospace,
  },
  footer: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[6],
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDim,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.families.monospace,
    marginVertical: theme.spacing[1],
  },
});
