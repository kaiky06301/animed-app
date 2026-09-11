import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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
import { useConcluirAtendimento, useDisponibilidade } from '../hooks/useAgenda';
import type { Atendimento } from '../services/tipos';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';
import { Botao } from './Botao';

interface Props {
  atendimento: Atendimento | null;
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function paraIso(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(
    data.getDate(),
  ).padStart(2, '0')}`;
}

/** Dias oferecidos para o retorno, a partir de uma semana depois. */
function diasDeRetorno(quantidade: number): Date[] {
  const inicio = new Date();
  inicio.setDate(inicio.getDate() + 7);

  return Array.from({ length: quantidade }, (_, i) => {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + i);
    return dia;
  });
}

/**
 * Fechamento do atendimento pelo veterinário.
 *
 * Além de dar o atendimento por realizado — o que credita os pontos ao
 * tutor —, é aqui que o profissional decide se o caso pede retorno e em
 * que horário da própria agenda ele fica reservado.
 */
export function ConcluirAtendimento({ atendimento, onFechar, onConcluido }: Props) {
  const dias = useMemo(() => diasDeRetorno(21), []);

  const [querRetorno, setQuerRetorno] = useState(false);
  const [dataRetorno, setDataRetorno] = useState(paraIso(dias[0]));
  const [horario, setHorario] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const { data: agenda, isLoading } = useDisponibilidade(querRetorno ? dataRetorno : null);
  const concluir = useConcluirAtendimento();

  useEffect(() => {
    if (atendimento) {
      setQuerRetorno(false);
      setHorario(null);
      setErro(null);
    }
  }, [atendimento]);

  async function confirmar() {
    if (!atendimento) return;

    if (querRetorno && !horario) {
      setErro('Escolha o horário do retorno');
      return;
    }

    setErro(null);

    try {
      const resultado = await concluir.mutateAsync({
        idConsulta: atendimento.idConsulta,
        retorno: querRetorno ? `${dataRetorno}T${horario}:00` : null,
      });

      const [ano, mes, dia] = dataRetorno.split('-');
      onConcluido(
        querRetorno
          ? `Atendimento concluído. Retorno marcado para ${dia}/${mes}/${ano} às ${horario?.slice(
              0,
              5,
            )}.`
          : `Atendimento concluído. O tutor recebeu ${resultado.pontosCreditados} pontos.`,
      );
      onFechar();
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível concluir o atendimento'));
    }
  }

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
            <View style={{ flex: 1 }}>
              <Text style={estilos.titulo}>Concluir atendimento</Text>
              <Text style={estilos.subtitulo}>
                {atendimento?.nomePet} · {atendimento?.horario.slice(0, 5)} ·{' '}
                {atendimento?.motivo}
              </Text>
            </View>
            <Pressable onPress={onFechar} hitSlop={10} style={estilos.fechar}>
              <Ionicons name="close" size={20} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={estilos.rotulo}>Este caso precisa de retorno?</Text>

            <View style={estilos.escolhas}>
              <Pressable
                onPress={() => setQuerRetorno(false)}
                style={[estilos.escolha, !querRetorno && estilos.escolhaAtiva]}
              >
                <Ionicons
                  name={!querRetorno ? 'radio-button-on' : 'radio-button-off'}
                  size={17}
                  color={!querRetorno ? cores.primaria : cores.textoSuave}
                />
                <Text style={[estilos.escolhaTexto, !querRetorno && estilos.escolhaTextoAtivo]}>
                  Alta, sem retorno
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setQuerRetorno(true)}
                style={[estilos.escolha, querRetorno && estilos.escolhaAtiva]}
              >
                <Ionicons
                  name={querRetorno ? 'radio-button-on' : 'radio-button-off'}
                  size={17}
                  color={querRetorno ? cores.primaria : cores.textoSuave}
                />
                <Text style={[estilos.escolhaTexto, querRetorno && estilos.escolhaTextoAtivo]}>
                  Marcar retorno
                </Text>
              </Pressable>
            </View>

            {querRetorno && (
              <>
                <Text style={estilos.rotulo}>Data do retorno</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: espacamentos.xs }}
                >
                  {dias.map((dia) => {
                    const iso = paraIso(dia);
                    const ativo = dataRetorno === iso;

                    return (
                      <Pressable
                        key={iso}
                        onPress={() => {
                          setDataRetorno(iso);
                          setHorario(null);
                        }}
                        style={[estilos.dia, ativo && estilos.diaAtivo]}
                      >
                        <Text style={[estilos.diaSemana, ativo && { color: cores.primaria }]}>
                          {DIAS_SEMANA[dia.getDay()]}
                        </Text>
                        <Text style={[estilos.diaNumero, ativo && { color: cores.primaria }]}>
                          {dia.getDate()}
                        </Text>
                        <Text style={estilos.diaMes}>{MESES[dia.getMonth()]}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Text style={estilos.rotulo}>Horário</Text>

                {isLoading ? (
                  <ActivityIndicator color={cores.primaria} style={{ marginVertical: 12 }} />
                ) : !agenda?.atende || agenda.horarios.length === 0 ? (
                  <Text style={estilos.semHorario}>
                    {agenda?.observacao ?? 'Sem horários livres neste dia'}
                  </Text>
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
                            style={[estilos.horarioTexto, ativo && { color: cores.primaria }]}
                          >
                            {h.slice(0, 5)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {!!erro && <Text style={estilos.erro}>{erro}</Text>}

          <Botao
            titulo={querRetorno ? 'Concluir e marcar retorno' : 'Concluir atendimento'}
            icone="checkmark-circle-outline"
            onPress={confirmar}
            carregando={concluir.isPending}
            estilo={{ marginTop: espacamentos.sm }}
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

  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoSecundario,
    marginTop: espacamentos.md,
    marginBottom: espacamentos.sm,
  },
  escolhas: { gap: espacamentos.xs },
  escolha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
  },
  escolhaAtiva: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  escolhaTexto: { fontSize: 13, color: cores.textoSecundario, fontWeight: '600' },
  escolhaTextoAtivo: { color: cores.textoPrincipal },

  dia: {
    width: 54,
    paddingVertical: espacamentos.sm,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
  },
  diaAtivo: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  diaSemana: { color: cores.textoSuave, fontSize: 11, fontWeight: '700' },
  diaNumero: { color: cores.textoPrincipal, fontSize: 16, fontWeight: '800' },
  diaMes: { color: cores.textoSuave, fontSize: 10 },

  horarios: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.xs + 2 },
  horario: {
    flexGrow: 1,
    flexBasis: '21%',
    alignItems: 'center',
    paddingVertical: espacamentos.sm,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlt,
  },
  horarioAtivo: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  horarioTexto: { fontSize: 13, fontWeight: '700', color: cores.textoPrincipal },
  semHorario: { fontSize: 12, color: cores.textoSuave },

  erro: { color: cores.erro, fontSize: 12, marginTop: espacamentos.sm },
});
