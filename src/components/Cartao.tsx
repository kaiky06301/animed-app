import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { cores, espacamentos, raios } from '../theme/cores';

interface Props extends ViewProps {
  realce?: boolean;
}

export function Cartao({ style, realce = false, children, ...rest }: Props) {
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

const estilos = StyleSheet.create({
  base: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
  },
});
