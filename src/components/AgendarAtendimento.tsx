import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { mensagemDoErro } from '../api/cliente';
import { useAgendar, useDisponibilidade, useMesDaAgenda } from '../hooks/useAgenda';
import type { AgendamentoConfirmado, Pet } from '../services/tipos';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';
import { Botao } from './Botao';

interface Props {
  visivel: boolean;
  pet: Pet | null;
  /** Motivo sugerido: check-up preventivo ou consulta. */
  motivoInicial?: string;
  onFechar: () => void;
  onConfirmado: (confirmacao: AgendamentoConfirmado) => void;
}

const MOTIVOS = ['Check-up preventivo', 'Consulta de rotina', 'Retorno', 'Avaliação de sintoma'];

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function paraIso(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(
    data.getDate(),
  ).padStart(2, '0')}`;
}

/** Células do mês, com os espaços em branco antes do primeiro dia. */
function celulasDoMes(ano: number, mes: number): (number | null)[] {
  const primeiro = new Date(ano, mes, 1);
  const totalDeDias = new Date(ano, mes + 1, 0).getDate();

  return [
    ...Array.from({ length: primeiro.getDay() }, () => null),
    ...Array.from({ length: totalDeDias }, (_, i) => i + 1),
  ];
}

/**
 * Marcação de atendimento na clínica.
 *
 * O calendário destaca os dias em que ainda há vaga e, ao escolher um deles,
 * a coluna ao lado traz os horários livres — já descontados o intervalo de
 * almoço, os atendimentos marcados e a antecedência mínima.
 */
export function AgendarAtendimento({
  visivel,
  pet,
  motivoInicial = 'Check-up preventivo',
  onFechar,
  onConfirmado,
}: Props) {
  const { width } = useWindowDimensions();
  const largo = width >= 760;

  const hoje = useMemo(() => new Date(), []);

  const [mesVisivel, setMesVisivel] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [dataEscolhida, setDataEscolhida] = useState(paraIso(hoje));
  const [horario, setHorario] = useState<string | null>(null);
  const [motivo, setMotivo] = useState(motivoInicial);
  const [erro, setErro] = useState<string | null>(null);

  const ano = mesVisivel.getFullYear();
  const mes = mesVisivel.getMonth();

  const { data: calendario } = useMesDaAgenda(ano, mes + 1);
  const { data: agenda, isLoading } = useDisponibilidade(visivel ? dataEscolhida : null);
  const agendar = useAgendar();

  /** Dias com vaga, indexados pelo número do dia. */
  const vagasPorDia = useMemo(() => {
    const mapa = new Map<number, number>();
    calendario?.dias.forEach((dia) => {
      mapa.set(Number(dia.data.slice(8)), dia.horariosLivres);
    });
    return mapa;
  }, [calendario]);

  useEffect(() => {
    if (visivel) {
      setMotivo(motivoInicial);
      setHorario(null);
      setErro(null);
    }
  }, [visivel, motivoInicial]);

  function mudarMes(passo: number) {
    setMesVisivel(new Date(ano, mes + passo, 1));
  }

  function escolherDia(dia: number) {
    setDataEscolhida(paraIso(new Date(ano, mes, dia)));
    setHorario(null);
    setErro(null);
  }

  async function confirmar() {
    if (!pet || !horario) {
      setErro('Escolha um horário disponível');
      return;
    }

    setErro(null);

    try {
      const confirmacao = await agendar.mutateAsync({
        idPet: pet.id,
        dataHora: `${dataEscolhida}T${horario}:00`,
        motivo,
      });
      onConfirmado(confirmacao);
      onFechar();
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível agendar o atendimento'));
    }
  }

  const diaSelecionado = Number(dataEscolhida.slice(8));
  const mesSelecionado = dataEscolhida.slice(0, 7) === `${ano}-${String(mes + 1).padStart(2, '0')}`;

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable
          style={[estilos.painel, largo && { maxWidth: 900 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={estilos.cabecalho}>
            <View style={estilos.selo}>
              <MaterialCommunityIcons name="calendar-month" size={26} color={cores.laranja} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={estilos.titulo}>Agendar atendimento</Text>
              <Text style={estilos.subtitulo}>
                Para {pet?.nome} <Text style={estilos.ponto}>•</Text> Dra. Helena Prado
              </Text>
            </View>

            <Pressable onPress={onFechar} hitSlop={10} style={estilos.fechar}>
              <Ionicons name="close" size={20} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={estilos.rotulo}>Motivo do atendimento</Text>
            <View style={estilos.motivos}>
              {MOTIVOS.map((opcao) => {
                const ativo = motivo === opcao;
                return (
                  <Pressable
                    key={opcao}
                    onPress={() => setMotivo(opcao)}
                    style={[estilos.motivo, ativo && estilos.motivoAtivo]}
                  >
                    {ativo && (
                      <Ionicons name="checkmark-circle" size={16} color={cores.laranja} />
                    )}
                    <Text style={[estilos.motivoTexto, ativo && estilos.motivoTextoAtivo]}>
                      {opcao}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[estilos.colunas, largo && estilos.colunasLado]}>
              {/* Calendário do mês */}
              <View style={[estilos.bloco, largo && { flex: 1 }]}>
                <View style={estilos.navegacaoMes}>
                  <Pressable onPress={() => mudarMes(-1)} hitSlop={10} style={estilos.seta}>
                    <Ionicons name="chevron-back" size={20} color={cores.textoSecundario} />
                  </Pressable>

                  <Text style={estilos.mesTitulo}>
                    {MESES[mes]} {ano}
                  </Text>

                  <Pressable onPress={() => mudarMes(1)} hitSlop={10} style={estilos.seta}>
                    <Ionicons name="chevron-forward" size={20} color={cores.textoSecundario} />
                  </Pressable>
                </View>

                <View style={estilos.semana}>
                  {DIAS_SEMANA.map((dia) => (
                    <Text key={dia} style={estilos.semanaTexto}>
                      {dia}
                    </Text>
                  ))}
                </View>

                <View style={estilos.grade}>
                  {celulasDoMes(ano, mes).map((dia, indice) => {
                    if (dia === null) {
                      return <View key={`vazio-${indice}`} style={estilos.celula} />;
                    }

                    const vagas = vagasPorDia.get(dia) ?? 0;
                    const disponivel = vagas > 0;
                    const selecionado = mesSelecionado && dia === diaSelecionado;

                    return (
                      <Pressable
                        key={dia}
                        disabled={!disponivel}
                        onPress={() => escolherDia(dia)}
                        style={[
                          estilos.celula,
                          disponivel && estilos.celulaLivre,
                          selecionado && estilos.celulaEscolhida,
                        ]}
                      >
                        <Text
                          style={[
                            estilos.celulaTexto,
                            disponivel && estilos.celulaTextoLivre,
                            selecionado && estilos.celulaTextoEscolhido,
                          ]}
                        >
                          {dia}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={estilos.legenda}>
                  <View style={estilos.legendaItem}>
                    <View style={[estilos.bolinha, { backgroundColor: cores.primaria }]} />
                    <Text style={estilos.legendaTexto}>Dias disponíveis</Text>
                  </View>
                  <View style={estilos.legendaItem}>
                    <View style={[estilos.bolinha, { backgroundColor: cores.superficieAlt }]} />
                    <Text style={estilos.legendaTexto}>Indisponível</Text>
                  </View>
                </View>
              </View>

              {/* Horários do dia escolhido */}
              <View style={[estilos.bloco, largo && { flex: 1 }]}>
                <View style={estilos.tituloBloco}>
                  <Ionicons name="time" size={22} color={cores.laranja} />
                  <Text style={estilos.tituloBlocoTexto}>Horários disponíveis</Text>
                </View>

                {isLoading ? (
                  <View style={estilos.vazio}>
                    <ActivityIndicator color={cores.primaria} />
                  </View>
                ) : !agenda?.atende || agenda.horarios.length === 0 ? (
                  <View style={estilos.vazio}>
                    <MaterialCommunityIcons
                      name="calendar-remove"
                      size={24}
                      color={cores.textoSuave}
                    />
                    <Text style={estilos.vazioTexto}>
                      {agenda?.observacao ?? 'Sem horários neste dia'}
                    </Text>
                  </View>
                ) : (
                  <View style={estilos.horarios}>
                    {agenda.horarios.map((h) => {
                      const ativo = horario === h;
                      return (
                        <Pressable
                          key={h}
                          onPress={() => setHorario(h)}
                          style={[estilos.horario, ativo && estilos.horarioAtivo]}
                        >
                          <Text
                            style={[estilos.horarioTexto, ativo && estilos.horarioTextoAtivo]}
                          >
                            {h.slice(0, 5)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                <View style={estilos.info}>
                  <View style={estilos.infoLinha}>
                    <Ionicons name="information-circle" size={18} color={cores.laranja} />
                    <Text style={estilos.infoTexto}>
                      O atendimento dura{' '}
                      <Text style={estilos.infoDestaque}>
                        aproximadamente {agenda?.duracaoMinutos ?? 30} minutos
                      </Text>
                      .
                    </Text>
                  </View>

                  <View style={estilos.divisor} />

                  <View style={estilos.infoLinha}>
                    <Ionicons name="location" size={18} color={cores.laranja} />
                    <View style={{ flex: 1 }}>
                      <Text style={estilos.infoTitulo}>{agenda?.clinica ?? 'Clínica'}</Text>
                      <Text style={estilos.infoEndereco}>{agenda?.endereco}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

          </ScrollView>

          {!!erro && <Text style={estilos.erro}>{erro}</Text>}

          <Botao
            titulo="Confirmar agendamento"
            variante="laranja"
            icone="calendar"
            onPress={confirmar}
            desabilitado={!horario}
            carregando={agendar.isPending}
            estilo={estilos.confirmar}
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
    borderRadius: raios.xl,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    maxWidth: 460,
    maxHeight: '92%',
    width: '100%',
    alignSelf: 'center',
    gap: espacamentos.sm,
  },

  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  selo: {
    width: 44,
    height: 44,
    borderRadius: raios.md,
    backgroundColor: cores.laranjaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { ...tipografia.titulo, fontSize: 21, color: cores.textoPrincipal },
  subtitulo: { fontSize: 13, color: cores.textoSecundario, marginTop: 1 },
  ponto: { color: cores.laranja },
  fechar: {
    width: 34,
    height: 34,
    borderRadius: raios.sm,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.textoSecundario,
    marginTop: espacamentos.sm,
    marginBottom: espacamentos.sm,
  },
  motivos: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.sm },
  motivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 2,
    borderRadius: raios.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  motivoAtivo: { borderColor: cores.laranja, backgroundColor: cores.laranjaSuave },
  motivoTexto: { color: cores.textoSecundario, fontSize: 13, fontWeight: '600' },
  motivoTextoAtivo: { color: cores.laranja, fontWeight: '700' },

  colunas: { gap: espacamentos.sm, marginTop: espacamentos.md },
  colunasLado: { flexDirection: 'row', alignItems: 'flex-start' },
  bloco: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
  },

  navegacaoMes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamentos.sm,
  },
  seta: {
    width: 30,
    height: 30,
    borderRadius: raios.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesTitulo: { fontSize: 16, fontWeight: '700', color: cores.textoPrincipal },

  semana: { flexDirection: 'row' },
  semanaTexto: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: cores.textoSuave,
    marginBottom: espacamentos.xs,
  },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  celulaLivre: { borderColor: 'rgba(34, 211, 160, 0.45)' },
  celulaEscolhida: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  celulaTexto: { fontSize: 14, color: cores.textoSuave },
  celulaTextoLivre: { color: cores.textoPrincipal, fontWeight: '700' },
  celulaTextoEscolhido: { color: '#04261C', fontWeight: '800' },

  legenda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    marginTop: espacamentos.sm,
    paddingTop: espacamentos.sm,
  },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bolinha: { width: 10, height: 10, borderRadius: raios.pill },
  legendaTexto: { fontSize: 12, color: cores.textoSecundario },

  tituloBloco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    marginBottom: espacamentos.md,
  },
  tituloBlocoTexto: { fontSize: 16, fontWeight: '700', color: cores.textoPrincipal },

  horarios: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.sm },
  horario: {
    flexGrow: 1,
    flexBasis: '28%',
    alignItems: 'center',
    paddingVertical: espacamentos.sm + 4,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlt,
  },
  horarioAtivo: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  horarioTexto: { fontSize: 14, fontWeight: '700', color: cores.textoPrincipal },
  horarioTextoAtivo: { color: cores.primaria },

  vazio: { alignItems: 'center', gap: espacamentos.sm, paddingVertical: espacamentos.lg },
  vazioTexto: { color: cores.textoSecundario, fontSize: 12, textAlign: 'center' },

  info: {
    backgroundColor: cores.superficieAlt,
    borderRadius: raios.md,
    padding: espacamentos.md,
    marginTop: espacamentos.md,
    gap: espacamentos.sm,
  },
  infoLinha: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.sm },
  infoTexto: { flex: 1, fontSize: 13, color: cores.textoSecundario, lineHeight: 19 },
  infoDestaque: { color: cores.laranja, fontWeight: '700' },
  infoTitulo: { fontSize: 13, fontWeight: '700', color: cores.textoPrincipal },
  infoEndereco: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
  divisor: { height: 1, backgroundColor: cores.borda },

  confirmar: { borderRadius: raios.pill, marginTop: espacamentos.sm },
  erro: { color: cores.erro, fontSize: 12, marginTop: espacamentos.sm },
});
