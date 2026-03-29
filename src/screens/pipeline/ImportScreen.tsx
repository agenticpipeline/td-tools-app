import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../../theme';
import GlowButton from '../../components/GlowButton';
import { Equipment } from '../../types';
import { SAMPLE_EQUIPMENT } from '../../data/sampleEquipment';

interface ImportScreenProps {
  onEquipmentImport: (equipment: Equipment[]) => void;
  projectId: string;
}

interface FileTypeCard {
  name: string;
  formats: string;
  icon: string;
}

const FILE_TYPES: FileTypeCard[] = [
  { name: 'CSV', formats: '.csv', icon: '📊' },
  { name: 'Excel', formats: '.xlsx', icon: '📈' },
  { name: 'JSON', formats: '.json', icon: '{ }' },
  { name: 'Spreadsheet', formats: 'Google Sheets', icon: '📋' },
];

export default function ImportScreen({
  onEquipmentImport,
  projectId,
}: ImportScreenProps) {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const handleImportSampleData = () => {
    Alert.alert(
      'Import Sample Equipment?',
      `This will load ${SAMPLE_EQUIPMENT.length} sample items for demonstration`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            onEquipmentImport(SAMPLE_EQUIPMENT);
          },
        },
      ]
    );
  };

  const handleSelectFormat = (format: string) => {
    setSelectedFormat(format);
    Alert.alert(
      `Import ${format} File`,
      `File import for ${format} format would open native file picker.\n\nFor now, you can use the sample data to proceed.`,
      [{ text: 'OK', onPress: () => setSelectedFormat(null) }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Step 1: Import Equipment</Text>
        <Text style={styles.description}>
          Load your equipment list from a file or use sample data to get started
        </Text>
      </View>

      {/* File Format Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select File Format</Text>
        <View style={styles.fileGrid}>
          {FILE_TYPES.map((file) => (
            <TouchableOpacity
              key={file.name}
              style={[
                styles.fileCard,
                selectedFormat === file.name && styles.fileCardActive,
              ]}
              onPress={() => handleSelectFormat(file.name)}
              activeOpacity={0.7}
            >
              <Text style={styles.fileIcon}>{file.icon}</Text>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileFormats}>{file.formats}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Drop Zone Simulation */}
      <View style={styles.section}>
        <View style={styles.dropZone}>
          <Text style={styles.dropIcon}>📁</Text>
          <Text style={styles.dropText}>Drag and drop your file here</Text>
          <Text style={styles.dropSubtext}>
            or tap to browse your device
          </Text>
          <GlowButton
            title="Browse Files"
            variant="primary"
            size="md"
            onPress={() => {
              Alert.alert(
                'File Browser',
                'Native file browser would open here. Use sample data to proceed.'
              );
            }}
            style={styles.browseButton}
          />
        </View>
      </View>

      {/* Quick Start */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickStartCard}>
          <Text style={styles.quickStartTitle}>Load Sample Equipment</Text>
          <Text style={styles.quickStartDescription}>
            17 realistic equipment items across all departments to demonstrate the estimation engine
          </Text>
          <GlowButton
            title="Load Sample Equipment"
            variant="success"
            size="md"
            fullWidth
            onPress={handleImportSampleData}
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Import Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Format Requirements</Text>
        <View style={styles.tips}>
          <View style={styles.tip}>
            <Text style={styles.tipNumber}>1</Text>
            <View>
              <Text style={styles.tipTitle}>Required Columns</Text>
              <Text style={styles.tipText}>
                Name, Department, Quantity, Complexity, Weight, Install Time, Dismantle Time
              </Text>
            </View>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipNumber}>2</Text>
            <View>
              <Text style={styles.tipTitle}>Departments</Text>
              <Text style={styles.tipText}>
                audio, video, lighting, scenic, softgoods, stagehands
              </Text>
            </View>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipNumber}>3</Text>
            <View>
              <Text style={styles.tipTitle}>Complexity Scale</Text>
              <Text style={styles.tipText}>
                1 (simple) to 5 (highly complex)
              </Text>
            </View>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipNumber}>4</Text>
            <View>
              <Text style={styles.tipTitle}>Weight & Time</Text>
              <Text style={styles.tipText}>
                Weight in kg, times in minutes
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Template Download */}
      <View style={styles.section}>
        <GlowButton
          title="Download Template"
          variant="secondary"
          size="md"
          fullWidth
          onPress={() => {
            Alert.alert(
              'Download Template',
              'Template would be downloaded to your device'
            );
          }}
        />
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  fileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    justifyContent: 'space-between',
  },
  fileCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(45, 140, 240, 0.1)',
  },
  fileIcon: {
    fontSize: theme.typography.sizes['3xl'],
    marginBottom: theme.spacing[2],
  },
  fileName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  fileFormats: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  dropZone: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
    alignItems: 'center',
  },
  dropIcon: {
    fontSize: theme.typography.sizes['4xl'],
    marginBottom: theme.spacing[2],
  },
  dropText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  dropSubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[3],
  },
  browseButton: {
    marginTop: theme.spacing[2],
  },
  quickStartCard: {
    backgroundColor: theme.colors.surfacePrimary,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
  },
  quickStartTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  quickStartDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[3],
  },
  actionButton: {
    marginTop: theme.spacing[2],
  },
  tips: {
    gap: theme.spacing[3],
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surfaceSecondary,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tipNumber: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontFamily: theme.typography.families.monospace,
    width: theme.spacing[6],
    textAlign: 'center',
  },
  tipTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    fontFamily: theme.typography.families.monospace,
    marginBottom: theme.spacing[1],
  },
  tipText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.families.monospace,
  },
  footer: {
    height: theme.spacing[6],
  },
});
