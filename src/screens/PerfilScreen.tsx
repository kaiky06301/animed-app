import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { useAnimed } from '../state/AnimedContext';
import { cores, espacamentos, raios } from '../theme/cores';
import { nivelPorPontos } from '../utils/nivel';
import type { AbasParamList, RaizParamList } from '../navigation/tipos';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AbasParamList, 'Perfil'>,
  NativeStackScreenProps<RaizParamList>
>;

const ROTULO_PLANO: Record<'gratuito' | 'intermediario' | 'premium', string> = {
  gratuito: '🆓 Gratuito',
  intermediario: '💼 Intermediário',
  premium: '👑 Premium',
};

export function PerfilScreen({ navigation }: Props) {
  const { pet, pontos, plano, historico, resetarTudo } = useAnimed();
  const nivel = nivelPorPontos(pontos);

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Perfil</Text>

      <Cartao realce style={{ alignItems: 'center', gap: 6 }}>
        <View style={estilos.avatar}>
          <Text style={{ fontSize: 40 }}>{nivel.emoji}</Text>
        </View>
        <Text style={estilos.nomeTutor}>{pet?.nome ? `Tutor(a) de ${pet.nome}` : 'Tutor(a) Animed'}</Text>
        <Text style={[estilos.nivelTexto, { color: nivel.cor }]}>
          {nivel.nome} · {nivel.descontoPercentual}% de desconto
        </Text>
      </Cartao>

      <View style={estilos.grade}>
        <Indicador rotulo="Pontos" valor={pontos.toString()} />
        <Indicador rotulo="Eventos" valor={historico.length.toString()} />
        <Indicador rotulo="Plano" valor={ROTULO_PLANO[plano].split(' ')[0]} />
      </View>

      {pet ? (
        <Cartao>
          <Text style={estilos.secao}>Seu pet</Text>
          <Linha rotulo="Nome" valor={pet.nome} />
          <Linha rotulo="Espécie" valor={pet.especie === 'cao' ? 'Cão' : 'Gato'} />
          <Linha rotulo="Raça" valor={pet.raca || '—'} />
          <Linha rotulo="Idade" valor={pet.idade || '—'} />
          <Linha rotulo="Peso" valor={pet.peso ? `${pet.peso} kg` : '—'} />
          <Botao
            titulo="Editar dados do pet"
            variante="sutil"
            onPress={() => navigation.navigate('CadastroPet')}
            estilo={{ marginTop: espacamentos.md }}
          />
        </Cartao>
      ) : (
        <Cartao>
          <Text style={estilos.secao}>Cadastre seu pet</Text>
          <Text style={{ color: cores.textoSecundario, marginBottom: espacamentos.md }}>
            Você ainda não tem pet no app.
          </Text>
          <Botao
            titulo="Cadastrar pet"
            variante="laranja"
            onPress={() => navigation.navigate('CadastroPet')}
          />
        </Cartao>
      )}

      <Cartao>
        <Text style={estilos.secao}>Atalhos</Text>
        <ItemMenu
          icone="diamond"
          titulo="Planos B2C"
          subtitulo={ROTULO_PLANO[plano]}
          onPress={() => navigation.navigate('Planos')}
        />
        <ItemMenu
          icone="time"
          titulo="Histórico de pontos"
          subtitulo={`${historico.length} eventos`}
          onPress={() => navigation.navigate('Historico')}
        />
      </Cartao>

      <Botao
        titulo="Resetar dados (zera tudo)"
        variante="contorno"
        onPress={resetarTudo}
        estilo={{ marginTop: espacamentos.lg }}
      />
    </ScrollView>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.rotuloLinha}>{rotulo}</Text>
      <Text style={estilos.valorLinha}>{valor}</Text>
    </View>
  );
}

function Indicador({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <Cartao style={estilos.indicador}>
      <Text style={estilos.indicadorValor}>{valor}</Text>
      <Text style={estilos.indicadorRotulo}>{rotulo}</Text>
    </Cartao>
  );
}

function ItemMenu({
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
    <View style={estilos.itemMenu}>
      <Ionicons name={icone} size={20} color={cores.primaria} />
      <View style={{ flex: 1 }}>
        <Text style={estilos.itemTitulo}>{titulo}</Text>
        <Text style={estilos.itemSub}>{subtitulo}</Text>
      </View>
      <Botao titulo="Abrir" variante="sutil" onPress={onPress} />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.lg, paddingBottom: espacamentos.xxl, gap: espacamentos.md },
  titulo: { color: cores.textoPrincipal, fontSize: 24, fontWeight: '700' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: raios.pill,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nomeTutor: { color: cores.textoPrincipal, fontSize: 16, fontWeight: '700', marginTop: 4 },
  nivelTexto: { fontSize: 14, fontWeight: '600' },
  grade: { flexDirection: 'row', gap: espacamentos.sm },
  indicador: { flex: 1, alignItems: 'center', padding: espacamentos.sm },
  indicadorValor: { color: cores.textoPrincipal, fontSize: 20, fontWeight: '800' },
  indicadorRotulo: { color: cores.textoSecundario, fontSize: 11, marginTop: 2 },
  secao: {
    color: cores.textoPrincipal,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: espacamentos.sm,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  rotuloLinha: { color: cores.textoSecundario, fontSize: 13 },
  valorLinha: { color: cores.textoPrincipal, fontSize: 13, fontWeight: '600' },
  itemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  itemTitulo: { color: cores.textoPrincipal, fontSize: 14, fontWeight: '700' },
  itemSub: { color: cores.textoSecundario, fontSize: 12, marginTop: 2 },
});
