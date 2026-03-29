import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../../theme';
import PipelineNav, { PipelineStep } from '../../components/PipelineNav';
import { Equipment, PipelineState } from '../../types';
import { SAMPLE_EQUIPMENT } from '../../data/sampleEquipment';

// Import pipeline screens
import ImportScreen from './ImportScreen';
import ReviewScreen from './ReviewScreen';
import ValidateScreen from './ValidateScreen';
import InterviewScreen from './InterviewScreen';
import EstimateScreen from './EstimateScreen';
import ReportScreen from './ReportScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pipeline'>;

interface PipelineScreenProps {
  navigation: NavigationProp;
  route: {
    params: {
      projectId: string;
      projectName: string;
    };
  };
}

const PIPELINE_STEPS: PipelineStep[] = [
  'import',
  'review',
  'validate',
  'interview',
  'estimate',
  'report',
];

export default function PipelineScreen({
  navigation,
  route,
}: PipelineScreenProps) {
  const { projectId, projectName } = route.params;

  const [pipelineState, setPipelineState] = useState<PipelineState>({
    projectId,
    projectName,
    equipment: [],
    validationErrors: [],
    currentStep: 'import',
  });

  const handleStepPress = (step: PipelineStep) => {
    setPipelineState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  };

  const handleEquipmentImport = (equipment: Equipment[]) => {
    setPipelineState((prev) => ({
      ...prev,
      equipment,
      currentStep: 'review',
    }));
  };

  const handleEquipmentUpdate = (equipment: Equipment[]) => {
    setPipelineState((prev) => ({
      ...prev,
      equipment,
    }));
  };

  const handleNavigateToStep = (step: PipelineStep) => {
    setPipelineState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  };

  const renderCurrentStep = () => {
    switch (pipelineState.currentStep) {
      case 'import':
        return (
          <ImportScreen
            onEquipmentImport={handleEquipmentImport}
            projectId={projectId}
          />
        );
      case 'review':
        return (
          <ReviewScreen
            equipment={pipelineState.equipment}
            onEquipmentUpdate={handleEquipmentUpdate}
            onNavigate={handleNavigateToStep}
          />
        );
      case 'validate':
        return (
          <ValidateScreen
            equipment={pipelineState.equipment}
            onNavigate={handleNavigateToStep}
          />
        );
      case 'interview':
        return (
          <InterviewScreen
            equipment={pipelineState.equipment}
            notes={pipelineState.interviewNotes}
            onNotesUpdate={(notes) =>
              setPipelineState((prev) => ({
                ...prev,
                interviewNotes: notes,
              }))
            }
            onNavigate={handleNavigateToStep}
          />
        );
      case 'estimate':
        return (
          <EstimateScreen
            equipment={pipelineState.equipment}
            projectId={projectId}
            onNavigate={handleNavigateToStep}
          />
        );
      case 'report':
        return (
          <ReportScreen
            equipment={pipelineState.equipment}
            projectId={projectId}
            projectName={projectName}
            onNavigate={handleNavigateToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PipelineNav
        steps={PIPELINE_STEPS}
        currentStep={pipelineState.currentStep}
        onStepPress={handleStepPress}
      />

      <View style={styles.content}>
        {renderCurrentStep()}
      </View>
    </SafeAreaView>
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
});
