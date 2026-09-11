import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { PacientesScreen } from '../screens/doutor/PacientesScreen';
import { PerfilDoutorScreen } from '../screens/doutor/PerfilDoutorScreen';
import { cores } from '../theme/cores';
import type { AbasDoutorParamList } from './tipos';

const Abas = createBottomTabNavigator<AbasDoutorParamList>();

const ICONES: Record<keyof AbasDoutorParamList, keyof typeof Ionicons.glyphMap> = {
  Pacientes: 'people',
  PerfilDoutor: 'person-circle',
};

/** Navegação do perfil veterinário, distinta da do tutor. */
export function AbasDoutorNavigator() {
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
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
      <Abas.Screen
        name="Pacientes"
        component={PacientesScreen}
        options={{ title: 'Pacientes' }}
      />
      <Abas.Screen
        name="PerfilDoutor"
        component={PerfilDoutorScreen}
        options={{ title: 'Perfil' }}
      />
    </Abas.Navigator>
  );
}
