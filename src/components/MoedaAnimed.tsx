import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { cores, raios } from '../theme/cores';

interface Props {
  tamanho?: number;
  ativa?: boolean;
}

/**
 * Moeda do Animed: um disco com a pata no centro.
 * Evita ícones de outras moedas e reforça a identidade do produto.
 */
export function MoedaAnimed({ tamanho = 16, ativa = true }: Props) {
  const corPrincipal = ativa ? cores.dourado : cores.textoSuave;

  return (
    <View
      style={[
        estilos.disco,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: raios.pill,
          borderColor: corPrincipal,
          backgroundColor: ativa ? 'rgba(255,200,87,0.22)' : 'transparent',
        },
      ]}
    >
      <Ionicons name="paw" size={tamanho * 0.55} color={corPrincipal} />
    </View>
  );
}

const estilos = StyleSheet.create({
  disco: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
