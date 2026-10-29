import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RaizNavigator } from './src/navigation/RaizNavigator';
import { AnimedProvider } from './src/state/AnimedContext';
import { AuthProvider } from './src/state/AuthContext';
import { PetAtivoProvider } from './src/state/PetAtivoContext';
import { TemaProvider, useTema } from './src/state/TemaContext';

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

/** Navegação com as cores do tema atual (claro ou escuro). */
function Navegacao() {
  const { cores, escuro } = useTema();

  const temaNavegacao = useMemo(() => {
    const base = escuro ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: cores.fundo,
        card: cores.fundoElevado,
        text: cores.textoPrincipal,
        border: cores.borda,
        primary: cores.primaria,
      },
    };
  }, [cores, escuro]);

  return (
    <NavigationContainer theme={temaNavegacao}>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <RaizNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PetAtivoProvider>
              <AnimedProvider>
                <Navegacao />
              </AnimedProvider>
            </PetAtivoProvider>
          </AuthProvider>
        </QueryClientProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}
