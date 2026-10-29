import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { espacamentos, raios, type Paleta } from '../theme/cores';
import { useEstilos, useTema } from '../state/TemaContext';

interface Props extends ViewProps {
  realce?: boolean;
}

export function Cartao({ style, realce = false, children, ...rest }: Props) {
  const { cores } = useTema();
  const estilos = useEstilos(criarEstilos);
  return (
    <View
      {...rest}
      style={[
        estilos.base,
        realce && { borderColor: cores.primariaSuave },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const criarEstilos = (cores: Paleta) =>
  StyleSheet.create({
  base: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
  },
});
