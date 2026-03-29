import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../theme';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  height = 8,
  variant = 'primary',
  showLabel = false,
}: ProgressBarProps) {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: theme.animations.duration.slow,
    });
  }, [progress, widthAnim]);

  const getColor = () => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'danger':
        return theme.colors.danger;
      case 'primary':
      default:
        return theme.colors.primary;
    }
  };

  const color = getColor();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${widthAnim.value * 100}%`,
    };
  });

  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: theme.colors.surfaceSecondary,
            borderColor: theme.colors.borderLight,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: color,
              shadowColor: color,
              shadowOpacity: 0.4,
              shadowRadius: 4,
            },
            animatedStyle,
          ]}
        />
      </View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Animated.Text
            style={[
              styles.label,
              {
                color: theme.colors.textSecondary,
              },
            ]}
          >
            {Math.round(progress * 100)}%
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginVertical: theme.spacing[1],
  },
  track: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
  },
  fill: {
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  labelContainer: {
    position: 'absolute',
    right: theme.spacing[2],
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    fontFamily: theme.typography.families.monospace,
  },
});
