import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Cartao } from '../components/Cartao';
import { useHistoricoPontos } from '../hooks/useHistoricoPontos';
import { useTutor } from '../hooks/useTutor';
import { useAuth } from '../state/AuthContext';
import { cores, espacamentos } from '../theme/cores';

function formatarData(iso: string): string {
  const data = new Date(iso);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoricoScreen() {
  // A pontuação é apurada na API: o histórico é o extrato dela
  const { usuario } = useAuth();
  const { data: tutor } = useTutor();
  const { data: lancamentos, isLoading } = useHistoricoPontos(usuario?.idTutor ?? null);

  if (isLoading) {
    return (
      <View style={[estilos.container, estilos.centro]}>
        <ActivityIndicator color={cores.primaria} size="large" />
      </View>
    );
  }

  return (
    <View style={estilos.container}>
      <FlatList
        data={lancamentos ?? []}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <Text style={estilos.titulo}>Histórico de pontos</Text>
            <Text style={estilos.subtitulo}>
              Saldo atual:{' '}
              <Text style={{ color: cores.primaria, fontWeight: '700' }}>
                {(tutor?.pontosTotais ?? 0).toLocaleString('pt-BR')} pts
              </Text>
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Cartao>
            <Text style={{ color: cores.textoSecundario, textAlign: 'center' }}>
              Você ainda não tem registros. Cadastre seu pet pra começar!
            </Text>
          </Cartao>
        }
        renderItem={({ item }) => {
          // Estornos entram como lançamento negativo e precisam se distinguir
          const estorno = item.pontosGanhos < 0;

          return (
            <Cartao>
              <View style={estilos.linha}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.acao}>{item.tipoAcaoDescricao}</Text>
                  <Text style={estilos.descricao}>{item.descricao}</Text>
                  <Text style={estilos.data}>{formatarData(item.dataHora)}</Text>
                </View>

                <Text style={[estilos.pontos, estorno && { color: cores.erro }]}>
                  {estorno ? '' : '+'}
                  {item.pontosGanhos}
                </Text>
              </View>
            </Cartao>
          );
        }}
        contentContainerStyle={estilos.lista}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  centro: { alignItems: 'center', justifyContent: 'center' },
  descricao: { color: cores.textoSecundario, fontSize: 12, marginTop: 1 },
  lista: { padding: espacamentos.lg, paddingBottom: espacamentos.xxl, gap: espacamentos.md },
  cabecalho: { marginBottom: espacamentos.md },
  titulo: { color: cores.textoPrincipal, fontSize: 24, fontWeight: '700' },
  subtitulo: { color: cores.textoSecundario, fontSize: 13, marginTop: 4 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  acao: { color: cores.textoPrincipal, fontSize: 14, fontWeight: '600' },
  data: { color: cores.textoSecundario, fontSize: 12, marginTop: 2 },
  pontos: { color: cores.primaria, fontSize: 18, fontWeight: '800' },
});
