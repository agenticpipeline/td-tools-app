import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
} from 'react-native';
import { theme } from '../../theme';
import GlowButton from '../../components/GlowButton';
import { Equipment, ValidationError, PipelineStep } from '../../types';

interface ValidateScreenProps {
  equipment: Equipment[];
  onNavigate: (step: PipelineStep) => void;
}

export default function ValidateScreen({
  equipment,
  onNavigate,
}: ValidateScreenProps) {
  const validationErrors = useMemo(() => {
    const errors: ValidationError[] = [];

    equipment.forEach((item, index) => {
      // Check required fields
      if (!item.name || item.name.trim().length === 0) {
        errors.push({
          equipmentId: item.id,
          field: 'name',
          message: 'Equipment name is required',
          severity: 'error',
        });
      }

      // Check valid quantity
      if (item.quantity <= 0) {
        errors.push({
          equipmentId: item.id,
          field: 'quantity',
          message: 'Quantity must be greater than 0',
          severity: 'error',
        });
      }

      // Check complexity range
      if (item.complexity < 1 || item.complexity > 5) {
        errors.push({
          equipmentId: item.id,
          field: 'complexity',
          message: 'Complexity must be between 1 and 5',
          severity: 'error',
        });
      }

      // Check weight
      if (item.baseWeight < 0) {
        errors.push({
          equipmentId: item.id,
          field: 'weight',
          message: 'Weight cannot be negative',
          severity: 'error',
        });
      }

      // Check times
      if (item.installTimeMinutes <= 0) {
        errors.push({
          equipmentId: item.id,
          field: 'installTime',
          message: 'Install time must be positive',
          severity: 'error',
        });
      }

      if (item.dismantleTimeMinutes <= 0) {
        errors.push({
          equipmentId: item.id,
          field: 'dismantleTime',
          message: 'Dismantle time must be positive',
          severity: 'error',
        });
      }

      // Warnings for heavy items without rigging
      if (item.baseWeight > 50 && !item.isRigged) {
        errors.push({
          equipmentId: item.id,
          field: 'weight',
          message: 'Heavy item - consider marking as rigged if applicable',
          severity: 'warning',
        });
      }

      // Warnings for high complexity
      if (item.complexity >= 4 && item.installTimeMinutes < 30) {
        errors.push({
          equipmentId: item.id,
          field: 'complexity',
          message: 'High complexity item with short install time - verify estimate',
          severity: 'warning',
        });
      }
    });

    return errors;
  }, [equipment]);

  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;
  const warningCount = validationErrors.filter((e) => e.severity === 'warning').length;
  const isValid = errorCount === 0;

  const getEquipmentName = (id: string) => {
    return equipment.find((e) => e.id === id)?.name || 'Unknown';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Step 3: Validate Equipment</Text>
          <Text style={styles.description}>
            Checking all equipment data for completeness and validity
          </Text>
        </View>

        {/* Status Summary */}
        <View style={styles.statusContainer}>
          {isValid ? (
            <View style={styles.statusCard}>
              <Text style={styles.statusIcon}>✓</Text>
              <Text style={styles.statusTitle}>All Valid</Text>
              <Text style={styles.statusMessage}>
                Equipment data is valid and ready for estimation
              </Text>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.statusCard,
                  { borderLeftColor: theme.colors.danger },
                ]}
              >
                <Text style={styles.statusIcon}>⚠</Text>
                <Text style={[styles.statusTitle, { color: theme.colors.danger }]}>
                  {errorCount} Error{errorCount !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.statusMessage}>
                  Please fix errors before proceeding
                </Text>
              </View>

              {warningCount > 0 && (
                <View
                  style={[
                    styles.statusCard,
                    { borderLeftColor: theme.colors.warning },
                  ]}
                >
                  <Text style={styles.statusIcon}>!</Text>
                  <Text style={[styles.statusTitle, { color: theme.colors.warning }]}>
                    {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.statusMessage}>
                    Review before proceeding
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Errors List */}
        {validationErrors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issues Found</Text>
            <FlatList
              data={validationErrors}
              keyExtractor={(item, index) => `${item.equipmentId}-${index}`}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.errorItem,
                    {
                      borderLeftColor:
                        item.severity === 'error'
                          ? theme.colors.danger
                          : theme.colors.warning,
                    },
                  ]}
                >
                  <View style={styles.errorIcon}>
                    <Text
                      style={{
                        color:
                          item.severity === 'error'
                            ? theme.colors.danger
                            : theme.colors.warning,
                        fontSize: theme.typography.sizes.lg,
                      }}
                    >
                      {item.severity === 'error' ? '✕' : '⚠'}
                    </Text>
                  </View>
                  <View style={styles.errorContent}>
                    <Text style={styles.errorEquipment}>
                      {getEquipmentName(item.equipmentId)}
                    </Text>
                    <Text style={styles.errorMessage}>{item.message}</Text>
                    <Text style={styles.errorField}>{item.field}</Text>
                  </View>
                  <View
                    style={[
                      styles.severityBadge,
                      {
                        backgroundColor:
                          item.severity === 'error'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(234, 179, 8, 0.1)',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.xs,
                        fontWeight: theme.typography.weights.bold,
                        color:
                          item.severity === 'error'
                            ? theme.colors.danger
                            : theme.colors.warning,
                        fontFamily: theme.typography.families.monospace,
                      }}
                    >
                      {item.severity === 'error' ? 'ERROR' : 'WARN'}
                    </Text>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Validation Checks</Text>
            <View style={styles.checkList}>
              <View style={styles.checkItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>All required fields populated</Text>
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>Quantities are positive integers</Text>
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>Complexity between 1-5</Text>
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>Weight values valid</Text>
              </View>
              <View style={styles.checkItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>Time estimates positive</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          <GlowButton
            title="← Review"
            variant="secondary"
            fullWidth
            onPress={() => onNavigate('review')}
          />
          <GlowButton
            title={isValid ? 'Continue →' : 'Fix Issues'}
            variant={isValid ? 'primary' : 'danger'}
            fullWidth
            disabled={!isValid}
            onPress={() => isValid && onNavigate('interview')}
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
  statusContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[3],
  },
  statusCard: {
    backgroundColor: theme.colors.surfacePrimary,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    borderTopRightRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: theme.typography.sizes['3xl'],
    marginBottom: theme.spacing[1],
  },
  statusTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  statusMessage: {
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
  errorItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSecondary,
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
    marginVertical: theme.spacing[2],
    alignItems: 'flex-start',
    gap: theme.spacing[2],
  },
  errorIcon: {
    width: theme.spacing[6],
    height: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  errorContent: {
    flex: 1,
  },
  errorEquipment: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  errorMessage: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  errorField: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.families.monospace,
    fontStyle: 'italic',
  },
  severityBadge: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surfacePrimary,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    borderTopRightRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
  },
  infoTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.info,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[2],
  },
  checkList: {
    gap: theme.spacing[2],
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  checkIcon: {
    color: theme.colors.success,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  checkText: {
    fontSize: theme.typography.sizes.sm,
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
