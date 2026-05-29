import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Cartao } from '../components/Cartao';
import { useAnimed } from '../state/AnimedContext';
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
  const { historico, pontos } = useAnimed();

  return (
    <View style={estilos.container}>
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <Text style={estilos.titulo}>Histórico de pontos</Text>
            <Text style={estilos.subtitulo}>
              Saldo atual:{' '}
              <Text style={{ color: cores.primaria, fontWeight: '700' }}>{pontos} pts</Text>
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
        renderItem={({ item }) => (
          <Cartao>
            <View style={estilos.linha}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.acao}>{item.rotulo}</Text>
                <Text style={estilos.data}>{formatarData(item.data)}</Text>
              </View>
              <Text style={estilos.pontos}>+{item.pontos}</Text>
            </View>
          </Cartao>
        )}
        contentContainerStyle={estilos.lista}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: espacamentos.lg, paddingBottom: espacamentos.xxl, gap: espacamentos.md },
  cabecalho: { marginBottom: espacamentos.md },
  titulo: { color: cores.textoPrincipal, fontSize: 24, fontWeight: '700' },
  subtitulo: { color: cores.textoSecundario, fontSize: 13, marginTop: 4 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  acao: { color: cores.textoPrincipal, fontSize: 14, fontWeight: '600' },
  data: { color: cores.textoSecundario, fontSize: 12, marginTop: 2 },
  pontos: { color: cores.primaria, fontSize: 18, fontWeight: '800' },
});
