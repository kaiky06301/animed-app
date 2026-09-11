import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgendarAtendimento } from '../components/AgendarAtendimento';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../api/cliente';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { IconePet } from '../components/IconePet';
import { useFotoPet } from '../hooks/useFotoPet';
import { useQuery } from '@tanstack/react-query';
import * as consultaService from '../services/consultaService';
import { usePet } from '../hooks/usePet';
import { useTutor } from '../hooks/useTutor';
import { useVacinas } from '../hooks/useVacinas';
import type { RaizParamList } from '../navigation/tipos';
import type { Vacina } from '../services/tipos';
import { isoParaBr } from '../utils/data';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

type Props = NativeStackScreenProps<RaizParamList, 'Vacinas'>;

/** Cores dos marcadores, para diferenciar as vacinas na lista. */
const CORES_MARCADOR = ['#3B82F6', '#FF8A3D', '#7C5CFF', '#22D3A0', '#F472B6'];

type LinhaLista =
  | { tipo: 'ano'; ano: string }
  | { tipo: 'vacina'; vacina: Vacina; cor: string };

/**
 * Carteira de vacinas do pet, na visão do tutor.
 *
 * Somente leitura: o histórico é preenchido pelo veterinário a cada
 * aplicação, e cada registro credita pontos ao tutor.
 */
