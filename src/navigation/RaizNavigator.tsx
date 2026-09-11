import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AgendamentosScreen } from '../screens/AgendamentosScreen';
import { CadastroPetScreen } from '../screens/CadastroPetScreen';
import { CriarContaScreen } from '../screens/CriarContaScreen';
import { FormPetScreen } from '../screens/FormPetScreen';
import { HistoricoScreen } from '../screens/HistoricoScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MeusPetsScreen } from '../screens/MeusPetsScreen';
import { PlanosScreen } from '../screens/PlanosScreen';
import { VacinasScreen } from '../screens/VacinasScreen';
import { useAuth } from '../state/AuthContext';
import { cores } from '../theme/cores';
import { FichaPacienteScreen } from '../screens/doutor/FichaPacienteScreen';
import { AbasDoutorNavigator } from './AbasDoutorNavigator';
import { AbasNavigator } from './AbasNavigator';
import type { RaizParamList } from './tipos';

const Stack = createNativeStackNavigator<RaizParamList>();

/**
 * Controla o acesso às telas.
 *
 * As rotas internas só são declaradas quando existe sessão ativa — assim
 * o usuário não autenticado não consegue alcançá-las nem por navegação
 * direta, porque elas nem chegam a existir na pilha.
 */
export function RaizNavigator() {
  const { usuario, carregando } = useAuth();

  // Enquanto a sessão salva é restaurada, evita piscar a tela de login
  if (carregando) {
    return (
      <View style={estilos.carregando}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  const autenticado = !!usuario;
  const ehDoutor = usuario?.role === 'DOUTOR';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTitleStyle: { color: cores.textoPrincipal, fontWeight: '700' },
        // seta de voltar na cor da marca
        headerTintColor: cores.laranja,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      {autenticado && ehDoutor ? (
        // Fluxo do veterinário: pacientes e registro clínico
        <Stack.Group>
          <Stack.Screen
            name="AbasDoutor"
            component={AbasDoutorNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FichaPaciente"
            component={FichaPacienteScreen}
            options={{ title: 'Ficha do paciente' }}
          />
        </Stack.Group>
      ) : autenticado ? (
        <Stack.Group>
          <Stack.Screen name="Abas" component={AbasNavigator} options={{ headerShown: false }} />
          <Stack.Screen
            name="FormPet"
            component={FormPetScreen}
            options={{ title: 'Dados do pet' }}
          />
          <Stack.Screen
            name="Vacinas"
            component={VacinasScreen}
            options={{ title: 'Vacinas' }}
          />
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
          <Stack.Screen
            name="Agendamentos"
            component={AgendamentosScreen}
            options={{ title: 'Atendimentos' }}
          />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="CriarConta"
            component={CriarContaScreen}
            options={{ title: 'Criar conta' }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

const estilos = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
});
