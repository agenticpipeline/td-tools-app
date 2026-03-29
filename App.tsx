import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import { theme } from './src/theme';
import DashboardScreen from './src/screens/DashboardScreen';
import PipelineScreen from './src/screens/pipeline/PipelineScreen';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Dashboard: undefined;
  Pipeline: { projectId: string; projectName: string };
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load custom fonts if needed (JetBrains Mono would be ideal but using system monospace as fallback)
        await Font.loadAsync({
          'monospace': require('./assets/fonts/JetBrainsMono-Regular.ttf') || {},
        }).catch(() => {
          // Fonts optional, continue if not found
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
              shadowColor: 'transparent',
              elevation: 0,
            },
            headerTitleStyle: {
              color: theme.colors.text,
              fontSize: theme.typography.sizes.lg,
              fontWeight: theme.typography.weights.bold,
              fontFamily: theme.typography.families.monospace,
            },
            headerTintColor: theme.colors.primary,
            cardStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Pipeline"
            component={PipelineScreen}
            options={({ route }) => ({
              title: route.params?.projectName || 'Project Pipeline',
              headerLeft: () => null,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
