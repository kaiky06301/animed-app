import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacamentos, raios } from '../theme/cores';

interface Props {
  onIrParaCuidados: () => void;
}

/**
 * Estado vazio da agenda do tutor.
 *
 * Em vez de uma lista em branco, convida a marcar o primeiro atendimento
 * e leva direto para onde isso é feito.
 */
export function SemAtendimentos({ onIrParaCuidados }: Props) {
  return (
    <View style={estilos.container}>
      {/* Patinhas de fundo, bem discretas */}
      <Ionicons name="paw" size={130} color={cores.laranja} style={estilos.patinhaEsquerda} />
      <Ionicons name="paw" size={90} color={cores.laranja} style={estilos.patinhaDireita} />

      <View style={estilos.ilustracao}>
        <View style={estilos.recorte}>
          {/* O banner é largo: a imagem é deslocada para enquadrar o cão */}
          <Image
            source={require('../../assets/banner-cadastre-pet.png')}
            style={estilos.foto}
            resizeMode="cover"
          />
        </View>

        <View style={estilos.selo}>
          <Ionicons name="paw" size={22} color={cores.laranja} />
        </View>

        <Ionicons name="heart-outline" size={30} color={cores.laranja} style={estilos.coracao} />

        <View style={[estilos.risco, estilos.riscoA]} />
        <View style={[estilos.risco, estilos.riscoB]} />
        <View style={[estilos.risco, estilos.riscoC]} />
        <View style={[estilos.risco, estilos.riscoD]} />
      </View>

      <Text style={estilos.titulo}>Nenhum atendimento{'\n'}por aqui ainda.</Text>

      <Text style={estilos.texto}>
        Marque o primeiro na aba Cuidados{'\n'}e comece a cuidar ainda melhor{'\n'}do seu
        melhor amigo!
      </Text>

      <Pressable
        onPress={onIrParaCuidados}
        style={({ pressed }) => [estilos.botao, pressed && { opacity: 0.85 }]}
      >
        <MaterialCommunityIcons name="calendar-blank-outline" size={20} color="#3B1A05" />
        <Text style={estilos.botaoTexto}>Ir para Cuidados</Text>
        <Ionicons name="arrow-forward" size={18} color="#3B1A05" />
      </Pressable>
    </View>
  );
}

const TAMANHO = 190;

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacamentos.md,
  },

  patinhaEsquerda: {
    position: 'absolute',
    bottom: -70,
    left: -50,
    opacity: 0.05,
    transform: [{ rotate: '-18deg' }],
  },
  patinhaDireita: {
    position: 'absolute',
    bottom: -40,
    right: -30,
    opacity: 0.04,
    transform: [{ rotate: '14deg' }],
  },

  ilustracao: {
    width: TAMANHO + 70,
    height: TAMANHO + 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamentos.lg,
  },
  recorte: {
    width: TAMANHO,
    height: TAMANHO,
    overflow: 'hidden',
    backgroundColor: cores.laranjaSuave,
    // cantos desiguais dão o contorno orgânico da ilustração
    borderTopLeftRadius: TAMANHO * 0.5,
    borderTopRightRadius: TAMANHO * 0.42,
    borderBottomLeftRadius: TAMANHO * 0.38,
    borderBottomRightRadius: TAMANHO * 0.52,
  },
  foto: {
    position: 'absolute',
    width: 652,
    height: TAMANHO,
    left: -381,
    top: 0,
  },

  selo: {
    position: 'absolute',
    top: 4,
    right: 14,
    width: 46,
    height: 46,
    borderRadius: raios.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.45)',
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coracao: { position: 'absolute', left: 34, bottom: 52 },

  risco: {
    position: 'absolute',
    height: 4,
    borderRadius: raios.pill,
    backgroundColor: cores.laranja,
  },
  riscoA: { width: 26, top: 26, left: 18, transform: [{ rotate: '42deg' }] },
  riscoB: { width: 20, top: 52, left: 6, transform: [{ rotate: '20deg' }] },
  riscoC: { width: 26, top: 74, right: 10, transform: [{ rotate: '-38deg' }] },
  riscoD: { width: 20, top: 102, right: 4, transform: [{ rotate: '-14deg' }] },

  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: cores.textoPrincipal,
    textAlign: 'center',
    lineHeight: 31,
  },
  texto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: espacamentos.sm + 4,
  },

  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm + 2,
    backgroundColor: cores.laranja,
    borderRadius: raios.pill,
    paddingHorizontal: espacamentos.lg,
    paddingVertical: espacamentos.md - 2,
    marginTop: espacamentos.lg,
  },
  botaoTexto: { color: '#3B1A05', fontSize: 15, fontWeight: '800' },
});
