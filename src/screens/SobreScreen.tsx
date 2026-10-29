import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Cartao } from '../components/Cartao';
import { useEstilos, useTema } from '../state/TemaContext';
import { espacamentos, raios, tipografia, type Paleta } from '../theme/cores';

const VERSAO = Constants.expoConfig?.version ?? '—';
const COMMIT: string = Constants.expoConfig?.extra?.commit ?? 'desconhecido';

/**
 * Identifica a versão instalada.
 *
 * O hash do commit permite conferir que o app publicado é exatamente o
 * código que está no repositório.
 */
export function SobreScreen() {
  const { cores } = useTema();
  const estilos = useEstilos(criarEstilos);

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.topo}>
        <View style={estilos.logo}>
          <Ionicons name="paw" size={34} color={cores.primaria} />
        </View>
        <Text style={estilos.nome}>Animed</Text>
        <Text style={estilos.slogan}>Cuidado contínuo para o seu pet</Text>
      </View>

      <Cartao>
        <Text style={estilos.secao}>Versão instalada</Text>
        <Linha rotulo="Versão" valor={VERSAO} />
        <Linha rotulo="Commit" valor={COMMIT.slice(0, 7)} destaque />
        <Linha rotulo="Plataforma" valor={Platform.OS} />
        <Text style={estilos.rotuloHash}>Hash completo do commit</Text>
        <Text style={estilos.hash} selectable>
          {COMMIT}
        </Text>
      </Cartao>

      <Cartao>
        <Text style={estilos.secao}>Sobre o projeto</Text>
        <Text style={estilos.texto}>
          O Animed transforma o cuidado com o pet em uma rotina contínua: vacinas, consultas e
          medicamentos viram pontos e moedas que o tutor troca por benefícios nos parceiros.
        </Text>
        <Text style={[estilos.texto, { marginTop: espacamentos.sm }]}>
          Desenvolvido para o Challenge FIAP 2026 em parceria com a Clyvo VET.
        </Text>
      </Cartao>
    </ScrollView>
  );
}

function Linha({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  const { cores } = useTema();
  const estilos = useEstilos(criarEstilos);
  return (
    <View style={estilos.linha}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={[estilos.valor, destaque && { color: cores.primaria }]}>{valor}</Text>
    </View>
  );
}

const criarEstilos = (cores: Paleta) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.lg, gap: espacamentos.md },
  topo: { alignItems: 'center', gap: 4, marginBottom: espacamentos.sm },
  logo: {
    width: 72,
    height: 72,
    borderRadius: raios.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaSuave,
    marginBottom: espacamentos.sm,
  },
  nome: { ...tipografia.titulo, color: cores.textoPrincipal },
  slogan: { color: cores.textoSecundario, fontSize: 13 },
  secao: { ...tipografia.subtitulo, color: cores.textoPrincipal, marginBottom: espacamentos.sm },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  rotulo: { color: cores.textoSecundario, fontSize: 14 },
  valor: { color: cores.textoPrincipal, fontSize: 14, fontWeight: '700' },
  rotuloHash: { color: cores.textoSuave, fontSize: 12, marginTop: espacamentos.md },
  hash: {
    color: cores.textoPrincipal,
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    marginTop: 4,
  },
  texto: { color: cores.textoSecundario, fontSize: 14, lineHeight: 20 },
});
