import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

interface Props {
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  sugestoes: string[];
  placeholder?: string;
  erro?: string | null;
  iconeRotulo?: keyof typeof Ionicons.glyphMap;
  icone?: keyof typeof Ionicons.glyphMap;
  /** Texto exibido acima da lista, explicando a origem das opções. */
  dica?: string;
}

/**
 * Campo de texto com sugestões.
 *
 * As opções padronizam os valores mais comuns, mas o campo continua
 * aceitando texto livre — o usuário nunca fica preso à lista.
 */
export function CampoSugestao({
  rotulo,
  valor,
  onChange,
  sugestoes,
  placeholder,
  erro,
  iconeRotulo,
  icone,
  dica,
}: Props) {
  const [aberto, setAberto] = useState(false);

  const filtradas = useMemo(() => {
    const termo = valor.trim().toLowerCase();
    if (!termo) return sugestoes;

    return sugestoes.filter((opcao) => opcao.toLowerCase().includes(termo));
  }, [valor, sugestoes]);

  // Já escolheu exatamente uma das opções: não há o que sugerir
  const escolhaExata = sugestoes.some((o) => o.toLowerCase() === valor.trim().toLowerCase());

  const mostrarLista = aberto && filtradas.length > 0 && !escolhaExata;

  return (
    <View style={estilos.container}>
      <View style={estilos.linhaRotulo}>
        {!!iconeRotulo && <Ionicons name={iconeRotulo} size={14} color={cores.textoSuave} />}
        <Text style={estilos.rotulo}>{rotulo}</Text>
      </View>

      <View style={[estilos.campo, !!erro && estilos.campoComErro]}>
        {!!icone && <Ionicons name={icone} size={17} color={cores.textoSuave} />}

        <TextInput
          value={valor}
          onChangeText={(texto) => {
            onChange(texto);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          placeholder={placeholder}
          placeholderTextColor={cores.textoSuave}
          style={estilos.entrada}
        />

        <Pressable onPress={() => setAberto((a) => !a)} hitSlop={10}>
          <Ionicons
            name={mostrarLista ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={cores.primaria}
          />
        </Pressable>
      </View>

      {mostrarLista && (
        <View style={estilos.lista}>
          {!!dica && <Text style={estilos.dica}>{dica}</Text>}

          <ScrollView style={estilos.rolagem} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {filtradas.map((opcao) => (
              <Pressable
                key={opcao}
                onPress={() => {
                  onChange(opcao);
                  setAberto(false);
                }}
                style={({ pressed }) => [estilos.opcao, pressed && { opacity: 0.6 }]}
              >
                <Text style={estilos.opcaoTexto}>{opcao}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={estilos.livre}>Não encontrou? Pode digitar direto no campo.</Text>
        </View>
      )}

      {!!erro && <Text style={estilos.erro}>{erro}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { marginBottom: espacamentos.md },
  linhaRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: espacamentos.xs,
  },
  rotulo: { ...tipografia.legenda, color: cores.textoSecundario },
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
  campoComErro: { borderColor: cores.erro },
  entrada: { flex: 1, color: cores.textoPrincipal, fontSize: 15, padding: 0 },
  lista: {
    marginTop: espacamentos.xs,
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  dica: {
    color: cores.textoSuave,
    fontSize: 11,
    paddingHorizontal: espacamentos.md,
    paddingTop: espacamentos.sm,
  },
  rolagem: { maxHeight: 190 },
  opcao: {
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 2,
  },
  opcaoTexto: { color: cores.textoPrincipal, fontSize: 14 },
  livre: {
    color: cores.textoSuave,
    fontSize: 11,
    fontStyle: 'italic',
    paddingHorizontal: espacamentos.md,
    paddingBottom: espacamentos.sm,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: espacamentos.sm,
  },
  erro: { ...tipografia.legenda, color: cores.erro, marginTop: espacamentos.xs },
});
