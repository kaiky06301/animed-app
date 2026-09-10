import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

interface Props extends TextInputProps {
  rotulo: string;
  erro?: string | null;
}

/** Campo de formulário com rótulo e mensagem de validação. */
export function CampoTexto({ rotulo, erro, style, ...rest }: Props) {
  return (
    <View style={estilos.container}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        placeholderTextColor={cores.textoSuave}
        {...rest}
        style={[estilos.campo, !!erro && estilos.campoComErro, style]}
      />
      {!!erro && <Text style={estilos.erro}>{erro}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    marginBottom: espacamentos.md,
  },
  rotulo: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
    marginBottom: espacamentos.xs,
  },
  campo: {
    backgroundColor: cores.superficieAlt,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 4,
    color: cores.textoPrincipal,
    fontSize: 15,
  },
  campoComErro: {
    borderColor: cores.erro,
  },
  erro: {
    ...tipografia.legenda,
    color: cores.erro,
    marginTop: espacamentos.xs,
  },
});
