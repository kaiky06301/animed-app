import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { raios, type Paleta } from '../theme/cores';
import { useEstilos, useTema } from '../state/TemaContext';

type Variante = 'primaria' | 'laranja' | 'contorno' | 'sutil' | 'perigo';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  carregando?: boolean;
  desabilitado?: boolean;
  estilo?: ViewStyle;
  /** Ícone opcional exibido antes do texto. */
  icone?: keyof typeof Ionicons.glyphMap;
}

const fundosDaVariante = (cores: Paleta): Record<Variante, string> => ({
  primaria: cores.primaria,
  laranja: cores.laranja,
  contorno: 'transparent',
  sutil: cores.superficieAlt,
  perigo: 'transparent',
});

const textosDaVariante = (cores: Paleta): Record<Variante, string> => ({
  primaria: '#04261C',
  laranja: '#3B1A05',
  contorno: cores.primaria,
  sutil: cores.textoPrincipal,
  perigo: cores.erro,
});

export function Botao({
  titulo,
  onPress,
  variante = 'primaria',
  carregando = false,
  desabilitado = false,
  estilo,
  icone,
}: Props) {
  const { cores } = useTema();
  const estilos = useEstilos(criarEstilos);
  const indisponivel = desabilitado || carregando;
  return (
    <Pressable
      onPress={onPress}
      disabled={indisponivel}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: fundosDaVariante(cores)[variante],
          borderColor:
            variante === 'contorno'
              ? cores.primaria
              : variante === 'perigo'
                ? cores.erro
                : 'transparent',
          opacity: indisponivel ? 0.5 : pressed ? 0.85 : 1,
        },
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={textosDaVariante(cores)[variante]} />
      ) : (
        <>
          {!!icone && <Ionicons name={icone} size={17} color={textosDaVariante(cores)[variante]} />}
          <Text style={[estilos.titulo, { color: textosDaVariante(cores)[variante] }]}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
}

const criarEstilos = (cores: Paleta) =>
  StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: 8,
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
