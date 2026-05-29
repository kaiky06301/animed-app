import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { PRODUTOS_PARCEIROS, type Produto } from '../data/parceiros';
import { useAnimed } from '../state/AnimedContext';
import { cores, espacamentos, raios } from '../theme/cores';
import { aplicarDesconto, nivelPorPontos } from '../utils/nivel';

function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function RecompensasScreen() {
  const { pontos, registrarAcao } = useAnimed();
  const nivel = nivelPorPontos(pontos);
  const [comprado, setComprado] = useState<string | null>(null);

  function comprar(produto: Produto) {
    registrarAcao('compraParceiro');
    setComprado(produto.id);
    setTimeout(() => setComprado(null), 2500);
  }

  return (
    <View style={estilos.container}>
      <FlatList
        data={PRODUTOS_PARCEIROS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <Text style={estilos.titulo}>Recompensas</Text>
            <Text style={estilos.subtitulo}>
              Seu nível {nivel.emoji} {nivel.nome} dá{' '}
              <Text style={{ color: cores.primaria, fontWeight: '700' }}>
                {nivel.descontoPercentual}% de desconto
              </Text>{' '}
              nas compras com parceiros.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const precoFinal = aplicarDesconto(item.preco, pontos);
          const teveDesconto = nivel.descontoPercentual > 0;
          return (
            <Cartao>
              <View style={estilos.linha}>
                <View style={estilos.emoji}>
                  <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.marca}>{item.marca}</Text>
                  <Text style={estilos.nomeProduto}>{item.nome}</Text>
                  <Text style={estilos.categoria}>{item.categoria}</Text>
                </View>
              </View>
              <View style={estilos.precoLinha}>
                {teveDesconto && (
                  <Text style={estilos.precoOriginal}>
                    {formatarReais(item.preco)}
                  </Text>
                )}
                <Text style={estilos.precoFinal}>{formatarReais(precoFinal)}</Text>
                {teveDesconto && (
                  <Text style={estilos.tagDesc}>-{nivel.descontoPercentual}%</Text>
                )}
              </View>
              <Botao
                titulo={comprado === item.id ? '✓ Compra registrada' : 'Comprar'}
                variante={comprado === item.id ? 'sutil' : 'primaria'}
                onPress={() => comprar(item)}
                estilo={{ marginTop: espacamentos.md }}
              />
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
  lista: { padding: espacamentos.lg, paddingBottom: espacamentos.xxl, gap: espacamentos.md },
  cabecalho: { marginBottom: espacamentos.md },
  titulo: { color: cores.textoPrincipal, fontSize: 24, fontWeight: '700' },
  subtitulo: { color: cores.textoSecundario, fontSize: 13, marginTop: 4 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.md },
  emoji: {
    width: 56,
    height: 56,
    borderRadius: raios.md,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marca: { color: cores.laranja, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  nomeProduto: { color: cores.textoPrincipal, fontSize: 15, fontWeight: '700', marginTop: 2 },
  categoria: { color: cores.textoSecundario, fontSize: 12, marginTop: 2 },
  precoLinha: {
    marginTop: espacamentos.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
  },
  precoOriginal: {
    color: cores.textoSuave,
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  precoFinal: { color: cores.textoPrincipal, fontSize: 18, fontWeight: '800' },
  tagDesc: {
    color: cores.primaria,
    backgroundColor: cores.primariaSuave,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: raios.pill,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
