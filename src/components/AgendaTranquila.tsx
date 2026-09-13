import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores, espacamentos, tipografia } from '../theme/cores';

interface Props {
  titulo?: string;
  texto?: string;
}

/** Espessura do traço do desenho. */
const TRACO = 2.5;

/**
 * Fechamento da agenda do dia.
 *
 * Aparece abaixo da lista para dizer ao veterinário que não há mais nada
 * pendente — uma agenda vazia aqui é boa notícia, não um erro, e a
 * ilustração existe para que ela não seja lida como tela quebrada.
 *
 * O calendário é desenhado com Views em vez de um ícone de fonte: os ícones
 * prontos vêm com o cabeçalho preenchido, e o traço aberto combina com o
 * resto das ilustrações do aplicativo.
 */
export function AgendaTranquila({
  titulo = 'Tudo certo por enquanto!',
  texto = 'Quando houver novas consultas,\nelas aparecerão aqui.',
}: Props) {
  return (
    <View style={estilos.container}>
      <View style={estilos.ilustracao}>
        <View style={estilos.mancha} />

        <View style={estilos.calendario}>
          {/* Argolas do topo, como as de um calendário de mesa */}
          <View style={estilos.argolas}>
            <View style={estilos.barra} />
            <View style={[estilos.anel, { left: 16 }]} />
            <View style={[estilos.anel, { right: 16 }]} />
          </View>

          <View style={estilos.folha}>
            <Ionicons name="paw" size={26} color={cores.azulSuave} />
          </View>
        </View>

        <Ionicons name="heart" size={22} color={cores.laranja} style={estilos.coracao} />

        <View style={[estilos.risco, estilos.riscoEsquerdaCima]} />
        <View style={[estilos.risco, estilos.riscoEsquerdaBaixo]} />
        <View style={[estilos.risco, estilos.riscoDireitaCima]} />
        <View style={[estilos.risco, estilos.riscoDireitaBaixo]} />
      </View>

      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: espacamentos.xl },

  ilustracao: {
    width: 210,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamentos.md,
  },
  mancha: {
    position: 'absolute',
    width: 162,
    height: 126,
    backgroundColor: cores.superficie,
    borderTopLeftRadius: 86,
    borderTopRightRadius: 66,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 92,
    transform: [{ rotate: '-5deg' }],
  },

  calendario: { alignItems: 'center' },

  argolas: {
    width: 62,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  barra: {
    width: '100%',
    height: TRACO,
    borderRadius: TRACO,
    backgroundColor: cores.azulSuave,
  },
  anel: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: TRACO,
    borderColor: cores.azulSuave,
  },

  folha: {
    width: 74,
    height: 62,
    borderWidth: TRACO,
    borderColor: cores.azulSuave,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  coracao: { position: 'absolute', top: 22, right: 44 },

  risco: {
    position: 'absolute',
    width: 15,
    height: TRACO,
    borderRadius: TRACO,
    backgroundColor: cores.primaria,
  },
  riscoEsquerdaCima: { left: 24, top: 56, transform: [{ rotate: '-26deg' }] },
  riscoEsquerdaBaixo: { left: 20, top: 80, transform: [{ rotate: '14deg' }] },
  riscoDireitaCima: { right: 24, top: 56, transform: [{ rotate: '26deg' }] },
  riscoDireitaBaixo: { right: 20, top: 80, transform: [{ rotate: '-14deg' }] },

  titulo: {
    ...tipografia.subtitulo,
    color: cores.textoPrincipal,
    textAlign: 'center',
  },
  texto: {
    fontSize: 13,
    color: cores.textoSecundario,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 4,
  },
});
