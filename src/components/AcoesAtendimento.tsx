import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Atendimento } from '../services/tipos';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

interface Props {
  atendimento: Atendimento | null;
  onFechar: () => void;
  onConcluir: (atendimento: Atendimento) => void;
  onFalta: (atendimento: Atendimento) => void;
  registrandoFalta?: boolean;
}

/**
 * Ações do veterinário sobre um atendimento da agenda.
 *
 * Concluir e registrar falta são decisões que mexem na pontuação do tutor e
 * não têm desfazer — por isso saem da lista, onde um toque errado resolveria
 * o atendimento de outro paciente, e passam por esta confirmação, que mostra
 * de quem é o horário antes de qualquer coisa.
 */
export function AcoesAtendimento({
  atendimento,
  onFechar,
  onConcluir,
  onFalta,
  registrandoFalta = false,
}: Props) {
  const resolvido = atendimento?.status !== 'AGENDADA';

  return (
    <Modal
      visible={!!atendimento}
      transparent
      animationType="fade"
      onRequestClose={onFechar}
    >
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View style={estilos.cabecalho}>
            <View style={estilos.avatar}>
              <Ionicons name="paw" size={22} color={cores.textoSecundario} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={estilos.pet}>{atendimento?.nomePet}</Text>
              <Text style={estilos.tutor}>Tutor: {atendimento?.nomeTutor}</Text>
            </View>

            <Pressable onPress={onFechar} hitSlop={10} style={estilos.fechar}>
              <Ionicons name="close" size={20} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <View style={estilos.dados}>
            <View style={estilos.linha}>
              <Ionicons name="time-outline" size={15} color={cores.textoSuave} />
              <Text style={estilos.linhaTexto}>
                {atendimento?.horario.slice(0, 5)} · 30 min
              </Text>
            </View>

            <View style={estilos.linha}>
              <MaterialCommunityIcons
                name="stethoscope"
                size={15}
                color={cores.textoSuave}
              />
              <Text style={estilos.linhaTexto}>{atendimento?.motivo}</Text>
            </View>
          </View>

          {resolvido ? (
            <Text style={estilos.resolvido}>
              Este atendimento já foi encerrado e não aceita novas ações.
            </Text>
          ) : (
            <>
              <Pressable
                onPress={() => atendimento && onConcluir(atendimento)}
                style={({ pressed }) => [estilos.acao, estilos.concluir, pressed && estilos.tocado]}
              >
                <Ionicons name="checkmark-circle" size={19} color="#06281F" />
                <View style={{ flex: 1 }}>
                  <Text style={estilos.concluirTitulo}>Concluir atendimento</Text>
                  <Text style={estilos.concluirTexto}>
                    Registrar diagnóstico, conduta e retorno
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => atendimento && onFalta(atendimento)}
                disabled={registrandoFalta}
                style={({ pressed }) => [estilos.acao, estilos.falta, pressed && estilos.tocado]}
              >
                <Ionicons name="close-circle" size={19} color={cores.erro} />
                <View style={{ flex: 1 }}>
                  <Text style={estilos.faltaTitulo}>
                    {registrandoFalta ? 'Registrando…' : 'Paciente não veio'}
                  </Text>
                  <Text style={estilos.faltaTexto}>
                    Os pontos do agendamento voltam atrás
                  </Text>
                </View>
              </Pressable>
            </>
          )}
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
    width: '100%',
    alignSelf: 'center',
  },

  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pet: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  tutor: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
  fechar: {
    width: 30,
    height: 30,
    borderRadius: raios.sm,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dados: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    gap: 6,
    marginTop: espacamentos.md,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linhaTexto: { fontSize: 13, color: cores.textoSecundario, flex: 1 },

  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginTop: espacamentos.sm,
  },
  tocado: { opacity: 0.85 },

  concluir: { backgroundColor: cores.primaria },
  concluirTitulo: { fontSize: 14, fontWeight: '800', color: '#06281F' },
  concluirTexto: { fontSize: 11, color: '#06281F', opacity: 0.75, marginTop: 1 },

  falta: {
    borderWidth: 1,
    borderColor: cores.erro,
    backgroundColor: 'transparent',
  },
  faltaTitulo: { fontSize: 14, fontWeight: '700', color: cores.erro },
  faltaTexto: { fontSize: 11, color: cores.textoSuave, marginTop: 1 },

  resolvido: {
    fontSize: 12,
    color: cores.textoSuave,
    textAlign: 'center',
    marginTop: espacamentos.md,
    lineHeight: 18,
  },
});
