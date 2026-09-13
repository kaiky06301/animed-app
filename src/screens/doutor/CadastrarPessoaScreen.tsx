import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../../api/cliente';
import { Botao } from '../../components/Botao';
import { CampoTexto } from '../../components/CampoTexto';
import * as authService from '../../services/authService';
import type { Perfil } from '../../services/tipos';
import { cores, espacamentos, raios, tipografia } from '../../theme/cores';

/** Mínimo exigido pela API. */
const TAMANHO_MINIMO_DA_SENHA = 6;

/**
 * Cadastro de pessoas feito pela clínica.
 *
 * Quem chega ao balcão é o tutor, e é a recepção que abre o acesso dele — não
 * o contrário. A mesma tela cadastra outro veterinário, porque a equipe cresce
 * e não faz sentido depender de quem montou o sistema para isso.
 *
 * Criar conta de veterinário dá acesso a ato clínico: registrar vacina,
 * prescrever e concluir atendimento. Por isso a API só aceita esse cadastro
 * vindo de quem já é veterinário — a validação está lá, não aqui.
 */
export function CadastrarPessoaScreen() {
  const navigation = useNavigation();

  const [perfil, setPerfil] = useState<Perfil>('TUTOR');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const cadastrar = useMutation({
    mutationFn: () =>
      authService.cadastrarPessoa({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        cpf: cpf.trim(),
        telefone: telefone.trim() || undefined,
        role: perfil,
      }),
  });

  const ehVeterinario = perfil === 'DOUTOR';

  function limpar() {
    setNome('');
    setEmail('');
    setCpf('');
    setTelefone('');
    setSenha('');
    setErros({});
  }

  async function confirmar() {
    const novos: Record<string, string> = {};

    if (nome.trim().length < 3) novos.nome = 'Informe o nome completo';
    if (!email.includes('@')) novos.email = 'E-mail inválido';
    if (cpf.trim().length < 11) novos.cpf = 'Informe o CPF';
    if (senha.length < TAMANHO_MINIMO_DA_SENHA) {
      novos.senha = `A senha precisa de ao menos ${TAMANHO_MINIMO_DA_SENHA} caracteres`;
    }

    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setErro(null);
    setSucesso(null);

    try {
      await cadastrar.mutateAsync();

      setSucesso(
        `${ehVeterinario ? 'Veterinário' : 'Tutor'} ${nome.trim()} cadastrado. `
          + 'O acesso já está liberado.',
      );
      limpar();
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível concluir o cadastro'));
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
        <Text style={estilos.subtitulo}>Área do veterinário</Text>
        <Text style={estilos.titulo}>Cadastrar</Text>
        <Text style={estilos.explicacao}>
          {ehVeterinario
            ? 'A nova conta terá acesso aos atos clínicos: registrar vacina, prescrever e concluir atendimento.'
            : 'O tutor recebe acesso ao aplicativo para acompanhar os próprios pets.'}
        </Text>

        {/* Um cadastro ou outro: os campos são os mesmos, muda o que a conta pode fazer */}
        <View style={estilos.seletor}>
          {(['TUTOR', 'DOUTOR'] as Perfil[]).map((opcao) => {
            const ativo = perfil === opcao;

            return (
              <Pressable
                key={opcao}
                onPress={() => {
                  setPerfil(opcao);
                  setErros({});
                  setSucesso(null);
                  setErro(null);
                }}
                style={({ pressed }) => [
                  estilos.opcao,
                  ativo && estilos.opcaoAtiva,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Ionicons
                  name={opcao === 'DOUTOR' ? 'medkit' : 'person'}
                  size={16}
                  color={ativo ? cores.primaria : cores.textoSecundario}
                />
                <Text style={[estilos.opcaoTexto, ativo && estilos.opcaoTextoAtivo]}>
                  {opcao === 'DOUTOR' ? 'Veterinário' : 'Tutor'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!!sucesso && (
          <View style={estilos.avisoOk}>
            <Ionicons name="checkmark-circle" size={17} color={cores.primaria} />
            <Text style={estilos.avisoOkTexto}>{sucesso}</Text>
          </View>
        )}

        {!!erro && (
          <View style={estilos.avisoErro}>
            <Ionicons name="alert-circle" size={17} color={cores.erro} />
            <Text style={estilos.avisoErroTexto}>{erro}</Text>
          </View>
        )}

        <View style={estilos.cartao}>
          <CampoTexto
            rotulo="Nome completo"
            iconeRotulo="person-outline"
            icone="person-outline"
            placeholder={ehVeterinario ? 'Dra. Helena Prado' : 'Marina Oliveira'}
            value={nome}
            onChangeText={setNome}
            erro={erros.nome}
          />

          <CampoTexto
            rotulo="E-mail"
            iconeRotulo="mail-outline"
            icone="mail-outline"
            placeholder="pessoa@email.com"
            value={email}
            onChangeText={setEmail}
            erro={erros.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CampoTexto
            rotulo="CPF"
            iconeRotulo="card-outline"
            icone="card-outline"
            placeholder="000.000.000-00"
            value={cpf}
            onChangeText={setCpf}
            erro={erros.cpf}
            keyboardType="numbers-and-punctuation"
          />

          <CampoTexto
            rotulo="Telefone"
            iconeRotulo="call-outline"
            icone="call-outline"
            placeholder="(11) 90000-0000"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

          <CampoTexto
            rotulo="Senha de acesso"
            iconeRotulo="lock-closed-outline"
            icone="lock-closed-outline"
            placeholder={`Ao menos ${TAMANHO_MINIMO_DA_SENHA} caracteres`}
            value={senha}
            onChangeText={setSenha}
            erro={erros.senha}
            senha
          />

          <Botao
            titulo={ehVeterinario ? 'Cadastrar veterinário' : 'Cadastrar tutor'}
            icone="checkmark-circle-outline"
            onPress={confirmar}
            carregando={cadastrar.isPending}
          />
        </View>

        {ehVeterinario && (
          <Text style={estilos.nota}>
            Conta de veterinário só pode ser criada por quem já é veterinário — a regra
            vale também para quem chamar a API diretamente.
          </Text>
        )}

        <Pressable onPress={() => navigation.goBack()} style={estilos.voltar}>
          <Ionicons name="chevron-back" size={15} color={cores.textoSecundario} />
          <Text style={estilos.voltarTexto}>Voltar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.md, paddingBottom: espacamentos.xxl },

  subtitulo: { color: cores.primaria, fontSize: 12, fontWeight: '700' },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  explicacao: {
    fontSize: 13,
    color: cores.textoSecundario,
    lineHeight: 19,
    marginTop: 4,
  },

  seletor: { flexDirection: 'row', gap: espacamentos.xs, marginVertical: espacamentos.md },
  opcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  opcaoAtiva: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  opcaoTexto: { fontSize: 13, fontWeight: '700', color: cores.textoSecundario },
  opcaoTextoAtivo: { color: cores.primaria },

  cartao: {
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
  },

  avisoOk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.xs,
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.sm,
  },
  avisoOkTexto: { flex: 1, fontSize: 13, color: cores.primaria, lineHeight: 18 },

  avisoErro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.xs,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.sm,
  },
  avisoErroTexto: { flex: 1, fontSize: 13, color: cores.erro, lineHeight: 18 },

  nota: {
    fontSize: 11,
    color: cores.textoSuave,
    lineHeight: 16,
    marginTop: espacamentos.sm,
  },

  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    marginTop: espacamentos.md,
  },
  voltarTexto: { fontSize: 13, color: cores.textoSecundario, fontWeight: '600' },
});
