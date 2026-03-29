import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../theme';

export type PipelineStep = 'import' | 'review' | 'validate' | 'interview' | 'estimate' | 'report';

interface PipelineNavProps {
  steps: PipelineStep[];
  currentStep: PipelineStep;
  onStepPress: (step: PipelineStep) => void;
}

const STEP_LABELS: Record<PipelineStep, { label: string; number: number }> = {
  import: { label: 'Import', number: 1 },
  review: { label: 'Review', number: 2 },
  validate: { label: 'Validate', number: 3 },
  interview: { label: 'Interview', number: 4 },
  estimate: { label: 'Estimate', number: 5 },
  report: { label: 'Report', number: 6 },
};

export default function PipelineNav({
  steps,
  currentStep,
  onStepPress,
}: PipelineNavProps) {
  const currentStepIndex = steps.indexOf(currentStep);

  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    const progress = currentStepIndex / (steps.length - 1);
    progressWidth.value = withTiming(progress, {
      duration: theme.animations.duration.slow,
    });
  }, [currentStepIndex, steps.length, progressWidth]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.max(0, progressWidth.value * 100)}%`,
    };
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.stepContainer}>
          {steps.map((step, index) => {
            const stepInfo = STEP_LABELS[step];
            const isActive = step === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <React.Fragment key={step}>
                {index > 0 && (
                  <View
                    style={[
                      styles.connector,
                      {
                        backgroundColor: isCompleted
                          ? theme.colors.success
                          : theme.colors.borderDim,
                      },
                    ]}
                  />
                )}

                <TouchableOpacity
                  onPress={() => onStepPress(step)}
                  activeOpacity={0.7}
                  style={styles.stepButton}
                >
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: isActive
                          ? theme.colors.primary
                          : isCompleted
                          ? theme.colors.success
                          : theme.colors.surfaceSecondary,
                        borderColor: isActive
                          ? theme.colors.primaryLight
                          : theme.colors.borderLight,
                        shadowColor: isActive ? theme.colors.primary : 'transparent',
                        shadowOpacity: isActive ? 0.5 : 0,
                        shadowRadius: isActive ? 8 : 0,
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          {
                            color: isActive
                              ? theme.colors.textInverse
                              : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        {stepInfo.number}
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: isActive
                          ? theme.colors.primary
                          : isCompleted
                          ? theme.colors.success
                          : theme.colors.textSecondary,
                        fontWeight: isActive
                          ? theme.typography.weights.bold
                          : theme.typography.weights.normal,
                      },
                    ]}
                  >
                    {stepInfo.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* Visual progress bar */}
        <View
          style={[
            styles.progressTrack,
            { width: steps.length > 1 ? `${((steps.length - 1) * 80 + 24) * 1.5}%` : '100%' },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              animatedProgressStyle,
            ]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDim,
  },
  scrollView: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing[4],
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepButton: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing[3],
    minWidth: 80,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  stepNumber: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    fontFamily: theme.typography.families.monospace,
  },
  checkmark: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
  },
  stepLabel: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.families.monospace,
    textAlign: 'center',
  },
  connector: {
    width: 20,
    height: 2,
    marginHorizontal: theme.spacing[1],
  },
  progressTrack: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    height: 2,
    backgroundColor: theme.colors.borderDim,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});
