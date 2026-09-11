import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ConcluirAtendimento } from '../../components/ConcluirAtendimento';
import { mensagemDoErro } from '../../api/cliente';
import { useAgendaDoDia, useRegistrarFalta } from '../../hooks/useAgenda';
import type { Atendimento } from '../../services/tipos';
import { cores, espacamentos, raios, tipografia } from '../../theme/cores';

const DIAS_SEMANA = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
];

function paraIso(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(
    data.getDate(),
  ).padStart(2, '0')}`;
}

function porExtenso(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);

  return `${DIAS_SEMANA[data.getDay()]}, ${String(dia).padStart(2, '0')}/${String(mes).padStart(
    2,
    '0',
  )}`;
}

const CORES_STATUS: Record<Atendimento['status'], string> = {
  AGENDADA: cores.laranja,
  REALIZADA: cores.primaria,
  CANCELADA: cores.erro,
  NAO_COMPARECEU: cores.textoSuave,
};

const ROTULOS_STATUS: Record<Atendimento['status'], string> = {
  AGENDADA: 'Agendado',
  REALIZADA: 'Realizado',
  CANCELADA: 'Cancelado',
  NAO_COMPARECEU: 'Não compareceu',
};

/**
 * Agenda do veterinário.
 *
 * É a mesma agenda que o tutor consulta ao marcar: cada horário que sai da
 * lista de disponíveis aparece aqui como atendimento. Concluir o atendimento
 * credita os pontos prometidos ao tutor.
 */
export function AgendaDoutorScreen() {
  const [dataEscolhida, setDataEscolhida] = useState(paraIso(new Date()));
  const [aConcluir, setAConcluir] = useState<Atendimento | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const { data: agenda, isLoading } = useAgendaDoDia(dataEscolhida);
  const registrarFalta = useRegistrarFalta();
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Marca a falta do paciente.
   *
   * Os pontos que o tutor ganhou ao agendar voltam atrás: marcar horário
   * sem aparecer tira a vaga de quem precisava dela.
   */
  async function marcarFalta(item: Atendimento) {
    setErro(null);

    try {
      await registrarFalta.mutateAsync(item.idConsulta);
      setAviso(`${item.nomePet} não compareceu. Os pontos do agendamento foram estornados.`);
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível registrar a falta'));
    }
  }

  function mudarDia(passo: number) {
    const [ano, mes, dia] = dataEscolhida.split('-').map(Number);
    setDataEscolhida(paraIso(new Date(ano, mes - 1, dia + passo)));
  }

  const ehHoje = dataEscolhida === paraIso(new Date());
  const atendimentos = agenda?.atendimentos ?? [];
  const realizados = atendimentos.filter((a) => a.status === 'REALIZADA').length;

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Agenda</Text>
      <Text style={estilos.subtitulo}>{agenda?.veterinario ?? 'Clínica Animed'}</Text>

      <View style={estilos.navegacao}>
        <Pressable onPress={() => mudarDia(-1)} hitSlop={10} style={estilos.seta}>
          <Ionicons name="chevron-back" size={20} color={cores.textoSecundario} />
        </Pressable>

        <View style={{ alignItems: 'center' }}>
          <Text style={estilos.dia}>{porExtenso(dataEscolhida)}</Text>
          {ehHoje && <Text style={estilos.hoje}>hoje</Text>}
        </View>

        <Pressable onPress={() => mudarDia(1)} hitSlop={10} style={estilos.seta}>
          <Ionicons name="chevron-forward" size={20} color={cores.textoSecundario} />
        </Pressable>
      </View>

      <View style={estilos.resumo}>
        <View style={estilos.resumoItem}>
          <Text style={estilos.resumoNumero}>{atendimentos.length}</Text>
          <Text style={estilos.resumoTexto}>marcados</Text>
        </View>
        <View style={estilos.resumoDivisor} />
        <View style={estilos.resumoItem}>
          <Text style={[estilos.resumoNumero, { color: cores.primaria }]}>{realizados}</Text>
          <Text style={estilos.resumoTexto}>realizados</Text>
        </View>
        <View style={estilos.resumoDivisor} />
        <View style={estilos.resumoItem}>
          <Text style={[estilos.resumoNumero, { color: cores.textoSecundario }]}>
            {agenda?.horariosLivres ?? 0}
          </Text>
          <Text style={estilos.resumoTexto}>livres</Text>
        </View>
      </View>

      {!!erro && <Text style={estilos.erro}>{erro}</Text>}

      {!!aviso && (
        <View style={estilos.aviso}>
          <Ionicons name="checkmark-circle" size={17} color={cores.primaria} />
          <Text style={estilos.avisoTexto}>{aviso}</Text>
          <Pressable onPress={() => setAviso(null)} hitSlop={10}>
            <Ionicons name="close" size={15} color={cores.textoSecundario} />
          </Pressable>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator color={cores.primaria} style={{ marginTop: espacamentos.lg }} />
      ) : atendimentos.length === 0 ? (
        <View style={estilos.vazio}>
          <MaterialCommunityIcons name="calendar-blank" size={34} color={cores.textoSuave} />
          <Text style={estilos.vazioTexto}>Nenhum atendimento marcado neste dia</Text>
        </View>
      ) : (
        atendimentos.map((item) => (
          <View key={item.idConsulta} style={estilos.cartao}>
            <View style={estilos.horaColuna}>
              <Text style={estilos.hora}>{item.horario.slice(0, 5)}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={estilos.pet}>{item.nomePet}</Text>
              <Text style={estilos.tutor}>Tutor: {item.nomeTutor}</Text>
              <Text style={estilos.motivo}>{item.motivo}</Text>

              <View style={estilos.rodape}>
                <View
                  style={[
                    estilos.status,
                    { backgroundColor: `${CORES_STATUS[item.status]}22` },
                  ]}
                >
                  <Text style={[estilos.statusTexto, { color: CORES_STATUS[item.status] }]}>
                    {ROTULOS_STATUS[item.status]}
                  </Text>
                </View>

                {item.status === 'AGENDADA' && (
                  <View style={estilos.acoes}>
                    <Pressable
                      onPress={() => marcarFalta(item)}
                      disabled={registrarFalta.isPending}
                      style={({ pressed }) => [estilos.falta, pressed && { opacity: 0.7 }]}
                    >
                      <Ionicons name="close-circle" size={15} color={cores.erro} />
                      <Text style={estilos.faltaTexto}>Não veio</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setAConcluir(item)}
                      style={({ pressed }) => [estilos.concluir, pressed && { opacity: 0.7 }]}
                    >
                      <Ionicons name="checkmark-circle" size={15} color={cores.primaria} />
                      <Text style={estilos.concluirTexto}>Concluir</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))
      )}

      <ConcluirAtendimento
        atendimento={aConcluir}
        onFechar={() => setAConcluir(null)}
        onConcluido={setAviso}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.md, paddingBottom: espacamentos.xxl },

  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  subtitulo: { fontSize: 13, color: cores.primaria, marginBottom: espacamentos.md },

  navegacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: espacamentos.sm,
    paddingVertical: espacamentos.sm,
  },
  seta: {
    width: 32,
    height: 32,
    borderRadius: raios.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dia: { fontSize: 15, fontWeight: '700', color: cores.textoPrincipal },
  hoje: { fontSize: 11, color: cores.laranja, fontWeight: '700' },

  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingVertical: espacamentos.sm + 2,
    marginTop: espacamentos.sm,
    marginBottom: espacamentos.md,
  },
  resumoItem: { flex: 1, alignItems: 'center' },
  resumoDivisor: { width: 1, height: 28, backgroundColor: cores.borda },
  resumoNumero: { fontSize: 18, fontWeight: '800', color: cores.laranja },
  resumoTexto: { fontSize: 11, color: cores.textoSuave },

  cartao: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.sm + 4,
    marginBottom: espacamentos.sm,
  },
  horaColuna: {
    borderRightWidth: 1,
    borderRightColor: cores.borda,
    paddingRight: espacamentos.sm + 2,
    justifyContent: 'center',
  },
  hora: { fontSize: 15, fontWeight: '800', color: cores.textoPrincipal },
  pet: { fontSize: 15, fontWeight: '700', color: cores.textoPrincipal },
  tutor: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
  motivo: { fontSize: 12, color: cores.textoSuave, marginTop: 2 },

  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacamentos.sm,
  },
  status: {
    paddingHorizontal: espacamentos.sm,
    paddingVertical: 3,
    borderRadius: raios.pill,
  },
  statusTexto: { fontSize: 11, fontWeight: '700' },
  concluir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: raios.pill,
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: 4,
  },
  concluirTexto: { fontSize: 12, fontWeight: '700', color: cores.primaria },
  acoes: { flexDirection: 'row', gap: espacamentos.xs },
  falta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: cores.erro,
    borderRadius: raios.pill,
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: 4,
  },
  faltaTexto: { fontSize: 12, fontWeight: '700', color: cores.erro },
  erro: { color: cores.erro, fontSize: 12, marginBottom: espacamentos.sm },

  vazio: { alignItems: 'center', gap: espacamentos.sm, paddingVertical: espacamentos.xl },
  vazioTexto: { color: cores.textoSecundario, fontSize: 13 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.sm,
  },
  avisoTexto: { flex: 1, fontSize: 12, color: cores.textoPrincipal, lineHeight: 17 },
});
