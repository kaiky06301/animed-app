import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
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
  /** Conteúdo exibido dentro do campo, abaixo do texto. */
  rodape?: React.ReactNode;
  /**
   * Campo de senha: o conteúdo nasce oculto e ganha o botão de revelar.
   *
   * Digitar senha às cegas em teclado de celular é fonte de erro; deixar
   * conferir o que foi digitado evita tentativas repetidas.
   */
  senha?: boolean;
}

/** Campo de formulário com rótulo, ícones e mensagem de validação. */
export function CampoTexto({
  rotulo,
  erro,
  iconeRotulo,
  icone,
  sufixo,
  sufixoTexto,
  rodape,
  senha,
  style,
  multiline,
  ...rest
}: Props) {
  const [revelada, setRevelada] = useState(false);

  return (
    <View style={estilos.container}>
      <View style={estilos.linhaRotulo}>
        {!!iconeRotulo && <Ionicons name={iconeRotulo} size={14} color={cores.textoSuave} />}
        <Text style={estilos.rotulo}>{rotulo}</Text>
      </View>

      <View style={[estilos.caixa, !!erro && estilos.campoComErro]}>
        <View style={[estilos.campo, multiline && estilos.campoMultilinha]}>
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
            secureTextEntry={senha && !revelada}
            autoCapitalize={senha ? 'none' : rest.autoCapitalize}
            {...rest}
            style={[estilos.entrada, style]}
          />

          {!!sufixoTexto && <Text style={estilos.sufixoTexto}>{sufixoTexto}</Text>}
          {!!sufixo && <Ionicons name={sufixo} size={16} color={cores.textoSuave} />}

          {senha && (
            <Pressable
              onPress={() => setRevelada((v) => !v)}
              hitSlop={10}
              accessibilityLabel={revelada ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <Ionicons
                name={revelada ? 'eye-off-outline' : 'eye-outline'}
                size={19}
                color={revelada ? cores.primaria : cores.textoSuave}
              />
            </Pressable>
          )}
        </View>

        {!!rodape && <View style={estilos.rodape}>{rodape}</View>}
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
  caixa: {
    backgroundColor: cores.superficieAlt,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 4,
  },
  rodape: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
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
