import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RaizNavigator } from './src/navigation/RaizNavigator';
import { AnimedProvider } from './src/state/AnimedContext';
import { cores } from './src/theme/cores';

const TemaAnimed = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: cores.fundo,
    card: cores.fundoElevado,
    text: cores.textoPrincipal,
    border: cores.borda,
    primary: cores.primaria,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AnimedProvider>
        <NavigationContainer theme={TemaAnimed}>
          <StatusBar style="light" />
          <RaizNavigator />
        </NavigationContainer>
      </AnimedProvider>
    </SafeAreaProvider>
  );
}
