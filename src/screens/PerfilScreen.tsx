import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { useFotoPet } from '../hooks/useFotoPet';
import { usePets } from '../hooks/usePets';
import { useAnimed } from '../state/AnimedContext';
import { useAuth } from '../state/AuthContext';
import { cores, espacamentos, raios } from '../theme/cores';
import { nivelPorPontos } from '../utils/nivel';
import type { AbasParamList, RaizParamList } from '../navigation/tipos';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AbasParamList, 'Perfil'>,
  NativeStackScreenProps<RaizParamList>
>;

const ROTULO_PLANO: Record<'gratuito' | 'intermediario' | 'premium', string> = {
  gratuito: 'Gratuito',
  intermediario: 'Intermediário',
  premium: 'Premium',
};

export function PerfilScreen({ navigation }: Props) {
  const { pontos, plano, resetarTudo, registrarAcao } = useAnimed();
  const nivel = nivelPorPontos(pontos);

  // A foto pertence ao pet cadastrado na API; usamos o primeiro da lista
  // como pet principal do perfil.
  const { usuario } = useAuth();
  const { data: petsDaApi } = usePets(usuario?.idTutor ?? null);
  const petPrincipal = petsDaApi?.[0] ?? null;
  const { uri: fotoUri, escolherFoto } = useFotoPet(petPrincipal?.id ?? null);

  async function aoTocarNoAvatar() {
    const eraPrimeira = await escolherFoto();
    // A primeira foto de cada pet rende pontos, uma única vez.
    if (eraPrimeira) {
      registrarAcao('fotoPet', { unico: true });
    }
  }

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Perfil</Text>

      <Cartao realce style={{ alignItems: 'center', gap: 6 }}>
        <Pressable
          onPress={aoTocarNoAvatar}
          disabled={!petPrincipal}
          style={estilos.avatarArea}
        >
          <View style={estilos.avatar}>
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={estilos.avatarFoto} />
            ) : (
              <Ionicons name="camera-outline" size={28} color={cores.textoSuave} />
            )}
          </View>

          {/* Nível do tutor, sobreposto à foto */}
          <View style={[estilos.seloNivel, { borderColor: nivel.cor }]}>
            <Text style={estilos.seloNivelTexto}>{nivel.emoji}</Text>
          </View>
        </Pressable>

        {petPrincipal && (
          <Text style={estilos.dicaFoto}>
            {fotoUri
              ? 'Toque na foto para trocar'
              : `Adicione a foto de ${petPrincipal.nome} e ganhe 15 pontos`}
          </Text>
        )}
        <Text style={estilos.nomeTutor}>
          {petPrincipal ? `Tutor(a) de ${petPrincipal.nome}` : usuario?.nome ?? 'Tutor(a) Animed'}
        </Text>
        <Text style={[estilos.nivelTexto, { color: nivel.cor }]}>
          {nivel.nome} · {nivel.descontoPercentual}% de desconto
        </Text>
      </Cartao>

      <View style={estilos.grade}>
        <Indicador rotulo="Pontos" valor={pontos.toString()} cor={nivel.cor} />
        <Indicador rotulo="Plano" selo={<SeloPlano plano={plano} />} />
      </View>

      {petPrincipal ? (
        <Cartao>
          <Text style={estilos.secao}>Seu pet</Text>
          <Linha rotulo="Nome" valor={petPrincipal.nome} />
          <Linha
            rotulo="Espécie"
            valor={petPrincipal.especie === 'GATO' ? 'Gato' : 'Cachorro'}
          />
          <Linha rotulo="Raça" valor={petPrincipal.raca || '—'} />
          <Linha
            rotulo="Idade"
            valor={petPrincipal.idadeAnos != null ? `${petPrincipal.idadeAnos} ano(s)` : '—'}
          />
          <Linha
            rotulo="Peso"
            valor={petPrincipal.pesoKg != null ? `${petPrincipal.pesoKg} kg` : '—'}
          />
          <Botao
            titulo="Editar dados do pet"
            variante="sutil"
            onPress={() => navigation.navigate('FormPet', { pet: petPrincipal })}
            estilo={{ marginTop: espacamentos.md }}
          />
        </Cartao>
      ) : (
        <Cartao>
          <Text style={estilos.secao}>Cadastre seu pet</Text>
          <Text style={{ color: cores.textoSecundario, marginBottom: espacamentos.md }}>
            Você ainda não tem pet cadastrado.
          </Text>
          <Botao
            titulo="Cadastrar pet"
            variante="laranja"
            onPress={() => navigation.navigate('FormPet', { pet: undefined })}
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
          subtitulo="Ações que renderam pontos"
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

function Indicador({
  rotulo,
  valor,
  selo,
  cor,
  onPress,
}: {
  rotulo: string;
  valor?: string;
  selo?: React.ReactNode;
  cor?: string;
  onPress?: () => void;
}) {
  const conteudo = (
    <Cartao style={estilos.indicador}>
      {selo ?? (
        <Text style={[estilos.indicadorValor, !!cor && { color: cor }]}>{valor}</Text>
      )}
      <Text style={estilos.indicadorRotulo}>{rotulo}</Text>
    </Cartao>
  );

  // Quando há ação, o cartão inteiro vira área de toque
  if (!onPress) return conteudo;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.indicadorToque, pressed && { opacity: 0.7 }]}
    >
      {conteudo}
    </Pressable>
  );
}

/** Selo do plano atual, desenhado com estilo próprio de cada faixa. */
function SeloPlano({ plano }: { plano: 'gratuito' | 'intermediario' | 'premium' }) {
  const aparencia = {
    gratuito: {
      texto: 'FREE',
      cor: cores.primaria,
      fundo: cores.primariaSuave,
      borda: 'rgba(34,211,160,0.45)',
    },
    intermediario: {
      texto: 'PLUS',
      cor: cores.laranja,
      fundo: cores.laranjaSuave,
      borda: 'rgba(255,138,61,0.45)',
    },
    premium: {
      texto: 'PRO',
      cor: cores.dourado,
      fundo: cores.douradoSuave,
      borda: 'rgba(255,200,87,0.5)',
    },
  }[plano];

  return (
    <View
      style={[
        estilos.selo,
        { backgroundColor: aparencia.fundo, borderColor: aparencia.borda },
      ]}
    >
      <Text style={[estilos.seloTexto, { color: aparencia.cor }]}>{aparencia.texto}</Text>
    </View>
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
  avatarArea: { alignItems: 'center', justifyContent: 'center' },
  avatarFoto: { width: '100%', height: '100%' },
  seloNivel: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    width: 30,
    height: 30,
    borderRadius: raios.pill,
    borderWidth: 2,
    backgroundColor: cores.fundoElevado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seloNivelTexto: { fontSize: 14 },
  dicaFoto: {
    color: cores.textoSuave,
    fontSize: 11,
    textAlign: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    overflow: 'hidden',
    borderRadius: raios.pill,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nomeTutor: { color: cores.textoPrincipal, fontSize: 16, fontWeight: '700', marginTop: 4 },
  nivelTexto: { fontSize: 14, fontWeight: '600' },
  grade: { flexDirection: 'row', gap: espacamentos.sm },
  indicador: { flex: 1, alignItems: 'center', padding: espacamentos.sm },
  indicadorToque: { flex: 1 },
  selo: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: raios.pill,
    borderWidth: 1,
    marginBottom: 2,
  },
  seloTexto: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
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
