import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { useFotoPet } from '../hooks/useFotoPet';
import { SeletorPet } from '../components/SeletorPet';
import { useSaudeDoPet } from '../hooks/useSaudeDoPet';
import { useAnimed } from '../state/AnimedContext';
import { usePetAtivo } from '../state/PetAtivoContext';
import { cores, espacamentos, raios } from '../theme/cores';
import { nivelPorPontos, progressoNivel, proximoNivel } from '../utils/nivel';
import type { AbasParamList, RaizParamList } from '../navigation/tipos';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AbasParamList, 'Inicio'>,
  NativeStackScreenProps<RaizParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { pontos, registrarAcao } = useAnimed();

  // O pet exibido é o selecionado no seletor; o app inteiro segue essa escolha
  const { petAtivo: pet, pets, selecionarPet } = usePetAtivo();
  const [seletorAberto, setSeletorAberto] = useState(false);
  const { uri: fotoPet } = useFotoPet(pet?.id ?? null);
  const { data: saude } = useSaudeDoPet(pet?.id ?? null);
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
        <View style={{ flex: 1 }}>
          <View style={estilos.linhaSaudacao}>
            <Ionicons name="paw" size={15} color={cores.laranja} />
            <Text style={estilos.saudacao}>Olá, tutor!</Text>
          </View>

          <Text style={estilos.titulo}>
            Bem-vindo ao <Text style={{ color: cores.laranja }}>Animed</Text>
          </Text>

          <View style={estilos.linhaLema}>
            <Text style={estilos.lema}>Mais saúde, mais momentos juntos</Text>
            <Ionicons name="heart" size={13} color={cores.laranja} />
          </View>
        </View>
        <Pressable
          onPress={() => setSeletorAberto(true)}
          style={({ pressed }) => [estilos.distintivoNivel, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="paw" size={22} color={cores.laranja} />
          {pets.length > 0 && (
            <View style={estilos.contadorPets}>
              <Text style={estilos.contadorPetsTexto}>{pets.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {!pet && (
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
      )}

      {!pet ? (
        <Pressable
          onPress={() => navigation.navigate('FormPet', { pet: undefined })}
          style={({ pressed }) => pressed && { opacity: 0.85 }}
        >
          <View style={estilos.bannerContainer}>
            <Image
              source={require('../../assets/banner-cadastre-pet.png')}
              style={estilos.bannerImagem}
              resizeMode="cover"
              accessibilityLabel="Cadastre seu pet. Comece sua jornada, cada dado preenchido gera pontos."
            />
          </View>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => navigation.navigate('Vacinas', { idPet: pet.id, nomePet: pet.nome })}
          style={({ pressed }) => pressed && { opacity: 0.8 }}
        >
          <Cartao style={estilos.cartaoPet}>
            <View style={estilos.linhaPet}>
              <View style={estilos.molduraFoto}>
                {fotoPet ? (
                  <Image source={{ uri: fotoPet }} style={estilos.fotoPet} />
                ) : (
                  <View style={estilos.fotoVazia}>
                    <Ionicons name="paw" size={26} color={cores.primaria} />
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={estilos.linhaNome}>
                  <Text style={estilos.nomePet}>{pet.nome}</Text>
                  {!!pet.sexo && (
                    <Ionicons
                      name={pet.sexo === 'FEMEA' ? 'female' : 'male'}
                      size={17}
                      color={pet.sexo === 'FEMEA' ? '#F472B6' : '#3B82F6'}
                    />
                  )}
                </View>
                <Text style={estilos.descPet}>
                  {[
                    pet.raca || 'Sem raça definida',
                    pet.idadeAnos != null ? `${pet.idadeAnos} anos` : null,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </Text>

                <Text style={[estilos.nivelNoPet, { color: nivel.cor }]}>
                  {nivel.emoji} {nivel.nome} · {nivel.descontoPercentual}% de desconto
                </Text>

                {/* Progresso de pontos do tutor até o próximo nível */}
                <View style={[estilos.barraFundo, estilos.barraPet]}>
                  <View
                    style={[
                      estilos.barraProgresso,
                      { width: `${Math.round(progresso * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={estilos.dicaProgressoPet}>
                  {proximo
                    ? `Faltam ${proximo.minimo - pontos} pts para virar ${proximo.nome}`
                    : 'Você está no nível máximo!'}
                </Text>
              </View>

              <View style={estilos.seloPontos}>
                <Ionicons name="paw" size={14} color={cores.laranja} />
                <Text style={estilos.seloPontosTexto}>
                  {pontos.toLocaleString('pt-BR')} pts
                </Text>
                <Ionicons name="star" size={13} color={cores.dourado} />
              </View>
            </View>

            <View style={estilos.rodapePet}>
              <View
                style={[
                  estilos.iconeSaude,
                  { backgroundColor: saude?.emDia === false ? cores.alerta : cores.primaria },
                ]}
              >
                <Ionicons
                  name={saude?.emDia === false ? 'alert' : 'paw'}
                  size={16}
                  color="#04261C"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    estilos.situacaoSaude,
                    { color: saude?.emDia === false ? cores.alerta : cores.primaria },
                  ]}
                >
                  {saude?.situacao ?? 'Carregando situação…'}
                </Text>
                <Text style={estilos.ultimaConsulta}>
                  {saude?.ultimaConsulta
                    ? `Última consulta: ${formatarData(saude.ultimaConsulta)}`
                    : 'Nenhuma consulta registrada'}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={cores.textoSuave} />
            </View>
          </Cartao>
        </Pressable>
      )}

      {!!pet && pets.length < 5 && (
        <View style={estilos.bannerContainer}>
          <Image
            source={require('../../assets/banner-cadastre-pet.png')}
            style={estilos.bannerImagem}
            resizeMode="cover"
            accessibilityLabel="Cadastre seu pet. Comece sua jornada, cada dado preenchido gera pontos."
          />

          <Pressable
            onPress={() => navigation.navigate('FormPet', { pet: undefined })}
            style={({ pressed }) => [estilos.bannerBotao, pressed && { opacity: 0.85 }]}
          >
            <Text style={estilos.bannerBotaoTexto}>Cadastrar pet</Text>
            <Ionicons name="arrow-forward" size={16} color="#3B1A05" />
          </Pressable>
        </View>
      )}

      <SeletorPet
        visivel={seletorAberto}
        pets={pets}
        idAtivo={pet?.id ?? null}
        onSelecionar={selecionarPet}
        onFechar={() => setSeletorAberto(false)}
        onCadastrar={() => navigation.navigate('FormPet', { pet: undefined })}
      />

      <Text style={estilos.secao}>Atalhos</Text>
      <View style={estilos.grade}>
        <AtalhoBotao
          icone="medkit"
          cor={CORES_ATALHO.cuidados}
          titulo="Cuidados"
          subtitulo="Vacina, consulta, peso"
          onPress={() => navigation.navigate('Cuidados')}
        />
        <AtalhoBotao
          icone="gift"
          cor={CORES_ATALHO.recompensas}
          titulo="Recompensas"
          subtitulo="Use seus pontos"
          onPress={() => navigation.navigate('Recompensas')}
        />
        <AtalhoBotao
          icone="people"
          cor={CORES_ATALHO.comunidade}
          titulo="Comunidade"
          subtitulo="Dicas de tutores"
          onPress={() => navigation.navigate('Comunidade')}
        />
        <AtalhoBotao
          icone="diamond"
          cor={CORES_ATALHO.planos}
          titulo="Planos"
          subtitulo="Faça upgrade"
          onPress={() => navigation.navigate('Planos')}
        />
      </View>
    </ScrollView>
  );
}

/** Cada atalho tem a própria cor, para diferenciar as áreas do app. */
const CORES_ATALHO = {
  cuidados: '#3DDC97',
  recompensas: '#A78BFA',
  comunidade: '#3B82F6',
  planos: '#FFC857',
} as const;

/** Converte a data vinda da API para o formato brasileiro. */
function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function AtalhoBotao({
  icone,
  cor,
  titulo,
  subtitulo,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  titulo: string;
  subtitulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.atalhoArea, pressed && { opacity: 0.75 }]}
    >
      <Cartao style={estilos.atalho}>
        <Ionicons name={icone} size={34} color={cor} />

        <View style={estilos.atalhoLinhaTitulo}>
          <Text style={estilos.atalhoTitulo}>{titulo}</Text>
          <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
        </View>

        <Text style={estilos.atalhoSub}>{subtitulo}</Text>
      </Cartao>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.lg, paddingBottom: espacamentos.xxl, gap: espacamentos.md },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espacamentos.md,
  },
  linhaSaudacao: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  saudacao: { color: cores.laranja, fontSize: 13, fontWeight: '700' },
  linhaLema: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  lema: { color: cores.textoSecundario, fontSize: 13 },
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
  linhaPet: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.md },
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
  cartaoPet: { gap: espacamentos.md },
  linhaNome: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contadorPets: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: raios.pill,
    backgroundColor: cores.laranja,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: cores.fundo,
  },
  contadorPetsTexto: { color: '#3B1A05', fontSize: 11, fontWeight: '800' },
  bannerContainer: {
    width: '100%',
    aspectRatio: 1200 / 401,
    borderRadius: raios.lg,
    overflow: 'hidden',
  },
  bannerImagem: { width: '100%', height: '100%' },
  bannerBotao: {
    position: 'absolute',
    left: '5%',
    bottom: '12%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 2,
    borderRadius: raios.pill,
    backgroundColor: '#FFA24C',
  },
  bannerBotaoTexto: { color: '#3B1A05', fontSize: 13, fontWeight: '800' },
  nivelNoPet: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  dicaProgressoPet: { color: cores.textoSecundario, fontSize: 11, marginTop: 5 },
  barraPet: { height: 9, marginTop: espacamentos.sm + 2 },
  molduraFoto: {
    width: 62,
    height: 62,
    borderRadius: raios.pill,
    borderWidth: 2,
    borderColor: cores.primaria,
    overflow: 'hidden',
  },
  fotoPet: { width: '100%', height: '100%' },
  fotoVazia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieAlt,
  },
  seloPontos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: raios.pill,
    backgroundColor: '#3A2A18',
  },
  seloPontosTexto: { color: '#F6E7D3', fontSize: 13, fontWeight: '800' },
  rodapePet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: espacamentos.md,
  },
  iconeSaude: {
    width: 30,
    height: 30,
    borderRadius: raios.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  situacaoSaude: { fontSize: 14, fontWeight: '700' },
  ultimaConsulta: { color: cores.textoSecundario, fontSize: 12, marginTop: 1 },
  atalhoArea: { width: '47%' },
  atalho: { gap: 2, paddingVertical: espacamentos.md },
  atalhoLinhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacamentos.sm,
  },
  atalhoTitulo: { color: cores.textoPrincipal, fontSize: 17, fontWeight: '700' },
  atalhoSub: { color: cores.textoSecundario, fontSize: 13 },
});