export function VacinasScreen({ route }: Props) {
  const { idPet, nomePet } = route.params;

  const { data: vacinas, isLoading, isRefetching, refetch, isError, error } = useVacinas(idPet);
  const { data: pet } = usePet(idPet);
  const { data: tutor } = useTutor();
  const { uri: fotoPet } = useFotoPet(idPet);

  const [anoFiltro, setAnoFiltro] = useState<string | null>(null);
  const [filtroAberto, setFiltroAberto] = useState(false);

  const hoje = new Date();

  const anos = useMemo(() => {
    const encontrados = new Set((vacinas ?? []).map((v) => v.dataAplicacao.slice(0, 4)));
    return Array.from(encontrados).sort((a, b) => Number(b) - Number(a));
  }, [vacinas]);

  /** Vacinas da mais recente para a mais antiga, com separador de ano. */
  const linhas = useMemo<LinhaLista[]>(() => {
    const ordenadas = [...(vacinas ?? [])]
      .filter((v) => !anoFiltro || v.dataAplicacao.startsWith(anoFiltro))
      .sort((a, b) => (a.dataAplicacao < b.dataAplicacao ? 1 : -1));

    const resultado: LinhaLista[] = [];
    let anoAnterior: string | null = null;

    ordenadas.forEach((vacina, indice) => {
      const ano = vacina.dataAplicacao.slice(0, 4);

      // O ano aparece como separador a partir da segunda faixa exibida
      if (anoAnterior !== null && ano !== anoAnterior) {
        resultado.push({ tipo: 'ano', ano });
      }
      anoAnterior = ano;

      resultado.push({
        tipo: 'vacina',
        vacina,
        cor: CORES_MARCADOR[indice % CORES_MARCADOR.length],
      });
    });

    return resultado;
  }, [vacinas, anoFiltro]);

  /** Aplicação futura mais próxima, considerando as próximas doses. */
  const proximaDose = useMemo(() => {
    const futuras = (vacinas ?? [])
      .filter((v) => v.dataProximaDose && new Date(v.dataProximaDose) >= hoje)
      .sort((a, b) => ((a.dataProximaDose ?? '') < (b.dataProximaDose ?? '') ? -1 : 1));

    return futuras[0] ?? null;
  }, [vacinas]);

  const atrasadas = useMemo(
    () => (vacinas ?? []).filter((v) => v.dataProximaDose && new Date(v.dataProximaDose) < hoje),
    [vacinas],
  );

  /**
   * Situação do calendário. Só afirma que está em dia quando existe ao
   * menos uma vacina com próxima dose acompanhada e nenhuma vencida —
   * sem histórico, ou sem reforço previsto, não há o que garantir.
   */
  const situacao: 'em-dia' | 'atrasado' | 'sem-historico' | 'sem-previsao' = useMemo(() => {
    if (!vacinas?.length) return 'sem-historico';
    if (atrasadas.length > 0) return 'atrasado';
    if (!vacinas.some((v) => v.dataProximaDose)) return 'sem-previsao';
    return 'em-dia';
  }, [vacinas, atrasadas]);

  const emDia = situacao === 'em-dia';
  const alerta = situacao === 'atrasado';

  /**
   * Dose que motiva o agendamento: a vencida tem prioridade sobre a
   * prevista, porque é a que já deveria ter sido aplicada.
   */
  const [agendandoVacina, setAgendandoVacina] = useState<Vacina | null>(null);

  const { data: atendimentos } = useQuery({
    queryKey: ['consultas', idPet],
    queryFn: () => consultaService.listarConsultasDoPet(idPet),
  });

  /** Vacinações já marcadas, pelo nome da vacina. */
  const jaMarcadas = useMemo(() => {
    const mapa = new Map<string, string>();

    (atendimentos ?? [])
      .filter((c) => c.status === 'AGENDADA' && new Date(c.dataHora) >= hoje)
      .forEach((c) => mapa.set(c.motivo, c.dataHora));

    return mapa;
  }, [atendimentos]);

  if (isLoading) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={cores.primaria} size="large" />
        <Text style={estilos.textoSuave}>Carregando vacinas…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={estilos.centro}>
        <Ionicons name="cloud-offline-outline" size={40} color={cores.textoSuave} />
        <Text style={estilos.tituloErro}>Não foi possível carregar</Text>
        <Text style={estilos.textoSuave}>{mensagemDoErro(error)}</Text>
        <Botao titulo="Tentar de novo" variante="contorno" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={estilos.fundo}>
      <FlatList
        data={linhas}
        keyExtractor={(linha, i) =>
          linha.tipo === 'ano' ? `ano-${linha.ano}` : `vacina-${linha.vacina.id}-${i}`
        }
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={cores.primaria} />
        }
        ListHeaderComponent={
          <View>
            <Text style={estilos.subtituloTela}>Histórico e próximas aplicações</Text>

            {/* Identificação do pet e pontuação do tutor */}
            <View style={estilos.linhaPet}>
              <View style={estilos.molduraFoto}>
                {fotoPet ? (
                  <Image source={{ uri: fotoPet }} style={estilos.foto} />
                ) : (
                  <View style={estilos.fotoVazia}>
                    <IconePet especie={pet?.especie} tamanho={32} cor={cores.laranja} />
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={estilos.linhaNome}>
                  <Text style={estilos.nomePet}>{pet?.nome ?? nomePet}</Text>
                  {!!pet?.sexo && (
                    <Ionicons
                      name={pet.sexo === 'FEMEA' ? 'female' : 'male'}
                      size={17}
                      color={pet.sexo === 'FEMEA' ? '#F472B6' : '#3B82F6'}
                    />
                  )}
                </View>

                <Text style={estilos.detalhePet}>
                  {[
                    pet?.raca || 'Sem raça definida',
                    pet?.idadeAnos != null ? `${pet.idadeAnos} anos` : null,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </Text>
              </View>

              <View style={estilos.seloPontos}>
                <Ionicons name="paw" size={13} color={cores.laranja} />
                <Text style={estilos.seloPontosTexto}>
                  {(tutor?.pontosTotais ?? 0).toLocaleString('pt-BR')} pts
                </Text>
                <Ionicons name="star" size={12} color={cores.dourado} />
              </View>
            </View>

            {/* Com reforços vencidos, cada um ganha o próprio cartão abaixo:
                a faixa repetiria a mesma informação em outras palavras. */}
            {!alerta && (
            <View
              style={[
                estilos.faixaStatus,
                alerta && estilos.faixaStatusAlerta,
                !emDia && !alerta && estilos.faixaStatusNeutra,
              ]}
            >
              <Ionicons
                name={
                  emDia ? 'shield-checkmark' : alerta ? 'alert-circle' : 'shield-outline'
                }
                size={30}
                color={emDia ? cores.primaria : alerta ? cores.alerta : cores.textoSuave}
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    estilos.statusTitulo,
                    alerta && { color: cores.alerta },
                    !emDia && !alerta && { color: cores.textoSecundario },
                  ]}
                >
                  {emDia
                    ? 'Calendário em dia!'
                    : alerta
                      ? 'Vacinas atrasadas'
                      : situacao === 'sem-historico'
                        ? 'Sem histórico de vacinas'
                        : 'Sem reforço previsto'}
                </Text>

                <Text style={estilos.statusTexto}>
                  {emDia
                    ? `O ${pet?.nome ?? nomePet} está com todas as vacinas em dia.`
                    : alerta
                      ? `${atrasadas.length} ${
                          atrasadas.length === 1 ? 'vacina precisa' : 'vacinas precisam'
                        } de reforço.`
                      : situacao === 'sem-historico'
                        ? 'Nenhuma aplicação foi registrada pelo veterinário ainda.'
                        : 'As vacinas aplicadas não têm data de reforço informada.'}
                </Text>
              </View>

              <Ionicons
                name="paw"
                size={22}
                color={emDia ? cores.primaria : alerta ? cores.alerta : cores.textoSuave}
              />
            </View>
            )}

            {/* O que precisa ser feito vem antes do que já foi feito */}
            {atrasadas.map((v) => {
              const marcada = jaMarcadas.get(motivoVacinacao(v.nomeVacina));

              return (
                <Pressable
                  key={v.id}
                  disabled={!!marcada}
                  onPress={() => setAgendandoVacina(v)}
                  style={({ pressed }) => [
                    estilos.reforco,
                    !!marcada && estilos.reforcoMarcado,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <View style={[estilos.reforcoIcone, !!marcada && estilos.iconeMarcado]}>
                    <MaterialCommunityIcons
                      name="needle"
                      size={20}
                      color={marcada ? cores.primaria : cores.erro}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={estilos.reforcoNome}>{v.nomeVacina}</Text>

                    {marcada ? (
                      <Text style={estilos.reforcoMarcadoTexto}>
                        Aplicação marcada para {dataHoraCurta(marcada)}
                      </Text>
                    ) : (
                      <>
                        <Text style={estilos.reforcoPrazo}>
                          Reforço venceu em {isoParaBr(v.dataProximaDose)}
                          {' · '}
                          {diasDesde(v.dataProximaDose!)}
                        </Text>
                        <Text style={estilos.reforcoAcao}>Toque para marcar a aplicação</Text>
                      </>
                    )}
                  </View>

                  {marcada ? (
                    <Ionicons name="checkmark-circle" size={20} color={cores.primaria} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={cores.erro} />
                  )}
                </Pressable>
              );
            })}

            {/* Título da lista e filtro por ano */}
            <View style={estilos.cabecalhoLista}>
              <Text style={estilos.tituloLista}>Histórico de vacinas</Text>

              {anos.length > 1 && (
                <Pressable
                  onPress={() => setFiltroAberto((a) => !a)}
                  style={({ pressed }) => [estilos.filtro, pressed && { opacity: 0.7 }]}
                >
                  <Text style={estilos.filtroTexto}>{anoFiltro ?? 'Todas'}</Text>
                  <Ionicons
                    name={filtroAberto ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color={cores.textoSecundario}
                  />
                </Pressable>
              )}
            </View>

            {filtroAberto && (
              <View style={estilos.opcoesFiltro}>
                <OpcaoFiltro
                  rotulo="Todas"
                  ativa={anoFiltro === null}
                  onPress={() => {
                    setAnoFiltro(null);
                    setFiltroAberto(false);
                  }}
                />
                {anos.map((ano) => (
                  <OpcaoFiltro
                    key={ano}
                    rotulo={ano}
                    ativa={anoFiltro === ano}
                    onPress={() => {
                      setAnoFiltro(ano);
                      setFiltroAberto(false);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <Cartao style={estilos.vazio}>
            <Ionicons name="medkit-outline" size={36} color={cores.primaria} />
            <Text style={estilos.vazioTitulo}>Nenhuma vacina registrada</Text>
            <Text style={estilos.textoSuave}>
              Assim que o veterinário registrar uma aplicação, ela aparece aqui.
            </Text>
          </Cartao>
        }
        renderItem={({ item }) =>
          item.tipo === 'ano' ? (
            <View style={estilos.separadorAno}>
              <Text style={estilos.separadorAnoTexto}>{item.ano}</Text>
              <View style={estilos.separadorLinha} />
            </View>
          ) : (
            <ItemVacina
              vacina={item.vacina}
              cor={item.cor}
              agendadaPara={jaMarcadas.get(motivoVacinacao(item.vacina.nomeVacina))}
            />
          )
        }
        ListFooterComponent={
          <>
          {proximaDose ? (
            <Pressable
              onPress={() => setAgendandoVacina(proximaDose)}
              style={({ pressed }) => [estilos.proxima, pressed && { opacity: 0.75 }]}
            >
              <Ionicons name="paw" size={26} color={cores.laranja} />

              <View style={{ flex: 1 }}>
                <Text style={estilos.proximaTitulo}>Próxima vacina</Text>
                <Text style={estilos.proximaTexto}>
                  A próxima aplicação está prevista para{' '}
                  <Text style={estilos.proximaData}>{isoParaBr(proximaDose.dataProximaDose)}</Text>{' '}
                  ({proximaDose.nomeVacina}).
                </Text>

                {!!proximaDose.veterinarioResponsavel && (
                  <Text style={estilos.proximaOrigem}>
                    Indicada por {proximaDose.veterinarioResponsavel} na última aplicação.
                  </Text>
                )}

                <Text style={estilos.proximaAcao}>Toque para marcar a aplicação</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={cores.laranja} />
            </Pressable>
          ) : null}
          </>
        }
      />

      {/* A vacinação é marcada como atendimento, com a dose no motivo */}
      <AgendarAtendimento
        visivel={!!agendandoVacina}
        pet={pet ?? null}
        motivoFixo={motivoVacinacao(agendandoVacina?.nomeVacina ?? '')}
        onFechar={() => setAgendandoVacina(null)}
        onConfirmado={() => setAgendandoVacina(null)}
      />
    </View>
  );
}

/** "2026-09-15T09:00" -> "15/09 às 09:00" */
function dataHoraCurta(iso: string): string {
  const data = new Date(iso);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes} às ${hora}:${minuto}`;
}

/** "2026-08-11" -> "há 1 mês" / "há 12 dias" */
function diasDesde(iso: string): string {
  const dias = Math.floor(
    (Date.now() - new Date(`${iso}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dias < 1) return 'vence hoje';
  if (dias === 1) return 'há 1 dia';
  if (dias < 30) return `há ${dias} dias`;

  const meses = Math.floor(dias / 30);
  return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;
}

/**
 * Motivo com que a vacinação entra na agenda.
 *
 * A mesma função monta o motivo ao marcar e o reconhece depois, para que a
 * carteira saiba que aquela dose já tem atendimento marcado.
 */
function motivoVacinacao(nomeVacina: string): string {
  return `Vacinação - ${nomeVacina}`;
}

function OpcaoFiltro({
  rotulo,
  ativa,
  onPress,
}: {
  rotulo: string;
  ativa: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        estilos.opcaoFiltro,
        ativa && estilos.opcaoFiltroAtiva,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[estilos.opcaoFiltroTexto, ativa && { color: cores.primaria }]}>{rotulo}</Text>
    </Pressable>
  );
}

function ItemVacina({
  vacina,
  cor,
  agendadaPara,
}: {
  vacina: Vacina;
  cor: string;
  agendadaPara?: string;
}) {
  const vencida =
    !agendadaPara
    && !!vacina.dataProximaDose
    && new Date(vacina.dataProximaDose) < new Date();

  return (
    <Cartao style={estilos.item}>
      <View style={[estilos.marcador, { backgroundColor: cor }]}>
        {/* seringa: representa a aplicação da vacina */}
        <MaterialCommunityIcons name="needle" size={21} color="#FFFFFF" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={estilos.itemNome}>{vacina.nomeVacina}</Text>

        <View style={estilos.itemLinha}>
          <Ionicons name="calendar-outline" size={13} color={cores.textoSuave} />
          <Text style={estilos.itemDetalhe}>Aplicada em {isoParaBr(vacina.dataAplicacao)}</Text>
        </View>

        {!!vacina.veterinarioResponsavel && (
          <View style={estilos.itemLinha}>
            <Ionicons name="person-outline" size={13} color={cores.textoSuave} />
            <Text style={estilos.itemDetalhe}>{vacina.veterinarioResponsavel}</Text>
          </View>
        )}
      </View>

      <View
        style={[
          estilos.selo,
          vencida && estilos.seloAtrasado,
          !!agendadaPara && estilos.seloAgendado,
        ]}
      >
        <Ionicons
          name={agendadaPara ? 'calendar' : vencida ? 'alert-circle' : 'checkmark-circle'}
          size={13}
          color={agendadaPara ? cores.laranja : vencida ? cores.alerta : cores.primaria}
        />
        <Text
          style={[
            estilos.seloTexto,
            vencida && { color: cores.alerta },
            !!agendadaPara && { color: cores.laranja },
          ]}
        >
          {agendadaPara ? 'Agendada' : vencida ? 'Reforço' : 'Aplicada'}
        </Text>
      </View>
    </Cartao>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  centro: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamentos.lg,
    gap: espacamentos.sm,
  },
  lista: {
    padding: espacamentos.md,
    paddingBottom: espacamentos.xxl,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  subtituloTela: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginBottom: espacamentos.md,
  },
  linhaPet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    marginBottom: espacamentos.md,
  },
  molduraFoto: {
    width: 62,
    height: 62,
    borderRadius: raios.pill,
    borderWidth: 2,
    borderColor: cores.laranja,
    overflow: 'hidden',
  },
  foto: { width: '100%', height: '100%' },
  fotoVazia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieAlt,
  },
  linhaNome: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nomePet: { ...tipografia.titulo, color: cores.textoPrincipal, fontSize: 20 },
  detalhePet: { ...tipografia.legenda, color: cores.textoSecundario, marginTop: 1 },
  seloPontos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: raios.pill,
    backgroundColor: '#3A2A18',
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.4)',
  },
  seloPontosTexto: { color: '#F6E7D3', fontSize: 12, fontWeight: '800' },
  faixaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    backgroundColor: 'rgba(34,211,160,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,160,0.45)',
    borderRadius: raios.lg,
    padding: espacamentos.md,
    marginBottom: espacamentos.lg,
  },
  faixaStatusAlerta: {
    backgroundColor: 'rgba(255,180,84,0.10)',
    borderColor: 'rgba(255,180,84,0.45)',
  },
  faixaStatusNeutra: {
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
  },
  statusTitulo: { color: cores.primaria, fontSize: 16, fontWeight: '800' },
  statusTexto: { color: cores.textoSecundario, fontSize: 13, marginTop: 1 },
  cabecalhoLista: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamentos.sm,
  },
  tituloLista: { ...tipografia.titulo, color: cores.textoPrincipal, fontSize: 19 },
  filtro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm,
    borderRadius: raios.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  filtroTexto: { color: cores.textoPrincipal, fontSize: 13, fontWeight: '600' },
  opcoesFiltro: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.xs,
    marginBottom: espacamentos.sm,
  },
  opcaoFiltro: {
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm,
    borderRadius: raios.pill,
    backgroundColor: cores.superficieAlt,
  },
  opcaoFiltroAtiva: { backgroundColor: cores.primariaSuave },
  opcaoFiltroTexto: { color: cores.textoSecundario, fontSize: 13, fontWeight: '600' },
  separadorAno: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    marginTop: espacamentos.sm,
    marginBottom: espacamentos.sm,
  },
  separadorAnoTexto: { color: cores.textoSuave, fontSize: 12, fontWeight: '700' },
  separadorLinha: { flex: 1, height: 1, backgroundColor: cores.borda },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    marginBottom: espacamentos.sm,
  },
  marcador: {
    width: 46,
    height: 46,
    borderRadius: raios.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNome: { ...tipografia.subtitulo, color: cores.textoPrincipal, fontSize: 15 },
  itemLinha: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  itemDetalhe: { color: cores.textoSecundario, fontSize: 12 },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: raios.pill,
    backgroundColor: cores.primariaSuave,
  },
  seloAtrasado: { backgroundColor: 'rgba(255,180,84,0.16)' },
  seloTexto: { color: cores.primaria, fontSize: 11, fontWeight: '700' },
  vazio: { alignItems: 'center', gap: espacamentos.xs, paddingVertical: espacamentos.lg },
  vazioTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  tituloErro: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  textoSuave: { ...tipografia.legenda, color: cores.textoSecundario, textAlign: 'center' },
  proxima: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    backgroundColor: 'rgba(255,138,61,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.40)',
    borderRadius: raios.lg,
    padding: espacamentos.md,
    marginTop: espacamentos.md,
  },
  reforco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.45)',
    backgroundColor: 'rgba(255,107,107,0.07)',
    borderRadius: raios.md,
    padding: espacamentos.md,
    marginBottom: espacamentos.sm,
  },
  reforcoIcone: {
    width: 40,
    height: 40,
    borderRadius: raios.pill,
    backgroundColor: 'rgba(255,107,107,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reforcoNome: { fontSize: 15, fontWeight: '700', color: cores.textoPrincipal },
  reforcoPrazo: { fontSize: 12, color: cores.erro, marginTop: 1 },
  reforcoAcao: { fontSize: 11, color: cores.textoSuave, marginTop: 3 },
  reforcoMarcado: {
    borderColor: 'rgba(34,211,160,0.45)',
    backgroundColor: cores.primariaSuave,
  },
  reforcoMarcadoTexto: { fontSize: 12, color: cores.primaria, marginTop: 2 },
  iconeMarcado: { backgroundColor: 'rgba(34,211,160,0.16)' },
  seloAgendado: { backgroundColor: cores.laranjaSuave },
  proximaAcao: { fontSize: 11, color: cores.textoSuave, marginTop: 4 },
  agendar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: cores.laranja,
    borderRadius: raios.md,
    paddingVertical: espacamentos.sm,
    marginTop: espacamentos.sm,
  },
  agendarTexto: { fontSize: 13, fontWeight: '700', color: cores.laranja },
  proximaTitulo: { color: cores.laranja, fontSize: 15, fontWeight: '800' },
  proximaTexto: { color: cores.textoSecundario, fontSize: 13, marginTop: 2, lineHeight: 18 },
  proximaData: { color: cores.laranja, fontWeight: '800' },
  proximaOrigem: { color: cores.textoSuave, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
});
