import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { useAnimed } from '../state/AnimedContext';
import type { PlanoB2C } from '../state/tipos';
import { espacamentos, raios, type Paleta } from '../theme/cores';
import { useEstilos, useTema } from '../state/TemaContext';

interface InfoPlano {
  codigo: PlanoB2C;
  nome: string;
  emoji: string;
  preco: string;
  /** Cor da paleta usada no destaque do plano. */
  cor: keyof Paleta;
  beneficios: string[];
}

const PLANOS: InfoPlano[] = [
  {
    codigo: 'gratuito',
    nome: 'Gratuito',
    emoji: '🆓',
    preco: 'R$ 0',
    cor: 'textoSecundario',
    beneficios: [
      'Cadastro do pet',
      'Lembretes básicos',
      'Pontuação inicial',
      'Acesso limitado à comunidade',
    ],
  },
  {
    codigo: 'intermediario',
    nome: 'Intermediário',
    emoji: '💼',
    preco: 'R$ 14,90/mês',
    cor: 'laranja',
    beneficios: [
      'Tudo do plano gratuito',
      'Relatórios personalizados',
      'Gamificação completa',
      'Alertas inteligentes',
      'Benefícios extra com parceiros',
    ],
  },
  {
    codigo: 'premium',
    nome: 'Premium',
    emoji: '👑',
    preco: 'R$ 29,90/mês',
    cor: 'dourado',
    beneficios: [
      'Tudo do plano intermediário',
      'Telemedicina (em breve)',
      'IA personalizada',
      'Suporte prioritário',
      'Descontos máximos com parceiros',
    ],
  },
];

export function PlanosScreen() {
  const { cores } = useTema();
  const estilos = useEstilos(criarEstilos);
  const { plano, escolherPlano } = useAnimed();

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Planos Animed</Text>
      <Text style={estilos.subtitulo}>
        Escolha o plano que combina com a rotina do seu pet.
      </Text>

      {PLANOS.map((p) => {
        const atual = p.codigo === plano;
        const corDoPlano = cores[p.cor];
        return (
          <Cartao
            key={p.codigo}
            realce={atual}
            style={atual ? { borderColor: corDoPlano } : undefined}
          >
            <View style={estilos.topo}>
              <View>
                <Text style={[estilos.nomePlano, { color: corDoPlano }]}>
                  {p.emoji} {p.nome}
                </Text>
                <Text style={estilos.preco}>{p.preco}</Text>
              </View>
              {atual && (
                <View style={[estilos.tag, { backgroundColor: corDoPlano + '22' }]}>
                  <Text style={{ color: corDoPlano, fontWeight: '700', fontSize: 11 }}>
                    PLANO ATUAL
                  </Text>
                </View>
              )}
            </View>

            <View style={{ gap: 6, marginTop: espacamentos.md }}>
              {p.beneficios.map((b) => (
                <View key={b} style={estilos.beneficio}>
                  <Ionicons name="checkmark-circle" size={16} color={corDoPlano} />
                  <Text style={estilos.beneficioTexto}>{b}</Text>
                </View>
              ))}
            </View>

            <Botao
              titulo={atual ? 'Plano ativo' : `Mudar pra ${p.nome}`}
              variante={atual ? 'sutil' : p.codigo === 'gratuito' ? 'sutil' : 'primaria'}
              desabilitado={atual}
              onPress={() => escolherPlano(p.codigo)}
              estilo={{ marginTop: espacamentos.md }}
            />
          </Cartao>
        );
      })}
    </ScrollView>
  );
}

const criarEstilos = (cores: Paleta) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.lg, paddingBottom: espacamentos.xxl, gap: espacamentos.md },
  titulo: { color: cores.textoPrincipal, fontSize: 24, fontWeight: '700' },
  subtitulo: { color: cores.textoSecundario, fontSize: 13 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nomePlano: { fontSize: 18, fontWeight: '800' },
  preco: { color: cores.textoPrincipal, fontSize: 14, marginTop: 2, fontWeight: '600' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: raios.pill },
  beneficio: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  beneficioTexto: { color: cores.textoPrincipal, fontSize: 13, flex: 1 },
});
