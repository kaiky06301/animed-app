import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { useAnimed } from '../state/AnimedContext';
import { cores, espacamentos, raios } from '../theme/cores';
import { nivelPorPontos, progressoNivel, proximoNivel } from '../utils/nivel';
import type { AbasParamList, RaizParamList } from '../navigation/tipos';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AbasParamList, 'Inicio'>,
  NativeStackScreenProps<RaizParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { pet, pontos, registrarAcao } = useAnimed();
  const nivel = nivelPorPontos(pontos);
  const proximo = proximoNivel(pontos);
  const progresso = progressoNivel(pontos);

  useEffect(() => {
    registrarAcao('usoDiario', { unico: true });
  }, [registrarAcao]);

  return (
    <ScrollView
      style={estilos.container}
      contentContainerStyle={estilos.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={estilos.cabecalho}>
        <View>
          <Text style={estilos.saudacao}>Olá, tutor!</Text>
          <Text style={estilos.titulo}>
            Bem-vindo ao <Text style={{ color: cores.primaria }}>Animed</Text>
          </Text>
        </View>
        <View style={estilos.distintivoNivel}>
          <Text style={estilos.emoji}>{nivel.emoji}</Text>
        </View>
      </View>

      <Cartao realce style={estilos.cartaoPontos}>
        <Text style={estilos.legenda}>Sua pontuação</Text>
        <Text style={estilos.pontos}>{pontos}</Text>
        <Text style={[estilos.nivelTexto, { color: nivel.cor }]}>
          {nivel.emoji} {nivel.nome} · {nivel.descontoPercentual}% de desconto
        </Text>
        <View style={estilos.barraFundo}>
          <View style={[estilos.barraProgresso, { width: `${progresso * 100}%` }]} />
        </View>
        <Text style={estilos.dicaProgresso}>
          {proximo
            ? `Faltam ${proximo.minimo - pontos} pts para virar ${proximo.nome}`
            : 'Você está no nível máximo!'}
        </Text>
      </Cartao>

      {!pet ? (
        <Cartao style={estilos.cartaoVazio}>
          <Ionicons name="paw" size={32} color={cores.laranja} />
          <Text style={estilos.tituloCard}>Cadastre seu pet</Text>
          <Text style={estilos.subtituloCard}>
            Comece sua jornada. Cada dado preenchido gera pontos.
          </Text>
          <Botao
            titulo="Cadastrar pet"
            variante="laranja"
            onPress={() => navigation.navigate('CadastroPet')}
            estilo={{ marginTop: espacamentos.md }}
          />
        </Cartao>
      ) : (
        <Cartao>
          <View style={estilos.linhaPet}>
            <View style={estilos.avatarPet}>
              <Ionicons
                name={pet.especie === 'gato' ? 'logo-octocat' : 'paw'}
                size={28}
                color={cores.primaria}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.nomePet}>{pet.nome}</Text>
              <Text style={estilos.descPet}>
                {pet.raca || 'Sem raça'} · {pet.idade || '—'} · {pet.peso || '—'} kg
              </Text>
            </View>
          </View>
        </Cartao>
      )}

      <Text style={estilos.secao}>Atalhos</Text>
      <View style={estilos.grade}>
        <AtalhoBotao
          icone="medkit"
          titulo="Cuidados"
          subtitulo="Vacina, consulta, peso"
          onPress={() => navigation.navigate('Cuidados')}
        />
        <AtalhoBotao
          icone="gift"
          titulo="Recompensas"
          subtitulo="Use seus pontos"
          onPress={() => navigation.navigate('Recompensas')}
        />
        <AtalhoBotao
          icone="people"
          titulo="Comunidade"
          subtitulo="Dicas de tutores"
          onPress={() => navigation.navigate('Comunidade')}
        />
        <AtalhoBotao
          icone="diamond"
          titulo="Planos"
          subtitulo="Faça upgrade"
          onPress={() => navigation.navigate('Planos')}
        />
      </View>
    </ScrollView>
  );
}

function AtalhoBotao({
  icone,
  titulo,
  subtitulo,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  subtitulo: string;
  onPress: () => void;
}) {
  return (
    <Cartao style={estilos.atalho}>
      <Ionicons name={icone} size={22} color={cores.primaria} />
      <Text style={estilos.atalhoTitulo}>{titulo}</Text>
      <Text style={estilos.atalhoSub}>{subtitulo}</Text>
      <Botao titulo="Abrir" variante="sutil" onPress={onPress} estilo={{ marginTop: 8 }} />
    </Cartao>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.lg, paddingBottom: espacamentos.xxl, gap: espacamentos.md },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saudacao: { color: cores.textoSecundario, fontSize: 13 },
  titulo: { color: cores.textoPrincipal, fontSize: 24, fontWeight: '700' },
  distintivoNivel: {
    width: 52,
    height: 52,
    borderRadius: raios.pill,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  emoji: { fontSize: 26 },
  cartaoPontos: { gap: 6 },
  legenda: { color: cores.textoSecundario, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  pontos: { color: cores.textoPrincipal, fontSize: 42, fontWeight: '800' },
  nivelTexto: { fontSize: 14, fontWeight: '600' },
  barraFundo: {
    height: 8,
    borderRadius: raios.pill,
    backgroundColor: cores.superficieAlt,
    marginTop: 8,
    overflow: 'hidden',
  },
  barraProgresso: { height: '100%', backgroundColor: cores.primaria, borderRadius: raios.pill },
  dicaProgresso: { color: cores.textoSecundario, fontSize: 12, marginTop: 4 },
  cartaoVazio: { gap: 6, alignItems: 'flex-start' },
  tituloCard: { color: cores.textoPrincipal, fontSize: 18, fontWeight: '700' },
  subtituloCard: { color: cores.textoSecundario, fontSize: 13 },
  linhaPet: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.md },
  avatarPet: {
    width: 56,
    height: 56,
    borderRadius: raios.pill,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nomePet: { color: cores.textoPrincipal, fontSize: 18, fontWeight: '700' },
  descPet: { color: cores.textoSecundario, fontSize: 13, marginTop: 2 },
  secao: {
    color: cores.textoPrincipal,
    fontSize: 16,
    fontWeight: '700',
    marginTop: espacamentos.sm,
  },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.md },
  atalho: { width: '47%', gap: 4 },
  atalhoTitulo: { color: cores.textoPrincipal, fontSize: 15, fontWeight: '700', marginTop: 6 },
  atalhoSub: { color: cores.textoSecundario, fontSize: 12 },
});
