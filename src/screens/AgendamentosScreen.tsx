import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconePet } from '../components/IconePet';
import * as consultaService from '../services/consultaService';
import type { Consulta } from '../services/tipos';
import { usePetAtivo } from '../state/PetAtivoContext';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/** "2026-09-14T09:00" -> { dia: "14", mes: "set", hora: "09:00" } */
function partesDaData(iso: string) {
  const data = new Date(iso);

  return {
    dia: String(data.getDate()).padStart(2, '0'),
    mes: MESES[data.getMonth()],
    hora: `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(
      2,
      '0',
    )}`,
  };
}

const ROTULOS: Record<Consulta['status'], string> = {
  AGENDADA: 'Agendado',
  REALIZADA: 'Realizado',
  CANCELADA: 'Cancelado',
  NAO_COMPARECEU: 'Não compareceu',
};

const CORES: Record<Consulta['status'], string> = {
  AGENDADA: cores.laranja,
  REALIZADA: cores.primaria,
  CANCELADA: cores.erro,
  NAO_COMPARECEU: cores.textoSuave,
};

function Cartao({ consulta }: { consulta: Consulta }) {
  const { dia, mes, hora } = partesDaData(consulta.dataHora);

  return (
    <View style={estilos.cartao}>
      <View style={estilos.data}>
        <Text style={estilos.dataDia}>{dia}</Text>
        <Text style={estilos.dataMes}>{mes}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={estilos.motivo}>{consulta.motivo}</Text>
        <Text style={estilos.detalhe}>
          {hora} · {consulta.veterinario ?? 'Clínica Animed'}
        </Text>

        {!!consulta.diagnostico && (
          <Text style={estilos.diagnostico}>{consulta.diagnostico}</Text>
        )}
      </View>

      <View style={[estilos.status, { backgroundColor: `${CORES[consulta.status]}22` }]}>
        <Text style={[estilos.statusTexto, { color: CORES[consulta.status] }]}>
          {ROTULOS[consulta.status]}
        </Text>
      </View>
    </View>
  );
}

/**
 * Atendimentos do pet ativo: o que está marcado e o que já foi feito.
 *
 * A lista vem da mesma agenda que o veterinário usa — quando ele conclui o
 * atendimento, o registro muda de seção aqui.
 */
export function AgendamentosScreen() {
  const { petAtivo } = usePetAtivo();

  const { data: consultas, isLoading } = useQuery({
    queryKey: ['consultas', petAtivo?.id],
    queryFn: () => consultaService.listarConsultasDoPet(petAtivo!.id),
    enabled: !!petAtivo,
  });

  const agora = new Date();

  // Os próximos vêm do mais perto para o mais distante; o histórico, ao
  // contrário, do mais recente para o mais antigo (ordem que a API já usa).
  const proximos = (consultas ?? [])
    .filter((c) => c.status === 'AGENDADA' && new Date(c.dataHora) >= agora)
    .sort((a, b) => (a.dataHora > b.dataHora ? 1 : -1));

  const anteriores = (consultas ?? []).filter((c) => !proximos.includes(c));

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cabecalho}>
        <View style={estilos.selo}>
          <IconePet especie={petAtivo?.especie} tamanho={20} cor={cores.laranja} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>{petAtivo?.nome ?? 'Selecione um pet'}</Text>
          <Text style={estilos.subtitulo}>O que está marcado e o que já foi feito</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={cores.primaria} style={{ marginTop: espacamentos.lg }} />
      ) : (consultas ?? []).length === 0 ? (
        <View style={estilos.vazio}>
          <MaterialCommunityIcons name="calendar-blank" size={34} color={cores.textoSuave} />
          <Text style={estilos.vazioTexto}>
            Nenhum atendimento por aqui ainda. Marque o primeiro na aba Cuidados.
          </Text>
        </View>
      ) : (
        <>
          <View style={estilos.secao}>
            <Ionicons name="time-outline" size={16} color={cores.laranja} />
            <Text style={estilos.secaoTexto}>Próximos</Text>
          </View>

          {proximos.length === 0 ? (
            <Text style={estilos.semItens}>Nenhum atendimento marcado.</Text>
          ) : (
            proximos.map((c) => <Cartao key={c.id} consulta={c} />)
          )}

          <View style={estilos.secao}>
            <Ionicons name="checkmark-done-outline" size={16} color={cores.primaria} />
            <Text style={estilos.secaoTexto}>Histórico</Text>
          </View>

          {anteriores.length === 0 ? (
            <Text style={estilos.semItens}>Nada registrado até agora.</Text>
          ) : (
            anteriores.map((c) => <Cartao key={c.id} consulta={c} />)
          )}
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.md, paddingBottom: espacamentos.xxl },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    marginBottom: espacamentos.md,
  },
  selo: {
    width: 38,
    height: 38,
    borderRadius: raios.md,
    backgroundColor: cores.laranjaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  subtitulo: { fontSize: 12, color: cores.textoSecundario },

  secao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: espacamentos.md,
    marginBottom: espacamentos.sm,
  },
  secaoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: cores.textoSecundario,
    textTransform: 'uppercase',
  },
  semItens: { fontSize: 12, color: cores.textoSuave, marginBottom: espacamentos.xs },

  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.sm + 4,
    marginBottom: espacamentos.sm,
  },
  data: {
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: cores.borda,
    paddingRight: espacamentos.sm + 2,
    minWidth: 46,
  },
  dataDia: { fontSize: 17, fontWeight: '800', color: cores.textoPrincipal },
  dataMes: { fontSize: 11, color: cores.textoSuave },
  motivo: { fontSize: 14, fontWeight: '700', color: cores.textoPrincipal },
  detalhe: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
  diagnostico: { fontSize: 11, color: cores.textoSuave, marginTop: 3, lineHeight: 15 },

  status: {
    paddingHorizontal: espacamentos.sm,
    paddingVertical: 3,
    borderRadius: raios.pill,
  },
  statusTexto: { fontSize: 11, fontWeight: '700' },

  vazio: { alignItems: 'center', gap: espacamentos.sm, paddingVertical: espacamentos.xl },
  vazioTexto: {
    color: cores.textoSecundario,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: espacamentos.lg,
  },
});
