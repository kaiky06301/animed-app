import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

interface Props extends TextInputProps {
  rotulo: string;
  erro?: string | null;
  /** Ícone exibido junto ao rótulo. */
  iconeRotulo?: keyof typeof Ionicons.glyphMap;
  /** Ícone exibido dentro do campo, à esquerda. */
  icone?: keyof typeof Ionicons.glyphMap;
  /** Ícone ou texto exibido à direita, dentro do campo. */
  sufixo?: keyof typeof Ionicons.glyphMap;
  sufixoTexto?: string;
}

/** Campo de formulário com rótulo, ícones e mensagem de validação. */
export function CampoTexto({
  rotulo,
  erro,
  iconeRotulo,
  icone,
  sufixo,
  sufixoTexto,
  style,
  multiline,
  ...rest
}: Props) {
  return (
    <View style={estilos.container}>
      <View style={estilos.linhaRotulo}>
        {!!iconeRotulo && <Ionicons name={iconeRotulo} size={14} color={cores.textoSuave} />}
        <Text style={estilos.rotulo}>{rotulo}</Text>
      </View>

      <View
        style={[
          estilos.campo,
          multiline && estilos.campoMultilinha,
          !!erro && estilos.campoComErro,
        ]}
      >
        {!!icone && (
          <Ionicons
            name={icone}
            size={17}
            color={cores.textoSuave}
            style={multiline ? { marginTop: 2 } : undefined}
          />
        )}

        <TextInput
          placeholderTextColor={cores.textoSuave}
          multiline={multiline}
          {...rest}
          style={[estilos.entrada, style]}
        />

        {!!sufixoTexto && <Text style={estilos.sufixoTexto}>{sufixoTexto}</Text>}
        {!!sufixo && <Ionicons name={sufixo} size={16} color={cores.textoSuave} />}
      </View>

      {!!erro && <Text style={estilos.erro}>{erro}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    marginBottom: espacamentos.md,
  },
  linhaRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: espacamentos.xs,
  },
  rotulo: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.superficieAlt,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 4,
  },
  campoMultilinha: { alignItems: 'flex-start' },
  entrada: {
    flex: 1,
    color: cores.textoPrincipal,
    fontSize: 15,
    padding: 0,
  },
  sufixoTexto: { color: cores.textoSuave, fontSize: 13 },
  campoComErro: {
    borderColor: cores.erro,
  },
  erro: {
    ...tipografia.legenda,
    color: cores.erro,
    marginTop: espacamentos.xs,
  },
});
