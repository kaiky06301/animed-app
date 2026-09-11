import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { PRODUTOS_PARCEIROS, type Produto } from '../data/parceiros';
import { useTutor } from '../hooks/useTutor';
import { cores, espacamentos, raios } from '../theme/cores';

function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Medalha do nível, conforme a faixa de pontuação. */
const EMOJI_NIVEL: Record<string, string> = {
  BASICO: '🥉',
  CUIDADOR: '🥈',
  TUTOR_PREMIUM: '🥇',
};

export function RecompensasScreen() {
  // O nível e o desconto vêm da API: é lá que a pontuação é apurada
  const { data: tutor } = useTutor();

  const desconto = tutor?.descontoPercentual ?? 0;
  const [comprado, setComprado] = useState<string | null>(null);

  function comprar(produto: Produto) {
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
              {EMOJI_NIVEL[tutor?.nivel ?? 'BASICO']} Nível{' '}
              {tutor?.nivelDescricao ?? 'Básico'} •{' '}
              <Text style={{ color: cores.primaria, fontWeight: '700' }}>
                {desconto}% de desconto
              </Text>{' '}
              nas compras
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const precoFinal = item.preco - item.preco * (desconto / 100);
          const teveDesconto = desconto > 0;
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
                  <Text style={estilos.tagDesc}>-{desconto}%</Text>
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
