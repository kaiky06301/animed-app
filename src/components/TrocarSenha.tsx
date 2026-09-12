import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { mensagemDoErro } from '../api/cliente';
import * as authService from '../services/authService';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';
import { Botao } from './Botao';
import { CampoTexto } from './CampoTexto';

interface Props {
  visivel: boolean;
  onFechar: () => void;
  onTrocada: (mensagem: string) => void;
}

/** Mínimo exigido pela API. */
const TAMANHO_MINIMO = 6;

/**
 * Troca de senha do próprio usuário.
 *
 * A senha atual é pedida mesmo com a sessão aberta: sem isso, um aparelho
 * desbloqueado esquecido em cima da mesa bastaria para tomar a conta.
 */
export function TrocarSenha({ visivel, onFechar, onTrocada }: Props) {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<{ atual?: string; nova?: string; conf?: string }>({});
  const [erro, setErro] = useState<string | null>(null);

  const trocar = useMutation({
    mutationFn: () => authService.trocarSenha(atual, nova),
  });

  useEffect(() => {
    if (visivel) {
      setAtual('');
      setNova('');
      setConfirmacao('');
      setErros({});
      setErro(null);
    }
  }, [visivel]);

  async function confirmar() {
    const novos: typeof erros = {};

    if (!atual) novos.atual = 'Informe a senha atual';
    if (nova.length < TAMANHO_MINIMO) {
      novos.nova = `A nova senha precisa de ao menos ${TAMANHO_MINIMO} caracteres`;
    }
    if (nova && nova === atual) novos.nova = 'A nova senha precisa ser diferente da atual';
    if (confirmacao !== nova) novos.conf = 'As senhas não conferem';

    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setErro(null);

    try {
      await trocar.mutateAsync();
      onTrocada('Senha alterada. Use a nova no próximo acesso.');
      onFechar();
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível alterar a senha'));
    }
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View style={estilos.cabecalho}>
            <View style={estilos.selo}>
              <Ionicons name="key" size={20} color={cores.laranja} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={estilos.titulo}>Trocar senha</Text>
              <Text style={estilos.subtitulo}>
                Confirme a senha atual para criar uma nova
              </Text>
            </View>

            <Pressable onPress={onFechar} hitSlop={10} style={estilos.fechar}>
              <Ionicons name="close" size={20} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <CampoTexto
              rotulo="Senha atual"
              iconeRotulo="lock-closed-outline"
              icone="lock-closed-outline"
              placeholder="Sua senha de hoje"
              value={atual}
              onChangeText={setAtual}
              erro={erros.atual}
              senha
            />

            <CampoTexto
              rotulo="Nova senha"
              iconeRotulo="key-outline"
              icone="key-outline"
              placeholder={`Ao menos ${TAMANHO_MINIMO} caracteres`}
              value={nova}
              onChangeText={setNova}
              erro={erros.nova}
              senha
            />

            <CampoTexto
              rotulo="Repita a nova senha"
              iconeRotulo="checkmark-done-outline"
              icone="checkmark-done-outline"
              placeholder="Digite de novo"
              value={confirmacao}
              onChangeText={setConfirmacao}
              erro={erros.conf}
              senha
            />

            {!!erro && <Text style={estilos.erro}>{erro}</Text>}
          </ScrollView>

          <Botao
            titulo="Salvar nova senha"
            icone="checkmark-circle-outline"
            onPress={confirmar}
            carregando={trocar.isPending}
          />
        </Pressable>
      </Pressable>
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
    backgroundColor: cores.laranjaSuave,
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

  erro: { color: cores.erro, fontSize: 12, marginBottom: espacamentos.sm },
});
