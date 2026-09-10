import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MoedaAnimed } from './MoedaAnimed';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

export type TipoRecompensa = 'pontos' | 'moedas';

interface Props {
  tipo: TipoRecompensa | null;
  pontos: number;
  moedas: number;
  nivelAtual: string;
  descontoAtual: number;
  moedasLiberadas: boolean;
  pontosParaPremium: number;
  onFechar: () => void;
}

/**
 * Explica ao tutor o que são pontos e moedas, e quando o uso das moedas
 * será liberado. Aberto ao tocar nos selos da tela inicial.
 */
export function ExplicacaoRecompensa({
  tipo,
  pontos,
  moedas,
  nivelAtual,
  descontoAtual,
  moedasLiberadas,
  pontosParaPremium,
  onFechar,
}: Props) {
  if (!tipo) return null;

  const ehPontos = tipo === 'pontos';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View style={estilos.cabecalho}>
            <View style={estilos.tituloArea}>
              {ehPontos ? (
                <Ionicons name="paw" size={20} color={cores.laranja} />
              ) : (
                <MoedaAnimed tamanho={20} ativa={moedasLiberadas} />
              )}
              <Text style={estilos.titulo}>{ehPontos ? 'Pontos' : 'Moedas'}</Text>
            </View>

            <Pressable onPress={onFechar} hitSlop={10}>
              <Ionicons name="close" size={22} color={cores.textoSecundario} />
            </Pressable>
          </View>

          {ehPontos ? (
            <>
              <Text style={estilos.texto}>
                Os pontos sobem o seu nível e definem o desconto automático nos parceiros.
                Eles são o seu histórico de cuidado: nunca diminuem, mesmo que você gaste
                moedas.
              </Text>

              <View style={estilos.destaque}>
                <Text style={estilos.destaqueValor}>{pontos.toLocaleString('pt-BR')} pontos</Text>
                <Text style={estilos.destaqueTexto}>
                  Nível {nivelAtual} · {descontoAtual}% de desconto
                </Text>
              </View>

              <Text style={estilos.subtitulo}>Como ganhar</Text>
              <Linha texto="Registrar vacina, consulta ou medicação" />
              <Linha texto="Fazer check-up e manter os prazos em dia" />
              <Linha texto="Comprar ou fazer check-in em parceiros" />
            </>
          ) : (
            <>
              <Text style={estilos.texto}>
                As moedas são o seu cashback: cada ação de cuidado rende moedas no mesmo
                valor dos pontos. Elas viram desconto extra em consultas, exames, planos e
                produtos de parceiros.
              </Text>

              <View style={estilos.destaque}>
                <Text style={estilos.destaqueValor}>
                  {moedas.toLocaleString('pt-BR')} moedas acumuladas
                </Text>
                <Text style={estilos.destaqueTexto}>
                  {moedasLiberadas
                    ? 'Disponíveis para uso'
                    : 'Guardadas até a liberação'}
                </Text>
              </View>

              {!moedasLiberadas && (
                <View style={estilos.aviso}>
                  <Ionicons name="lock-closed" size={16} color={cores.alerta} />
                  <Text style={estilos.avisoTexto}>
                    {pontosParaPremium > 0
                      ? `Faltam ${pontosParaPremium.toLocaleString('pt-BR')} pontos para o nível Tutor Premium, quando você poderá gastar as moedas.`
                      : 'O uso das moedas é liberado no nível Tutor Premium.'}
                  </Text>
                </View>
              )}

              <Text style={estilos.subtitulo}>Onde usar</Text>
              <Linha texto="Consultas e exames na clínica" />
              <Linha texto="Produtos em pet shops parceiros" />
              <Linha texto="Sua assinatura dentro do app" />
              <Text style={estilos.rodape}>
                O desconto total é limitado a 25% por compra.
              </Text>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Linha({ texto }: { texto: string }) {
  return (
    <View style={estilos.linha}>
      <Ionicons name="checkmark-circle" size={15} color={cores.primaria} />
      <Text style={estilos.linhaTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: cores.overlay,
    justifyContent: 'center',
    padding: espacamentos.lg,
  },
  painel: {
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.lg,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamentos.md,
  },
  tituloArea: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  titulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  texto: { ...tipografia.corpo, color: cores.textoSecundario, lineHeight: 20 },
  destaque: {
    backgroundColor: cores.superficieAlt,
    borderRadius: raios.md,
    padding: espacamentos.md,
    marginVertical: espacamentos.md,
  },
  destaqueValor: { color: cores.textoPrincipal, fontSize: 18, fontWeight: '800' },
  destaqueTexto: { color: cores.textoSecundario, fontSize: 12, marginTop: 2 },
  aviso: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    backgroundColor: 'rgba(255,180,84,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.md,
  },
  avisoTexto: { flex: 1, color: cores.alerta, fontSize: 12, lineHeight: 17 },
  subtitulo: {
    ...tipografia.legenda,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    marginBottom: espacamentos.xs,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm, paddingVertical: 3 },
  linhaTexto: { flex: 1, color: cores.textoSecundario, fontSize: 13 },
  rodape: {
    color: cores.textoSuave,
    fontSize: 11,
    marginTop: espacamentos.sm,
    fontStyle: 'italic',
  },
});
