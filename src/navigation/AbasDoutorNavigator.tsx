import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgendaDoutorScreen } from '../screens/doutor/AgendaDoutorScreen';
import { CadastrarPessoaScreen } from '../screens/doutor/CadastrarPessoaScreen';
import { PacientesScreen } from '../screens/doutor/PacientesScreen';
import { PerfilDoutorScreen } from '../screens/doutor/PerfilDoutorScreen';
import { useTema } from '../state/TemaContext';
import type { AbasDoutorParamList } from './tipos';

const Abas = createBottomTabNavigator<AbasDoutorParamList>();

const ICONES: Record<keyof AbasDoutorParamList, keyof typeof Ionicons.glyphMap> = {
  AgendaDoutor: 'calendar',
  Pacientes: 'people',
  CadastrarPessoa: 'person-add',
  PerfilDoutor: 'person-circle',
};

/** Navegação do perfil veterinário, distinta da do tutor. */
export function AbasDoutorNavigator() {
  const { cores } = useTema();
  // abas sem cabeçalho: afasta o conteúdo da barra de status e a barra de abas dos gestos do Android
  const margens = useSafeAreaInsets();
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
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
      <Abas.Screen
        name="AgendaDoutor"
        component={AgendaDoutorScreen}
        options={{ title: 'Agenda' }}
      />
      <Abas.Screen
        name="Pacientes"
        component={PacientesScreen}
        options={{ title: 'Pacientes' }}
      />
      <Abas.Screen
        name="CadastrarPessoa"
        component={CadastrarPessoaScreen}
        options={{ title: 'Cadastrar' }}
      />
      <Abas.Screen
        name="PerfilDoutor"
        component={PerfilDoutorScreen}
        options={{ title: 'Perfil' }}
      />
    </Abas.Navigator>
  );
}
