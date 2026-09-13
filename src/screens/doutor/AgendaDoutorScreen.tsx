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
import { AcoesAtendimento } from '../../components/AcoesAtendimento';
import { AgendaTranquila } from '../../components/AgendaTranquila';
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

/** Recortes da agenda do dia. */
const FILTROS = [
  { chave: 'TODOS', rotulo: 'Todos' },
  { chave: 'AGENDADA', rotulo: 'A atender' },
  { chave: 'REALIZADA', rotulo: 'Realizados' },
  { chave: 'NAO_COMPARECEU', rotulo: 'Faltas' },
] as const;

type Filtro = (typeof FILTROS)[number]['chave'];

/**
 * Agenda do veterinário.
 *
 * É a mesma agenda que o tutor consulta ao marcar: cada horário que sai da
 * lista de disponíveis aparece aqui como atendimento. Concluir o atendimento
 * credita os pontos prometidos ao tutor.
 */
export function AgendaDoutorScreen() {
  const [dataEscolhida, setDataEscolhida] = useState(paraIso(new Date()));
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const [aberto, setAberto] = useState<Atendimento | null>(null);
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
      setAberto(null);
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

  const visiveis = filtro === 'TODOS'
    ? atendimentos
    : atendimentos.filter((a) => a.status === filtro);

  /** Quantos atendimentos cada recorte tem, para o chip mostrar o número. */
  function quantidade(chave: Filtro): number {
    return chave === 'TODOS'
      ? atendimentos.length
      : atendimentos.filter((a) => a.status === chave).length;
  }

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cabecalho}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>Agenda</Text>
          <Text style={estilos.subtitulo}>{agenda?.veterinario ?? 'Clínica Animed'}</Text>
        </View>

        {!ehHoje && (
          // Depois de navegar alguns dias, voltar de seta em seta cansa
          <Pressable
            onPress={() => setDataEscolhida(paraIso(new Date()))}
            hitSlop={8}
            style={({ pressed }) => [estilos.voltarHoje, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="today-outline" size={13} color={cores.primaria} />
            <Text style={estilos.voltarHojeTexto}>Hoje</Text>
          </Pressable>
        )}
      </View>

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
          <View style={[estilos.resumoSelo, { backgroundColor: cores.laranjaSuave }]}>
            <MaterialCommunityIcons name="calendar-month" size={18} color={cores.laranja} />
          </View>
          <View>
            <Text style={estilos.resumoNumero}>{atendimentos.length}</Text>
            <Text style={estilos.resumoTexto}>marcados</Text>
          </View>
        </View>

        <View style={estilos.resumoDivisor} />

        <View style={estilos.resumoItem}>
          <View style={[estilos.resumoSelo, { backgroundColor: cores.primariaSuave }]}>
            <Ionicons name="checkmark-circle" size={18} color={cores.primaria} />
          </View>
          <View>
            <Text style={[estilos.resumoNumero, { color: cores.primaria }]}>{realizados}</Text>
            <Text style={estilos.resumoTexto}>realizados</Text>
          </View>
        </View>

        <View style={estilos.resumoDivisor} />

        <View style={estilos.resumoItem}>
          <View style={[estilos.resumoSelo, { backgroundColor: cores.superficieAlt }]}>
            <Ionicons name="close-circle" size={18} color={cores.textoSecundario} />
          </View>
          <View>
            <Text style={[estilos.resumoNumero, { color: cores.textoSecundario }]}>
              {agenda?.horariosLivres ?? 0}
            </Text>
            <Text style={estilos.resumoTexto}>horários livres</Text>
          </View>
        </View>
      </View>

      {atendimentos.length > 0 && (
        <View style={estilos.filtros}>
          {FILTROS.map((opcao) => {
            const total = quantidade(opcao.chave);
            const ativo = filtro === opcao.chave;

            // Recorte sem nenhum atendimento no dia não vira botão morto
            if (total === 0 && opcao.chave !== 'TODOS') return null;

            return (
              <Pressable
                key={opcao.chave}
                onPress={() => setFiltro(opcao.chave)}
                style={({ pressed }) => [
                  estilos.filtro,
                  ativo && estilos.filtroAtivo,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[estilos.filtroTexto, ativo && estilos.filtroTextoAtivo]}>
                  {opcao.rotulo}
                </Text>
                <View style={[estilos.filtroSelo, ativo && estilos.filtroSeloAtivo]}>
                  <Text style={[estilos.filtroNumero, ativo && estilos.filtroTextoAtivo]}>
                    {total}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

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
      ) : visiveis.length === 0 ? (
        <View style={estilos.vazioCentralizado}>
          {/* Lista vazia por causa do filtro não é dia vazio */}
          <AgendaTranquila
            titulo={
              atendimentos.length > 0
                ? 'Nada neste recorte'
                : 'Dia livre por aqui!'
            }
            texto={
              atendimentos.length > 0
                ? 'O dia tem atendimentos, mas nenhum\nneste filtro. Toque em Todos.'
                : 'Nenhum atendimento marcado\npara esta data.'
            }
          />
        </View>
      ) : (
        visiveis.map((item) => (
          <Pressable
            key={item.idConsulta}
            onPress={() => setAberto(item)}
            style={({ pressed }) => [estilos.cartao, pressed && { opacity: 0.85 }]}
          >
            <View style={estilos.horaColuna}>
              <Text style={estilos.hora}>{item.horario.slice(0, 5)}</Text>
              <View style={estilos.duracao}>
                <Ionicons name="time-outline" size={12} color={cores.textoSuave} />
                <Text style={estilos.duracaoTexto}>30 min</Text>
              </View>
            </View>

            <View style={estilos.avatar}>
              <Ionicons name="paw" size={22} color={cores.textoSecundario} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={estilos.tituloLinha}>
                <Text style={estilos.pet}>{item.nomePet}</Text>
                <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
              </View>
              <Text style={estilos.tutor}>Tutor: {item.nomeTutor}</Text>
              <View style={estilos.motivoLinha}>
                <MaterialCommunityIcons
                  name="stethoscope"
                  size={13}
                  color={cores.textoSuave}
                />
                <Text style={estilos.motivo}>{item.motivo}</Text>
              </View>

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
              </View>
            </View>
          </Pressable>
        ))
      )}

      <AcoesAtendimento
        atendimento={aberto}
        data={dataEscolhida}
        onFechar={() => setAberto(null)}
        onConcluir={(item) => {
          setAberto(null);
          setAConcluir(item);
        }}
        onFalta={marcarFalta}
        registrandoFalta={registrarFalta.isPending}
      />

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
  conteudo: {
    padding: espacamentos.md,
    paddingBottom: espacamentos.xxl,
    // Deixa o conteúdo esticar: sem isto o estado vazio fica colado no topo
    flexGrow: 1,
  },
  vazioCentralizado: { flex: 1, justifyContent: 'center' },

  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: espacamentos.xs,
    marginBottom: espacamentos.md,
  },
  filtro: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: 7,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  filtroAtivo: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  filtroTexto: { fontSize: 12, fontWeight: '700', color: cores.textoSecundario },
  filtroTextoAtivo: { color: cores.primaria },
  filtroSelo: {
    minWidth: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
  },
  filtroSeloAtivo: { backgroundColor: 'transparent' },
  filtroNumero: { fontSize: 11, fontWeight: '800', color: cores.textoSuave },

  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  subtitulo: { fontSize: 13, color: cores.primaria },

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
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.sm,
    marginBottom: espacamentos.md,
  },
  voltarHoje: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: espacamentos.sm,
    paddingVertical: 7,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
    marginTop: 4,
  },
  voltarHojeTexto: { fontSize: 12, color: cores.primaria, fontWeight: '700' },
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
  resumoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamentos.sm,
  },
  resumoSelo: {
    width: 34,
    height: 34,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  duracao: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  duracaoTexto: { fontSize: 11, color: cores.textoSuave },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: espacamentos.sm,
  },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  motivoLinha: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  pet: { fontSize: 15, fontWeight: '700', color: cores.textoPrincipal },
  tutor: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
  motivo: { fontSize: 12, color: cores.textoSuave },

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
  erro: { color: cores.erro, fontSize: 12, marginBottom: espacamentos.sm },

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
