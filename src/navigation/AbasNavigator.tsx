import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { ComunidadeScreen } from '../screens/ComunidadeScreen';
import { CuidadosScreen } from '../screens/CuidadosScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { RecompensasScreen } from '../screens/RecompensasScreen';
import { cores } from '../theme/cores';
import type { AbasParamList } from './tipos';

const Abas = createBottomTabNavigator<AbasParamList>();

const ICONES: Record<keyof AbasParamList, keyof typeof Ionicons.glyphMap> = {
  Inicio: 'home',
  Cuidados: 'medkit',
  Comunidade: 'people',
  Recompensas: 'gift',
  Perfil: 'person-circle',
};

export function AbasNavigator() {
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: cores.fundo,
          borderBottomColor: cores.borda,
        },
        headerTitleStyle: { color: cores.textoPrincipal },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: cores.fundoElevado,
          borderTopColor: cores.borda,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
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
      <Abas.Screen name="Cuidados" component={CuidadosScreen} />
      <Abas.Screen name="Comunidade" component={ComunidadeScreen} />
      <Abas.Screen name="Recompensas" component={RecompensasScreen} />
      <Abas.Screen name="Perfil" component={PerfilScreen} />
    </Abas.Navigator>
  );
}
