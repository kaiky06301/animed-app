import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RaizNavigator } from './src/navigation/RaizNavigator';
import { AnimedProvider } from './src/state/AnimedContext';
import { AuthProvider } from './src/state/AuthContext';
import { PetAtivoProvider } from './src/state/PetAtivoContext';
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

/** Cache das requisições à API, compartilhado por toda a aplicação. */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PetAtivoProvider>
            <AnimedProvider>
            <NavigationContainer theme={TemaAnimed}>
              <StatusBar style="light" />
              <RaizNavigator />
            </NavigationContainer>
            </AnimedProvider>
          </PetAtivoProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
