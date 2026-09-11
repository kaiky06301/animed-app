import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../api/cliente';
import type { Produto } from '../data/parceiros';
import { useComprar } from '../hooks/useComprar';
import { useTutor } from '../hooks/useTutor';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';
import { Botao } from './Botao';
import { MoedaAnimed } from './MoedaAnimed';

interface Props {
  produto: Produto | null;
  onFechar: () => void;
  onComprado: (mensagem: string) => void;
}

/** Cada moeda vale dez centavos, como a API calcula. */
const VALOR_DA_MOEDA = 0.1;

/** As moedas abatem no máximo metade do valor da compra. */
const TETO_ABATIMENTO = 0.5;

/** Pet shop parceiro da demonstração. */
const ID_PETSHOP = 1;

function reais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Fechamento da compra.
 *
 * É aqui que a pontuação vira dinheiro: o desconto do nível aparece
 * separado do abatimento em moedas, para o tutor ver de onde veio cada
 * real que ele deixou de pagar.
 */
export function ConfirmarCompra({ produto, onFechar, onComprado }: Props) {
  const { data: tutor } = useTutor();
  const comprar = useComprar();

  const [usarMoedas, setUsarMoedas] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const saldo = tutor?.moedas ?? 0;
  const liberado = tutor?.podeGastarMoedas ?? false;
  const desconto = tutor?.descontoPercentual ?? 0;

  const preco = produto?.preco ?? 0;
  const valorDesconto = preco * (desconto / 100);
  const subtotal = preco - valorDesconto;

  /** Quantas moedas cabem nesta compra, respeitando saldo e teto. */
  const moedasAplicaveis = Math.min(
    saldo,
    Math.floor((subtotal * TETO_ABATIMENTO) / VALOR_DA_MOEDA),
  );

  const moedasUsadas = usarMoedas && liberado ? moedasAplicaveis : 0;
  const abatimento = moedasUsadas * VALOR_DA_MOEDA;
  const total = subtotal - abatimento;

  useEffect(() => {
    if (produto) {
      setUsarMoedas(false);
      setErro(null);
    }
  }, [produto]);

  async function confirmar() {
    if (!produto || !tutor) return;
    setErro(null);

    try {
      const compra = await comprar.mutateAsync({
        valorBruto: produto.preco,
        descricaoProduto: produto.nome,
        idTutor: tutor.id,
        idPetShop: ID_PETSHOP,
        moedasUsadas,
      });

      onComprado(
        `${produto.nome} comprado por ${reais(compra.valorFinal)}. `
          + `Você ganhou ${compra.pontosGerados} pontos.`,
      );
      onFechar();
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível concluir a compra'));
    }
  }

  return (
    <Modal visible={!!produto} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View style={estilos.cabecalho}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.titulo}>Confirmar compra</Text>
              <Text style={estilos.subtitulo}>{produto?.marca}</Text>
            </View>

            <Pressable onPress={onFechar} hitSlop={10} style={estilos.fechar}>
              <Ionicons name="close" size={20} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={estilos.produto}>
              {!!produto && (
                <Image source={produto.imagem} style={estilos.foto} resizeMode="cover" />
              )}
              <Text style={estilos.nome}>{produto?.nome}</Text>
            </View>

            {/* Moedas: o benefício que depende do nível */}
            <Pressable
              disabled={!liberado}
              onPress={() => setUsarMoedas((v) => !v)}
              style={({ pressed }) => [
                estilos.moedas,
                usarMoedas && estilos.moedasAtivo,
                !liberado && estilos.moedasBloqueado,
                pressed && { opacity: 0.8 },
              ]}
            >
              <MoedaAnimed tamanho={34} ativa={liberado} />

              <View style={{ flex: 1 }}>
                <View style={estilos.moedasTopo}>
                  <Text style={estilos.moedasTitulo}>Usar minhas moedas</Text>
                  {!liberado && (
                    <Ionicons name="lock-closed" size={13} color={cores.textoSuave} />
                  )}
                </View>

                <Text style={estilos.moedasTexto}>
                  {!liberado
                    ? `Você tem ${saldo} moedas guardadas. Elas são liberadas no nível `
                      + 'Tutor Premium, a partir de 1.200 pontos.'
                    : moedasAplicaveis === 0
                      ? 'Você ainda não tem moedas suficientes para esta compra.'
                      : `Abate ${reais(moedasAplicaveis * VALOR_DA_MOEDA)} usando `
                        + `${moedasAplicaveis} das suas ${saldo} moedas.`}
                </Text>
              </View>

              {liberado && moedasAplicaveis > 0 && (
                <Ionicons
                  name={usarMoedas ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={usarMoedas ? cores.primaria : cores.textoSuave}
                />
              )}
            </Pressable>

            {/* Conta fechada, linha a linha */}
            <View style={estilos.conta}>
              <View style={estilos.linha}>
                <Text style={estilos.linhaRotulo}>Preço</Text>
                <Text style={estilos.linhaValor}>{reais(preco)}</Text>
              </View>

              {desconto > 0 && (
                <View style={estilos.linha}>
                  <Text style={estilos.linhaRotulo}>
                    Desconto {tutor?.nivelDescricao} ({desconto}%)
                  </Text>
                  <Text style={[estilos.linhaValor, { color: cores.primaria }]}>
                    − {reais(valorDesconto)}
                  </Text>
                </View>
              )}

              {moedasUsadas > 0 && (
                <View style={estilos.linha}>
                  <Text style={estilos.linhaRotulo}>{moedasUsadas} moedas</Text>
                  <Text style={[estilos.linhaValor, { color: cores.primaria }]}>
                    − {reais(abatimento)}
                  </Text>
                </View>
              )}

              <View style={estilos.divisor} />

              <View style={estilos.linha}>
                <Text style={estilos.totalRotulo}>Total</Text>
                <Text style={estilos.total}>{reais(total)}</Text>
              </View>

              {preco - total > 0 && (
                <Text style={estilos.economia}>
                  Você economizou {reais(preco - total)} com o Animed
                </Text>
              )}
            </View>

            {!!erro && <Text style={estilos.erro}>{erro}</Text>}
          </ScrollView>

          <Botao
            titulo="Comprar"
            icone="cart"
            onPress={confirmar}
            carregando={comprar.isPending}
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
    maxWidth: 440,
    maxHeight: '90%',
    width: '100%',
    alignSelf: 'center',
  },

  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.sm },
  titulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  subtitulo: {
    fontSize: 11,
    color: cores.laranja,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  fechar: {
    width: 30,
    height: 30,
    borderRadius: raios.sm,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  produto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    marginTop: espacamentos.md,
  },
  foto: { width: 56, height: 56, borderRadius: raios.md },
  nome: { flex: 1, fontSize: 14, fontWeight: '700', color: cores.textoPrincipal },

  moedas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginTop: espacamentos.md,
  },
  moedasAtivo: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  moedasBloqueado: { opacity: 0.7 },
  moedasTopo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  moedasTitulo: { fontSize: 13, fontWeight: '700', color: cores.textoPrincipal },
  moedasTexto: { fontSize: 11, color: cores.textoSecundario, lineHeight: 16, marginTop: 2 },

  conta: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacamentos.md,
    marginTop: espacamentos.md,
    gap: 6,
  },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linhaRotulo: { fontSize: 12, color: cores.textoSecundario },
  linhaValor: { fontSize: 13, color: cores.textoPrincipal, fontWeight: '600' },
  divisor: { height: 1, backgroundColor: cores.borda, marginVertical: 2 },
  totalRotulo: { fontSize: 14, fontWeight: '700', color: cores.textoPrincipal },
  total: { fontSize: 20, fontWeight: '800', color: cores.laranja },
  economia: { fontSize: 11, color: cores.primaria, fontWeight: '700', marginTop: 2 },

  erro: { color: cores.erro, fontSize: 12, marginTop: espacamentos.sm },
});
