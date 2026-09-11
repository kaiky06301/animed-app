import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../api/cliente';
import { useCancelarAtendimento, useDetalheAtendimento } from '../hooks/useAgenda';
import type { DetalheAtendimento as Detalhe } from '../services/tipos';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';
import { Botao } from './Botao';

interface Props {
  idConsulta: number | null;
  onFechar: () => void;
}

const DIAS_SEMANA = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
];

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const ROTULOS: Record<Detalhe['status'], string> = {
  AGENDADA: 'Agendado',
  REALIZADA: 'Realizado',
  CANCELADA: 'Cancelado',
  NAO_COMPARECEU: 'Não compareceu',
};

const CORES: Record<Detalhe['status'], string> = {
  AGENDADA: cores.laranja,
  REALIZADA: cores.primaria,
  CANCELADA: cores.erro,
  NAO_COMPARECEU: cores.textoSuave,
};

/** "2026-09-16T09:00" -> "quarta-feira, 16 de setembro de 2026" */
function dataPorExtenso(iso: string): string {
  const data = new Date(iso);

  return `${DIAS_SEMANA[data.getDay()]}, ${data.getDate()} de ${
    MESES[data.getMonth()]
  } de ${data.getFullYear()}`;
}

function hora(iso: string): string {
  const data = new Date(iso);
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(
    2,
    '0',
  )}`;
}

function Linha({
  icone,
  rotulo,
  valor,
  detalhe,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
  detalhe?: string | null;
}) {
  return (
    <View style={estilos.linha}>
      <View style={estilos.linhaIcone}>
        <Ionicons name={icone} size={17} color={cores.laranja} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={estilos.linhaRotulo}>{rotulo}</Text>
        <Text style={estilos.linhaValor}>{valor}</Text>
        {!!detalhe && <Text style={estilos.linhaDetalhe}>{detalhe}</Text>}
      </View>
    </View>
  );
}

/**
 * Detalhe do atendimento.
 *
 * Reúne o que o tutor precisa saber: quando é, quem atende e onde fica a
 * clínica. O preparo do pet não é texto padrão do aplicativo — aparece
 * apenas quando o veterinário escreveu uma orientação para aquele caso.
 */
export function DetalheAtendimento({ idConsulta, onFechar }: Props) {
  const { data: atendimento, isLoading } = useDetalheAtendimento(idConsulta);
  const cancelar = useCancelarAtendimento();

  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setConfirmando(false);
    setErro(null);
  }, [idConsulta]);

  /** Só faz sentido desmarcar o que ainda vai acontecer. */
  const podeCancelar =
    atendimento?.status === 'AGENDADA' && new Date(atendimento.dataHora) > new Date();

  async function desmarcar() {
    if (!atendimento) return;
    setErro(null);

    try {
      await cancelar.mutateAsync(atendimento.idConsulta);
      // A tela continua aberta de propósito: o tutor vê o status virar
      // "Cancelado" e confirma que o pedido foi para frente.
      setConfirmando(false);
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível cancelar o atendimento'));
    }
  }

  return (
    <Modal
      visible={idConsulta != null}
      transparent
      animationType="fade"
      onRequestClose={onFechar}
    >
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          {isLoading || !atendimento ? (
            <ActivityIndicator color={cores.primaria} style={{ paddingVertical: 40 }} />
          ) : (
            <>
              <View style={estilos.cabecalho}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.titulo}>{atendimento.motivo}</Text>
                  <Text style={estilos.subtitulo}>Para {atendimento.nomePet}</Text>
                </View>

                <Pressable onPress={onFechar} hitSlop={10} style={estilos.fechar}>
                  <Ionicons name="close" size={20} color={cores.textoSecundario} />
                </Pressable>
              </View>

              <View
                style={[
                  estilos.status,
                  { backgroundColor: `${CORES[atendimento.status]}22` },
                ]}
              >
                <Text style={[estilos.statusTexto, { color: CORES[atendimento.status] }]}>
                  {ROTULOS[atendimento.status]}
                </Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Linha
                  icone="calendar"
                  rotulo="Data"
                  valor={dataPorExtenso(atendimento.dataHora)}
                />
                <Linha
                  icone="time"
                  rotulo="Horário"
                  valor={`${hora(atendimento.dataHora)}`}
                  detalhe={`Duração de aproximadamente ${atendimento.duracaoMinutos} minutos`}
                />
                <Linha
                  icone="medkit"
                  rotulo="Profissional"
                  valor={atendimento.veterinario ?? 'A definir'}
                />
                <Linha
                  icone="location"
                  rotulo="Onde"
                  valor={atendimento.clinica}
                  detalhe={atendimento.endereco}
                />

                {!!atendimento.orientacao && (
                  <View style={estilos.bloco}>
                    <View style={estilos.blocoTopo}>
                      <MaterialCommunityIcons
                        name="clipboard-text-outline"
                        size={17}
                        color={cores.laranja}
                      />
                      <Text style={estilos.blocoTitulo}>
                        Orientação de {atendimento.veterinario ?? 'sua veterinária'}
                      </Text>
                    </View>
                    <Text style={estilos.blocoItem}>{atendimento.orientacao}</Text>
                  </View>
                )}

                {!!atendimento.diagnostico && (
                  <View style={[estilos.bloco, estilos.blocoClinico]}>
                    <View style={estilos.blocoTopo}>
                      <MaterialCommunityIcons
                        name="stethoscope"
                        size={17}
                        color={cores.primaria}
                      />
                      <Text style={[estilos.blocoTitulo, { color: cores.primaria }]}>
                        Diagnóstico
                      </Text>
                    </View>
                    <Text style={estilos.blocoItem}>{atendimento.diagnostico}</Text>
                  </View>
                )}

                {!!atendimento.prescricao && (
                  <View style={[estilos.bloco, estilos.blocoClinico]}>
                    <View style={estilos.blocoTopo}>
                      <MaterialCommunityIcons name="pill" size={17} color={cores.primaria} />
                      <Text style={[estilos.blocoTitulo, { color: cores.primaria }]}>
                        Prescrição
                      </Text>
                    </View>
                    <Text style={estilos.blocoItem}>{atendimento.prescricao}</Text>
                  </View>
                )}
              </ScrollView>

              {podeCancelar && !confirmando && (
                <Pressable
                  onPress={() => setConfirmando(true)}
                  style={({ pressed }) => [estilos.cancelar, pressed && { opacity: 0.7 }]}
                >
                  <Ionicons name="close-circle-outline" size={16} color={cores.erro} />
                  <Text style={estilos.cancelarTexto}>Cancelar atendimento (−30 pts)</Text>
                </Pressable>
              )}

              {podeCancelar && confirmando && (
                <View style={estilos.confirmacao}>
                  <View style={estilos.penalidade}>
                    <Ionicons name="remove-circle" size={15} color={cores.erro} />
                    <Text style={estilos.penalidadeTexto}>−30 pontos</Text>
                  </View>

                  <Text style={estilos.confirmacaoTexto}>
                    O horário volta a ficar disponível para outro paciente e os 30 pontos
                    saem do seu saldo. Confirma?
                  </Text>

                  {!!erro && <Text style={estilos.erro}>{erro}</Text>}

                  <View style={estilos.confirmacaoBotoes}>
                    <Botao
                      titulo="Manter"
                      variante="sutil"
                      onPress={() => setConfirmando(false)}
                      estilo={{ flex: 1 }}
                    />
                    <Botao
                      titulo="Cancelar mesmo assim"
                      variante="perigo"
                      onPress={desmarcar}
                      carregando={cancelar.isPending}
                      estilo={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}
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
    maxWidth: 460,
    maxHeight: '88%',
    width: '100%',
    alignSelf: 'center',
  },

  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.sm },
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

  status: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.sm,
    paddingVertical: 3,
    borderRadius: raios.pill,
    marginTop: espacamentos.sm,
    marginBottom: espacamentos.xs,
  },
  statusTexto: { fontSize: 11, fontWeight: '700' },

  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.sm,
    paddingVertical: espacamentos.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  linhaIcone: {
    width: 32,
    height: 32,
    borderRadius: raios.sm,
    backgroundColor: cores.laranjaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaRotulo: {
    fontSize: 11,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  linhaValor: { fontSize: 14, color: cores.textoPrincipal, fontWeight: '600', marginTop: 1 },
  linhaDetalhe: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },

  bloco: {
    backgroundColor: 'rgba(255,138,61,0.10)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginTop: espacamentos.md,
    gap: 2,
  },
  blocoClinico: { backgroundColor: cores.primariaSuave },
  blocoTopo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  blocoTitulo: { color: cores.laranja, fontSize: 12, fontWeight: '800' },
  blocoItem: { color: cores.textoSecundario, fontSize: 12, lineHeight: 17 },

  cancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: espacamentos.md,
    paddingVertical: espacamentos.sm,
  },
  cancelarTexto: { color: cores.erro, fontSize: 13, fontWeight: '600' },

  confirmacao: {
    backgroundColor: 'rgba(255,107,107,0.10)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginTop: espacamentos.md,
    gap: espacamentos.sm,
  },
  confirmacaoTexto: { color: cores.textoSecundario, fontSize: 12, lineHeight: 17 },
  penalidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,107,0.16)',
    paddingHorizontal: espacamentos.sm,
    paddingVertical: 4,
    borderRadius: raios.pill,
  },
  penalidadeTexto: { color: cores.erro, fontSize: 12, fontWeight: '800' },
  confirmacaoBotoes: { flexDirection: 'row', gap: espacamentos.sm },
  erro: { color: cores.erro, fontSize: 12 },
});
