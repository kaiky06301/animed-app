import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEstilos, useTema, type PreferenciaTema } from '../state/TemaContext';
import { espacamentos, raios, type Paleta } from '../theme/cores';

const OPCOES: { valor: PreferenciaTema; rotulo: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { valor: 'sistema', rotulo: 'Sistema', icone: 'phone-portrait-outline' },
  { valor: 'claro', rotulo: 'Claro', icone: 'sunny-outline' },
  { valor: 'escuro', rotulo: 'Escuro', icone: 'moon-outline' },
];

/** Escolha entre seguir o celular ou fixar o tema claro/escuro. */
export function SeletorTema() {
  const { cores, preferencia, mudarPreferencia } = useTema();
  const estilos = useEstilos(criarEstilos);

  return (
    <View style={estilos.grupo}>
      {OPCOES.map((opcao) => {
        const ativa = opcao.valor === preferencia;
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => mudarPreferencia(opcao.valor)}
            style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
            accessibilityRole="button"
            accessibilityState={{ selected: ativa }}
          >
            <Ionicons
              name={opcao.icone}
              size={16}
              color={ativa ? cores.primaria : cores.textoSecundario}
            />
            <Text style={[estilos.rotulo, ativa && { color: cores.primaria }]}>
              {opcao.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const criarEstilos = (cores: Paleta) =>
  StyleSheet.create({
  grupo: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    marginTop: espacamentos.sm,
  },
  opcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlt,
  },
  opcaoAtiva: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
  },
  rotulo: { color: cores.textoSecundario, fontSize: 13, fontWeight: '600' },
});
