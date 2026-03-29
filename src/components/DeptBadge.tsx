import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

type Department = 'audio' | 'video' | 'lighting' | 'scenic' | 'softgoods' | 'stagehands';

interface DeptBadgeProps {
  department: Department;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
  style?: ViewStyle;
}

export default function DeptBadge({
  department,
  size = 'md',
  variant = 'solid',
  style,
}: DeptBadgeProps) {
  const color = theme.colors.dept[department];

  const getDeptLabel = () => {
    const labels: Record<Department, string> = {
      audio: 'Audio',
      video: 'Video',
      lighting: 'Lighting',
      scenic: 'Scenic',
      softgoods: 'Softgoods',
      stagehands: 'Stagehands',
    };
    return labels[department];
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: theme.spacing[1], paddingHorizontal: theme.spacing[2] };
      case 'md':
        return { paddingVertical: theme.spacing[1], paddingHorizontal: theme.spacing[3] };
      case 'lg':
        return { paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[4] };
      default:
        return { paddingVertical: theme.spacing[1], paddingHorizontal: theme.spacing[3] };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.sizes.xs;
      case 'md':
        return theme.typography.sizes.sm;
      case 'lg':
        return theme.typography.sizes.base;
      default:
        return theme.typography.sizes.sm;
    }
  };

  const isSolid = variant === 'solid';

  return (
    <View
      style={[
        styles.badge,
        {
          ...getPadding(),
          backgroundColor: isSolid ? color : 'transparent',
          borderColor: color,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: getTextSize(),
            color: isSolid ? theme.colors.textInverse : color,
          },
        ]}
      >
        {getDeptLabel()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: theme.typography.weights.semibold,
    fontFamily: theme.typography.families.monospace,
  },
});
