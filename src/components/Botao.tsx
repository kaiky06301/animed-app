import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { cores, raios } from '../theme/cores';

type Variante = 'primaria' | 'laranja' | 'contorno' | 'sutil';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  carregando?: boolean;
  desabilitado?: boolean;
  estilo?: ViewStyle;
}

const fundos: Record<Variante, string> = {
  primaria: cores.primaria,
  laranja: cores.laranja,
  contorno: 'transparent',
  sutil: cores.superficieAlt,
};

const textos: Record<Variante, string> = {
  primaria: '#04261C',
  laranja: '#3B1A05',
  contorno: cores.primaria,
  sutil: cores.textoPrincipal,
};

export function Botao({
  titulo,
  onPress,
  variante = 'primaria',
  carregando = false,
  desabilitado = false,
  estilo,
}: Props) {
  const indisponivel = desabilitado || carregando;
  return (
    <Pressable
      onPress={onPress}
      disabled={indisponivel}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: fundos[variante],
          borderColor: variante === 'contorno' ? cores.primaria : 'transparent',
          opacity: indisponivel ? 0.5 : pressed ? 0.85 : 1,
        },
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={textos[variante]} />
      ) : (
        <Text style={[estilos.titulo, { color: textos[variante] }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: raios.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
