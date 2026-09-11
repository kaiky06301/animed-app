import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ConfirmarCompra } from '../components/ConfirmarCompra';
import { CATEGORIAS, PRODUTOS_PARCEIROS, type Produto } from '../data/parceiros';
import { useTutor } from '../hooks/useTutor';
import { cores, espacamentos, raios } from '../theme/cores';
import { proximoNivel } from '../utils/nivel';

function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Medalha do nível, conforme a faixa de pontuação. */
const EMOJI_NIVEL: Record<string, string> = {
  BASICO: '🥉',
  CUIDADOR: '🥈',
  TUTOR_PREMIUM: '🥇',
};

/**
 * Vitrine dos parceiros.
 *
 * O desconto do nível alcançado é o que dá sentido a acumular pontos, então
 * aparece em cada preço — e não apenas como um número solto no topo.
 */
export function RecompensasScreen() {
  const { data: tutor } = useTutor();

  const pontos = tutor?.pontosTotais ?? 0;
  const desconto = tutor?.descontoPercentual ?? 0;
  const proximo = proximoNivel(pontos);

  const [categoria, setCategoria] = useState<string>('Todos');
  const [aComprar, setAComprar] = useState<Produto | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const produtos =
    categoria === 'Todos'
      ? PRODUTOS_PARCEIROS
      : PRODUTOS_PARCEIROS.filter((p) => p.categoria === categoria);

  /** Quanto do caminho até o próximo nível já foi percorrido. */
  const progresso = proximo ? Math.min(100, Math.round((pontos / proximo.minimo) * 100)) : 100;

  return (
    <View style={estilos.container}>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Text style={estilos.titulo}>Recompensas</Text>
            <Text style={estilos.subtitulo}>
              Cuide do seu pet e aproveite benefícios exclusivos.
            </Text>

            {/* Pontuação e nível, lado a lado */}
            <View style={estilos.painel}>
              <View style={estilos.painelPontos}>
                <View style={estilos.circulo}>
                  <Ionicons name="paw" size={24} color={cores.laranja} />
                </View>

                <View>
                  <Text style={estilos.painelRotulo}>Seus pontos</Text>
                  <View style={estilos.linhaPontos}>
                    <Text style={estilos.pontos}>{pontos.toLocaleString('pt-BR')}</Text>
                    <Ionicons name="star" size={15} color={cores.dourado} />
                  </View>
                </View>
              </View>

              <View style={estilos.divisor} />

              <View style={estilos.painelNivel}>
                <View style={estilos.linhaNivel}>
                  <Text style={estilos.medalha}>{EMOJI_NIVEL[tutor?.nivel ?? 'BASICO']}</Text>
                  <Text style={estilos.nivelNome}>
                    Nível {tutor?.nivelDescricao ?? 'Básico'}
                  </Text>
                </View>

                {/* O desconto conquistado é o que os pontos valem hoje */}
                <View style={[estilos.selo, desconto === 0 && estilos.seloVazio]}>
                  <Ionicons
                    name="pricetag"
                    size={13}
                    color={desconto > 0 ? cores.primaria : cores.textoSuave}
                  />
                  <Text
                    style={[estilos.seloTexto, desconto === 0 && { color: cores.textoSuave }]}
                  >
                    {desconto > 0
                      ? `${desconto}% de desconto em tudo`
                      : 'Ainda sem desconto'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quanto falta para o desconto aumentar */}
            {!!proximo && (
              <View style={estilos.proximo}>
                <View style={estilos.barra}>
                  <View style={[estilos.barraCheia, { width: `${progresso}%` }]} />
                </View>

                <Text style={estilos.proximoTexto}>
                  Faltam{' '}
                  <Text style={estilos.proximoDestaque}>
                    {(proximo.minimo - pontos).toLocaleString('pt-BR')} pts
                  </Text>{' '}
                  para {proximo.nome} e{' '}
                  <Text style={estilos.proximoDestaque}>
                    {proximo.descontoPercentual}% de desconto
                  </Text>
                </Text>
              </View>
            )}

            {/* Filtro por categoria */}
            <FlatList
              horizontal
              data={CATEGORIAS}
              keyExtractor={(item) => item.rotulo}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={estilos.filtros}
              renderItem={({ item }) => {
                const ativa = categoria === item.rotulo;

                return (
                  <Pressable
                    onPress={() => setCategoria(item.rotulo)}
                    style={({ pressed }) => [
                      estilos.filtro,
                      ativa && estilos.filtroAtivo,
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <Ionicons
                      name={item.icone as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={ativa ? cores.laranja : cores.textoSecundario}
                    />
                    <Text style={[estilos.filtroTexto, ativa && { color: cores.laranja }]}>
                      {item.rotulo}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <Text style={estilos.secao}>
              {categoria === 'Todos' ? 'Produtos em destaque' : categoria}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const precoFinal = item.preco - item.preco * (desconto / 100);
          const economia = item.preco - precoFinal;
          const temDesconto = desconto > 0;

          return (
            <View style={estilos.produto}>
              <Image source={item.imagem} style={estilos.foto} resizeMode="cover" />

              <View style={{ flex: 1 }}>
                <Text style={estilos.marca}>{item.marca}</Text>
                <Text style={estilos.nome}>{item.nome}</Text>
                <Text style={estilos.descricao}>{item.descricao}</Text>

                <View style={estilos.precos}>
                  {temDesconto && (
                    <Text style={estilos.precoOriginal}>{formatarReais(item.preco)}</Text>
                  )}
                  <Text style={estilos.precoFinal}>{formatarReais(precoFinal)}</Text>

                  {temDesconto && (
                    <View style={estilos.economia}>
                      <Text style={estilos.economiaTexto}>
                        Economize {formatarReais(economia)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={estilos.beneficios}>
                  <View style={estilos.beneficio}>
                    <Ionicons name="car-outline" size={13} color={cores.primaria} />
                    <Text style={estilos.beneficioTexto}>Frete grátis</Text>
                  </View>

                  <View style={estilos.beneficio}>
                    <Ionicons name="shield-checkmark" size={13} color={cores.primaria} />
                    <Text style={estilos.beneficioTexto}>
                      {temDesconto ? `${desconto}% OFF no app` : 'Suba de nível e ganhe OFF'}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setAComprar(item)}
                  style={({ pressed }) => [estilos.comprar, pressed && { opacity: 0.8 }]}
                >
                  <Ionicons name="cart" size={17} color="#04261C" />
                  <Text style={estilos.comprarTexto}>Comprar</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        contentContainerStyle={estilos.lista}
        showsVerticalScrollIndicator={false}
      />

      {!!aviso && (
        <View style={estilos.faixa}>
          <Ionicons name="checkmark-circle" size={17} color={cores.primaria} />
          <Text style={estilos.faixaTexto}>{aviso}</Text>
          <Pressable onPress={() => setAviso(null)} hitSlop={10}>
            <Ionicons name="close" size={15} color={cores.textoSecundario} />
          </Pressable>
        </View>
      )}

      <ConfirmarCompra
        produto={aComprar}
        onFechar={() => setAComprar(null)}
        onComprado={setAviso}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: espacamentos.md, paddingBottom: espacamentos.xxl },

  titulo: { color: cores.textoPrincipal, fontSize: 26, fontWeight: '800' },
  subtitulo: { color: cores.textoSecundario, fontSize: 13, marginTop: 2 },

  painel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    marginTop: espacamentos.md,
  },
  painelPontos: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  circulo: {
    width: 50,
    height: 50,
    borderRadius: raios.pill,
    borderWidth: 2,
    borderColor: cores.laranja,
    backgroundColor: cores.laranjaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  painelRotulo: { color: cores.textoSecundario, fontSize: 11 },
  linhaPontos: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pontos: { color: cores.textoPrincipal, fontSize: 21, fontWeight: '800' },

  divisor: {
    width: 1,
    height: 46,
    backgroundColor: cores.borda,
    marginHorizontal: espacamentos.md,
  },

  painelNivel: { flex: 1, gap: 6 },
  linhaNivel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  medalha: { fontSize: 17 },
  nivelNome: { color: cores.textoPrincipal, fontSize: 14, fontWeight: '700' },

  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.pill,
    paddingHorizontal: espacamentos.sm,
    paddingVertical: 4,
  },
  seloVazio: { backgroundColor: cores.superficieAlt },
  seloTexto: { color: cores.primaria, fontSize: 12, fontWeight: '800' },

  proximo: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.sm + 2,
    marginTop: espacamentos.sm,
    gap: 6,
  },
  proximoTexto: { color: cores.textoSecundario, fontSize: 12, lineHeight: 17 },
  proximoDestaque: { color: cores.laranja, fontWeight: '800' },

  barra: {
    height: 7,
    borderRadius: raios.pill,
    backgroundColor: cores.superficieAlt,
    overflow: 'hidden',
  },
  barraCheia: { height: '100%', backgroundColor: cores.laranja, borderRadius: raios.pill },

  filtros: { gap: espacamentos.sm, paddingVertical: espacamentos.md },
  filtro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.pill,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm,
  },
  filtroAtivo: { borderColor: cores.laranja, backgroundColor: cores.laranjaSuave },
  filtroTexto: { color: cores.textoSecundario, fontSize: 13, fontWeight: '600' },

  secao: {
    color: cores.textoPrincipal,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: espacamentos.sm,
  },

  produto: {
    flexDirection: 'row',
    gap: espacamentos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    marginBottom: espacamentos.sm,
  },
  foto: {
    width: 88,
    height: 88,
    borderRadius: raios.md,
    backgroundColor: cores.superficieAlt,
  },
  marca: {
    color: cores.laranja,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  nome: { color: cores.textoPrincipal, fontSize: 15, fontWeight: '700', marginTop: 1 },
  descricao: { color: cores.textoSecundario, fontSize: 12, lineHeight: 16, marginTop: 2 },

  precos: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: espacamentos.sm,
    marginTop: espacamentos.sm,
  },
  precoOriginal: {
    color: cores.textoSuave,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  precoFinal: { color: cores.laranja, fontSize: 18, fontWeight: '800' },

  economia: {
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.sm,
    paddingHorizontal: espacamentos.sm,
    paddingVertical: 3,
  },
  economiaTexto: { color: cores.primaria, fontSize: 11, fontWeight: '700' },

  beneficios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.md,
    marginTop: espacamentos.sm,
  },
  beneficio: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  beneficioTexto: { color: cores.textoSecundario, fontSize: 11 },

  comprar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: cores.primaria,
    borderRadius: raios.pill,
    paddingVertical: espacamentos.sm + 2,
    marginTop: espacamentos.sm + 2,
  },
  faixa: {
    position: 'absolute',
    left: espacamentos.md,
    right: espacamentos.md,
    bottom: espacamentos.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.fundoElevado,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
  },
  faixaTexto: { flex: 1, fontSize: 12, color: cores.textoPrincipal, lineHeight: 17 },
  comprarTexto: { color: '#04261C', fontSize: 14, fontWeight: '800' },
});
