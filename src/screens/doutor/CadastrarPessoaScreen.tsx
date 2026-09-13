import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../../api/cliente';
import { Botao } from '../../components/Botao';
import { CampoTexto } from '../../components/CampoTexto';
import { useMudarAcesso, useUsuarios } from '../../hooks/useUsuarios';
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

  const { data: usuarios, isLoading: carregandoUsuarios } = useUsuarios();
  const mudarAcesso = useMudarAcesso();

  const ehVeterinario = perfil === 'DOUTOR';

  /**
   * Liga ou desliga o acesso de alguém.
   *
   * A conta não é apagada: o histórico clínico que a pessoa produziu continua
   * com autoria. Regras como "não desativar a si mesmo" vivem na API.
   */
  async function alternarAcesso(
    usuario: { id: number; nome: string; ativo: boolean },
    ligado: boolean,
  ) {
    setErro(null);
    setSucesso(null);

    try {
      await mudarAcesso.mutateAsync({ id: usuario.id, ativo: ligado });
      setSucesso(
        `Acesso de ${usuario.nome} ${ligado ? 'liberado' : 'desligado'}.`,
      );
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível alterar o acesso'));
    }
  }

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

        {/* Quem tem acesso hoje, e o que cada um pode fazer */}
        <View style={estilos.tituloLista}>
          <Text style={estilos.secao}>Acessos da clínica</Text>
          {!!usuarios && (
            <Text style={estilos.contagem}>
              {usuarios.filter((u) => u.ativo).length} de {usuarios.length} ativos
            </Text>
          )}
        </View>

        {carregandoUsuarios ? (
          <ActivityIndicator color={cores.primaria} style={{ marginTop: espacamentos.md }} />
        ) : (
          (usuarios ?? []).map((usuario) => (
            <View
              key={usuario.id}
              style={[estilos.pessoa, !usuario.ativo && estilos.pessoaInativa]}
            >
              <View
                style={[
                  estilos.selo,
                  { backgroundColor: usuario.role === 'DOUTOR'
                      ? cores.primariaSuave : cores.superficieAlt },
                ]}
              >
                <Ionicons
                  name={usuario.role === 'DOUTOR' ? 'medkit' : 'person'}
                  size={17}
                  color={usuario.role === 'DOUTOR' ? cores.primaria : cores.textoSecundario}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={estilos.pessoaNome}>{usuario.nome}</Text>
                <Text style={estilos.pessoaEmail}>{usuario.email}</Text>
                <Text style={estilos.pessoaDetalhe}>
                  {usuario.role === 'DOUTOR'
                    ? 'Veterinário'
                    : `Tutor · ${usuario.pets} ${usuario.pets === 1 ? 'pet' : 'pets'}`}
                  {!usuario.ativo && ' · acesso desligado'}
                </Text>
              </View>

              <Switch
                value={usuario.ativo}
                onValueChange={(ligado) => alternarAcesso(usuario, ligado)}
                disabled={mudarAcesso.isPending}
                trackColor={{ false: cores.superficieAlt, true: cores.primariaSuave }}
                thumbColor={usuario.ativo ? cores.primaria : cores.textoSuave}
              />
            </View>
          ))
        )}
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

  tituloLista: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: espacamentos.xs,
    marginTop: espacamentos.lg,
    marginBottom: espacamentos.sm,
  },
  secao: { ...tipografia.subtitulo, color: cores.textoPrincipal, flex: 1 },
  contagem: { fontSize: 12, color: cores.textoSuave },

  pessoa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.xs,
  },
  // Conta desligada continua na lista, apagada: some do sistema, não do histórico
  pessoaInativa: { opacity: 0.55 },
  selo: {
    width: 36,
    height: 36,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pessoaNome: { fontSize: 14, fontWeight: '700', color: cores.textoPrincipal },
  pessoaEmail: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
  pessoaDetalhe: { fontSize: 11, color: cores.textoSuave, marginTop: 2 },

  nota: {
    fontSize: 11,
    color: cores.textoSuave,
    lineHeight: 16,
    marginTop: espacamentos.sm,
  },

});
