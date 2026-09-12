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

interface Erros {
  nome?: string;
  email?: string;
  senha?: string;
  cpf?: string;
}

export function CriarContaScreen() {
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function validar(): boolean {
    const novos: Erros = {};
    if (!nome.trim()) novos.nome = 'Informe seu nome';
    if (!email.trim()) novos.email = 'Informe seu e-mail';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) novos.email = 'E-mail inválido';
    if (senha.length < 6) novos.senha = 'A senha precisa ter ao menos 6 caracteres';
    if (!cpf.trim()) novos.cpf = 'Informe seu CPF';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function aoCadastrar() {
    setErroGeral(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      await cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        cpf: cpf.trim(),
        telefone: telefone.trim() || undefined,
      });
    } catch (e) {
      setErroGeral(mensagemDoErro(e, 'Não foi possível criar a conta'));
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
        <Text style={estilos.titulo}>Criar conta de tutor</Text>
        <Text style={estilos.descricao}>
          Cadastre-se para acompanhar a saúde do seu pet e acumular pontos por cada cuidado.
        </Text>

        <View style={estilos.formulario}>
          <CampoTexto
            rotulo="Nome completo"
            placeholder="Seu nome"
            value={nome}
            onChangeText={setNome}
            erro={erros.nome}
          />
          <CampoTexto
            rotulo="E-mail"
            placeholder="voce@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            erro={erros.email}
          />
          <CampoTexto
            rotulo="CPF"
            placeholder="000.000.000-00"
            value={cpf}
            onChangeText={setCpf}
            erro={erros.cpf}
          />
          <CampoTexto
            rotulo="Telefone (opcional)"
            placeholder="(11) 90000-0000"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />
          <CampoTexto
            rotulo="Senha"
            placeholder="Mínimo de 6 caracteres"
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

          <Botao titulo="Criar conta" onPress={aoCadastrar} carregando={enviando} />
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
    padding: espacamentos.lg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: {
    ...tipografia.titulo,
    color: cores.textoPrincipal,
  },
  descricao: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginTop: espacamentos.xs,
    marginBottom: espacamentos.lg,
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
});
