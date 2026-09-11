import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
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
import { useAgendar, useDisponibilidade } from '../hooks/useAgenda';
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

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/** Próximos dias oferecidos ao tutor para escolher o atendimento. */
function proximosDias(quantidade: number): Date[] {
  const hoje = new Date();
  return Array.from({ length: quantidade }, (_, i) => {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() + i);
    return dia;
  });
}

function paraIso(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(
    data.getDate(),
  ).padStart(2, '0')}`;
}

/**
 * Marcação de atendimento na clínica.
 *
 * Os horários vêm da agenda real: respeitam o expediente, o intervalo de
 * almoço e os horários já ocupados por outros pacientes.
 */
export function AgendarAtendimento({
  visivel,
  pet,
  motivoInicial = 'Check-up preventivo',
  onFechar,
  onConfirmado,
}: Props) {
  const dias = useMemo(() => proximosDias(14), []);

  const [dataEscolhida, setDataEscolhida] = useState(paraIso(dias[0]));
  const [horario, setHorario] = useState<string | null>(null);
  const [motivo, setMotivo] = useState(motivoInicial);
  const [erro, setErro] = useState<string | null>(null);

  const { data: agenda, isLoading } = useDisponibilidade(visivel ? dataEscolhida : null);
  const agendar = useAgendar();

  React.useEffect(() => {
    if (visivel) {
      setMotivo(motivoInicial);
      setHorario(null);
      setErro(null);
    }
  }, [visivel, motivoInicial]);

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

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View style={estilos.cabecalho}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.titulo}>Agendar atendimento</Text>
              <Text style={estilos.subtitulo}>
                Para {pet?.nome} · Dra. Helena Prado
              </Text>
            </View>
            <Pressable onPress={onFechar} hitSlop={10}>
              <Ionicons name="close" size={22} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <ScrollView style={estilos.corpo} showsVerticalScrollIndicator={false}>
            <Text style={estilos.rotulo}>Motivo</Text>
            <View style={estilos.motivos}>
              {MOTIVOS.map((opcao) => {
                const ativo = motivo === opcao;
                return (
                  <Pressable
                    key={opcao}
                    onPress={() => setMotivo(opcao)}
                    style={[estilos.motivo, ativo && estilos.motivoAtivo]}
                  >
                    <Text style={[estilos.motivoTexto, ativo && { color: cores.primaria }]}>
                      {opcao}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={estilos.rotulo}>Data</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={estilos.dias}
              contentContainerStyle={{ gap: espacamentos.xs }}
            >
              {dias.map((dia) => {
                const iso = paraIso(dia);
                const ativo = dataEscolhida === iso;
                const domingo = dia.getDay() === 0;

                return (
                  <Pressable
                    key={iso}
                    onPress={() => {
                      setDataEscolhida(iso);
                      setHorario(null);
                    }}
                    style={[
                      estilos.dia,
                      ativo && estilos.diaAtivo,
                      domingo && estilos.diaFechado,
                    ]}
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

            <View style={estilos.linhaRotulo}>
              <Text style={estilos.rotulo}>Horário</Text>
              {!!agenda?.observacao && (
                <Text style={estilos.observacao}>{agenda.observacao}</Text>
              )}
            </View>

            {isLoading ? (
              <View style={estilos.carregando}>
                <ActivityIndicator color={cores.primaria} />
                <Text style={estilos.textoSuave}>Consultando a agenda…</Text>
              </View>
            ) : !agenda?.atende || agenda.horarios.length === 0 ? (
              <View style={estilos.semHorario}>
                <MaterialCommunityIcons
                  name="calendar-remove"
                  size={22}
                  color={cores.textoSuave}
                />
                <Text style={estilos.textoSuave}>
                  {agenda?.observacao ?? 'Sem horários disponíveis'}
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
                      <Text style={[estilos.horarioTexto, ativo && { color: '#04261C' }]}>
                        {h.slice(0, 5)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View style={estilos.preparo}>
              <View style={estilos.preparoTopo}>
                <Ionicons name="information-circle" size={17} color={cores.laranja} />
                <Text style={estilos.preparoTitulo}>Como preparar o pet</Text>
              </View>
              <Text style={estilos.preparoItem}>
                • Jejum de 8 a 12 horas, salvo orientação do veterinário
              </Text>
              <Text style={estilos.preparoItem}>• Leve a carteira de vacinação</Text>
              <Text style={estilos.preparoItem}>• Traga caixa de transporte ou guia</Text>
            </View>

            {!!erro && <Text style={estilos.erro}>{erro}</Text>}
          </ScrollView>

          <Botao
            titulo={horario ? `Agendar às ${horario.slice(0, 5)}` : 'Escolha um horário'}
            icone="calendar-outline"
            onPress={confirmar}
            desabilitado={!horario}
            carregando={agendar.isPending}
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
    gap: espacamentos.sm,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.sm },
  titulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  subtitulo: { ...tipografia.legenda, color: cores.primaria, marginTop: 1 },
  corpo: { maxHeight: 420 },
  rotulo: {
    ...tipografia.legenda,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    marginBottom: espacamentos.xs,
    marginTop: espacamentos.sm,
  },
  linhaRotulo: { flexDirection: 'row', alignItems: 'baseline', gap: espacamentos.sm },
  observacao: { color: cores.textoSuave, fontSize: 11, flex: 1 },
  motivos: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.xs },
  motivo: {
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm,
    borderRadius: raios.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlt,
  },
  motivoAtivo: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  motivoTexto: { color: cores.textoSecundario, fontSize: 12, fontWeight: '600' },
  dias: { marginBottom: espacamentos.xs },
  dia: {
    width: 58,
    paddingVertical: espacamentos.sm,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
  },
  diaAtivo: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  diaFechado: { opacity: 0.45 },
  diaSemana: { color: cores.textoSuave, fontSize: 11, fontWeight: '700' },
  diaNumero: { color: cores.textoPrincipal, fontSize: 17, fontWeight: '800' },
  diaMes: { color: cores.textoSuave, fontSize: 10 },
  horarios: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.xs },
  horario: {
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlt,
  },
  horarioAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  horarioTexto: { color: cores.textoPrincipal, fontSize: 13, fontWeight: '700' },
  carregando: { alignItems: 'center', gap: espacamentos.xs, paddingVertical: espacamentos.md },
  semHorario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.superficieAlt,
    borderRadius: raios.md,
    padding: espacamentos.md,
  },
  textoSuave: { color: cores.textoSecundario, fontSize: 12 },
  preparo: {
    backgroundColor: 'rgba(255,138,61,0.10)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginTop: espacamentos.md,
    gap: 2,
  },
  preparoTopo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  preparoTitulo: { color: cores.laranja, fontSize: 12, fontWeight: '800' },
  preparoItem: { color: cores.textoSecundario, fontSize: 11, lineHeight: 16 },
  erro: { color: cores.erro, fontSize: 12, marginTop: espacamentos.sm },
});
