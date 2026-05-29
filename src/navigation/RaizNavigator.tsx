import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { CadastroPetScreen } from '../screens/CadastroPetScreen';
import { HistoricoScreen } from '../screens/HistoricoScreen';
import { PlanosScreen } from '../screens/PlanosScreen';
import { cores } from '../theme/cores';
import { AbasNavigator } from './AbasNavigator';
import type { RaizParamList } from './tipos';

const Stack = createNativeStackNavigator<RaizParamList>();

export function RaizNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTitleStyle: { color: cores.textoPrincipal, fontWeight: '700' },
        headerTintColor: cores.primaria,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="Abas" component={AbasNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="CadastroPet"
        component={CadastroPetScreen}
        options={{ title: 'Cadastro do pet' }}
      />
      <Stack.Screen name="Planos" component={PlanosScreen} options={{ title: 'Planos' }} />
      <Stack.Screen
        name="Historico"
        component={HistoricoScreen}
        options={{ title: 'Histórico' }}
      />
    </Stack.Navigator>
  );
}
