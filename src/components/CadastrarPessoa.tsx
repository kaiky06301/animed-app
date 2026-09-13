import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../api/cliente';
import * as authService from '../services/authService';
import type { Perfil } from '../services/tipos';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';
import { Botao } from './Botao';
import { CampoTexto } from './CampoTexto';

interface Props {
  visivel: boolean;
  onFechar: () => void;
  onCadastrado: (mensagem: string) => void;
}

/** Mínimo exigido pela API. */
const TAMANHO_MINIMO_DA_SENHA = 6;

/**
 * Cadastro de pessoas feito pela clínica.
 *
 * Quem chega ao balcão é o tutor, e é a recepção que abre o acesso dele — não
 * o contrário. A mesma janela cadastra outro veterinário, porque a equipe
 * cresce e não faz sentido depender de quem montou o sistema para isso.
 *
 * Criar conta de veterinário dá acesso a ato clínico: registrar vacina,
 * prescrever e concluir atendimento. Por isso a API só aceita esse cadastro
 * vindo de quem já é veterinário — a validação está lá, não aqui.
 */
export function CadastrarPessoa({ visivel, onFechar, onCadastrado }: Props) {
  const client = useQueryClient();

  const [perfil, setPerfil] = useState<Perfil>('TUTOR');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);

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

  // Abrir a janela começa um cadastro novo, nunca o rascunho do anterior
  useEffect(() => {
    if (visivel) {
      setPerfil('TUTOR');
      setNome('');
      setEmail('');
      setCpf('');
      setTelefone('');
      setSenha('');
      setErros({});
      setErro(null);
    }
  }, [visivel]);

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

    try {
      await cadastrar.mutateAsync();
      void client.invalidateQueries({ queryKey: ['usuarios'] });

      onCadastrado(
        `${ehVeterinario ? 'Veterinário' : 'Tutor'} ${nome.trim()} cadastrado. `
          + 'O acesso já está liberado.',
      );
      onFechar();
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível concluir o cadastro'));
    }
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={estilos.fundo} onPress={onFechar}>
          <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
            <View style={estilos.cabecalho}>
              <View style={estilos.selo}>
                <Ionicons name="person-add" size={20} color={cores.primaria} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={estilos.titulo}>Cadastrar</Text>
                <Text style={estilos.subtitulo}>
                  {ehVeterinario
                    ? 'Terá acesso aos atos clínicos'
                    : 'Acompanha os próprios pets pelo aplicativo'}
                </Text>
              </View>

              <Pressable onPress={onFechar} hitSlop={10} style={estilos.fechar}>
                <Ionicons name="close" size={20} color={cores.textoSecundario} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                        size={15}
                        color={ativo ? cores.primaria : cores.textoSecundario}
                      />
                      <Text style={[estilos.opcaoTexto, ativo && estilos.opcaoTextoAtivo]}>
                        {opcao === 'DOUTOR' ? 'Veterinário' : 'Tutor'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {!!erro && <Text style={estilos.erro}>{erro}</Text>}

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

              {ehVeterinario && (
                <Text style={estilos.nota}>
                  Conta de veterinário só pode ser criada por quem já é veterinário.
                </Text>
              )}
            </ScrollView>

            <Botao
              titulo={ehVeterinario ? 'Cadastrar veterinário' : 'Cadastrar tutor'}
              icone="checkmark-circle-outline"
              onPress={confirmar}
              carregando={cadastrar.isPending}
              estilo={{ marginTop: espacamentos.sm }}
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: cores.overlay,
    justifyContent: 'center',
    padding: espacamentos.md,
  },
  painel: {
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    maxWidth: 440,
    maxHeight: '90%',
    width: '100%',
    alignSelf: 'center',
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    marginBottom: espacamentos.md,
  },
  selo: {
    width: 40,
    height: 40,
    borderRadius: raios.md,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  subtitulo: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
  fechar: {
    width: 30,
    height: 30,
    borderRadius: raios.sm,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  seletor: { flexDirection: 'row', gap: espacamentos.xs, marginBottom: espacamentos.md },
  opcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  opcaoAtiva: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  opcaoTexto: { fontSize: 13, fontWeight: '700', color: cores.textoSecundario },
  opcaoTextoAtivo: { color: cores.primaria },

  erro: { color: cores.erro, fontSize: 12, marginBottom: espacamentos.sm },
  nota: { fontSize: 11, color: cores.textoSuave, lineHeight: 16, marginTop: 2 },
});
