import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../theme';

interface GlowButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function GlowButton({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  icon,
  fullWidth = false,
}: GlowButtonProps) {
  const glowValue = useSharedValue(0);

  const handlePressIn = () => {
    glowValue.value = withTiming(1, { duration: theme.animations.duration.base });
  };

  const handlePressOut = () => {
    glowValue.value = withTiming(0, { duration: theme.animations.duration.base });
  };

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary,
          text: theme.colors.textInverse,
          glow: theme.colors.glowBlue,
        };
      case 'secondary':
        return {
          bg: theme.colors.surfaceSecondary,
          text: theme.colors.text,
          glow: theme.colors.glowBlue,
        };
      case 'danger':
        return {
          bg: theme.colors.danger,
          text: theme.colors.textInverse,
          glow: 'rgba(239, 68, 68, 0.3)',
        };
      case 'success':
        return {
          bg: theme.colors.success,
          text: theme.colors.textInverse,
          glow: theme.colors.glowGreen,
        };
      default:
        return {
          bg: theme.colors.primary,
          text: theme.colors.textInverse,
          glow: theme.colors.glowBlue,
        };
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[3] };
      case 'md':
        return { paddingVertical: theme.spacing[3], paddingHorizontal: theme.spacing[4] };
      case 'lg':
        return { paddingVertical: theme.spacing[4], paddingHorizontal: theme.spacing[5] };
      default:
        return { paddingVertical: theme.spacing[3], paddingHorizontal: theme.spacing[4] };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.sizes.sm;
      case 'md':
        return theme.typography.sizes.base;
      case 'lg':
        return theme.typography.sizes.lg;
      default:
        return theme.typography.sizes.base;
    }
  };

  const colors = getColors();

  const animatedStyle = useAnimatedStyle(() => {
    const shadowColor = interpolateColor(
      glowValue.value,
      [0, 1],
      ['rgba(45, 140, 240, 0.2)', colors.glow]
    );

    return {
      shadowColor: shadowColor,
      shadowOpacity: 0.4 + glowValue.value * 0.4,
      shadowRadius: 4 + glowValue.value * 8,
    };
  });

  return (
    <Animated.View style={[animatedStyle, { width: fullWidth ? '100%' : 'auto' }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          {
            ...getPadding(),
            backgroundColor: disabled ? theme.colors.border : colors.bg,
            opacity: disabled ? 0.5 : 1,
            width: fullWidth ? '100%' : 'auto',
          },
          style,
        ]}
      >
        <View style={styles.content}>
          {icon && !loading && <View style={styles.icon}>{icon}</View>}
          {loading && (
            <ActivityIndicator
              size="small"
              color={colors.text}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: disabled ? theme.colors.textTertiary : colors.text,
                fontSize: getTextSize(),
              },
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(93, 127, 163, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing[2],
  },
  text: {
    fontFamily: theme.typography.families.monospace,
    fontWeight: theme.typography.weights.semibold,
  },
});
