import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { mensagemDoErro } from '../api/cliente';
import { useAuth } from '../state/AuthContext';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RaizParamList } from '../navigation/tipos';

type Props = NativeStackScreenProps<RaizParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function validar(): boolean {
    const novos: typeof erros = {};
    if (!email.trim()) novos.email = 'Informe seu e-mail';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) novos.email = 'E-mail inválido';
    if (!senha) novos.senha = 'Informe sua senha';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function aoEntrar() {
    setErroGeral(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      // A navegação acontece sozinha: o gate de rotas troca a pilha
      // assim que a sessão passa a existir.
    } catch (e) {
      setErroGeral(mensagemDoErro(e, 'Não foi possível entrar'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.fundo}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.marca}>
          <Text style={estilos.logo}>Animed</Text>
          <Text style={estilos.subtitulo}>Cuidado contínuo para o seu pet</Text>
        </View>

        <View style={estilos.formulario}>
          <CampoTexto
            rotulo="E-mail"
            placeholder="voce@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            erro={erros.email}
          />

          <CampoTexto
            rotulo="Senha"
            placeholder="Sua senha"
            value={senha}
            onChangeText={setSenha}
            senha
            erro={erros.senha}
          />

          {!!erroGeral && (
            <View style={estilos.avisoErro}>
              <Text style={estilos.avisoErroTexto}>{erroGeral}</Text>
            </View>
          )}

          <Botao titulo="Entrar" onPress={aoEntrar} carregando={enviando} />

          <Botao
            titulo="Criar uma conta"
            variante="contorno"
            onPress={() => navigation.navigate('CriarConta')}
            estilo={{ marginTop: espacamentos.sm }}
          />
        </View>

        <View style={estilos.demo}>
          <Text style={estilos.demoTitulo}>Acesso de demonstração</Text>
          <Text style={estilos.demoLinha}>tutor@animed.com.br · animed123</Text>
          <Text style={estilos.demoLinha}>doutor@animed.com.br · animed123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espacamentos.lg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  marca: {
    alignItems: 'center',
    marginBottom: espacamentos.xl,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: cores.primaria,
    letterSpacing: -1,
  },
  subtitulo: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginTop: espacamentos.xs,
  },
  formulario: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.lg,
  },
  avisoErro: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.md,
  },
  avisoErroTexto: {
    ...tipografia.corpo,
    color: cores.erro,
  },
  demo: {
    marginTop: espacamentos.lg,
    alignItems: 'center',
  },
  demoTitulo: {
    ...tipografia.legenda,
    color: cores.textoSuave,
    marginBottom: espacamentos.xs,
  },
  demoLinha: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
  },
});
