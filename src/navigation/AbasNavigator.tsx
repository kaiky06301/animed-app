import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAberturaPorNotificacao, useLembretesDeMedicamentos } from '../hooks/useLembretes';
import { AgendamentosScreen } from '../screens/AgendamentosScreen';
import { CuidadosScreen } from '../screens/CuidadosScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MeusPetsScreen } from '../screens/MeusPetsScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { RecompensasScreen } from '../screens/RecompensasScreen';
import { useTema } from '../state/TemaContext';
import type { AbasParamList } from './tipos';

const Abas = createBottomTabNavigator<AbasParamList>();

const ICONES: Record<keyof AbasParamList, keyof typeof Ionicons.glyphMap> = {
  Inicio: 'home',
  Pets: 'paw',
  Cuidados: 'medkit',
  Atendimentos: 'calendar',
  Recompensas: 'gift',
  Perfil: 'person-circle',
};

export function AbasNavigator() {
  const { cores } = useTema();
  // abas sem cabeçalho: afasta o conteúdo da barra de status e a barra de abas dos gestos do Android
  const margens = useSafeAreaInsets();
  useLembretesDeMedicamentos();
  useAberturaPorNotificacao();
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: cores.fundo,
          borderBottomColor: cores.borda,
        },
        headerTitleStyle: { color: cores.textoPrincipal },
        headerShown: false,
        sceneStyle: { paddingTop: margens.top, backgroundColor: cores.fundo },
        tabBarStyle: {
          backgroundColor: cores.fundoElevado,
          borderTopColor: cores.borda,
          height: 64 + margens.bottom,
          paddingTop: 6,
          paddingBottom: 8 + margens.bottom,
        },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONES[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Abas.Screen name="Inicio" component={HomeScreen} options={{ title: 'Início' }} />
      <Abas.Screen name="Pets" component={MeusPetsScreen} options={{ title: 'Meus pets' }} />
      <Abas.Screen name="Cuidados" component={CuidadosScreen} />
      <Abas.Screen name="Atendimentos" component={AgendamentosScreen} />
      <Abas.Screen name="Recompensas" component={RecompensasScreen} />
      <Abas.Screen name="Perfil" component={PerfilScreen} />
    </Abas.Navigator>
  );
}
