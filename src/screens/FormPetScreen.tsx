import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { mensagemDoErro } from '../api/cliente';
import { useFotoPet } from '../hooks/useFotoPet';
import { useAtualizarPet, useCriarPet } from '../hooks/usePets';
import type { RaizParamList } from '../navigation/tipos';
import { useAuth } from '../state/AuthContext';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

type Props = NativeStackScreenProps<RaizParamList, 'FormPet'>;

const ESPECIES = [
  { valor: 'CACHORRO', rotulo: 'Cachorro', icone: 'paw' },
  { valor: 'GATO', rotulo: 'Gato', icone: 'logo-octocat' },
] as const;

const SEXOS = [
  { valor: 'MACHO', rotulo: 'Macho', icone: 'male', cor: '#3B82F6' },
  { valor: 'FEMEA', rotulo: 'Fêmea', icone: 'female', cor: '#F472B6' },
] as const;

export function FormPetScreen({ route, navigation }: Props) {
  const petEmEdicao = route.params?.pet;
  const editando = !!petEmEdicao;

  const { usuario } = useAuth();
  const criar = useCriarPet();
  const atualizar = useAtualizarPet();

  // A foto só pode ser escolhida depois que o pet existe (precisa do id)
  const { uri: fotoUri, escolherFoto, pontosGanhos } = useFotoPet(petEmEdicao?.id ?? null);

  const [nome, setNome] = useState(petEmEdicao?.nome ?? '');
  const [especie, setEspecie] = useState<string>(petEmEdicao?.especie ?? 'CACHORRO');
  const [sexo, setSexo] = useState<string | null>(petEmEdicao?.sexo ?? null);
  const [raca, setRaca] = useState(petEmEdicao?.raca ?? '');
  const [dataNascimento, setDataNascimento] = useState(petEmEdicao?.dataNascimento ?? '');
  const [peso, setPeso] = useState(
    petEmEdicao?.pesoKg != null ? String(petEmEdicao.pesoKg) : '',
  );
  const [observacoes, setObservacoes] = useState(petEmEdicao?.observacoesSaude ?? '');

  const [erros, setErros] = useState<{ nome?: string; peso?: string; data?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvando = criar.isPending || atualizar.isPending;

  function validar(): boolean {
    const novos: typeof erros = {};
    if (!nome.trim()) novos.nome = 'Informe o nome do pet';
    if (peso && Number.isNaN(Number(peso.replace(',', '.')))) {
      novos.peso = 'Peso deve ser um número (ex: 8.5)';
    }
    if (dataNascimento && !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
      novos.data = 'Use o formato AAAA-MM-DD';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function salvar() {
    setErroGeral(null);
    if (!validar()) return;
    if (!usuario?.idTutor) {
      setErroGeral('Sua conta não está vinculada a um tutor.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      especie,
      sexo: (sexo as 'MACHO' | 'FEMEA' | null) ?? null,
      raca: raca.trim() || null,
      dataNascimento: dataNascimento.trim() || null,
      pesoKg: peso ? Number(peso.replace(',', '.')) : null,
      castrado: petEmEdicao?.castrado ?? false,
      observacoesSaude: observacoes.trim() || null,
      idTutor: usuario.idTutor,
    };

    try {
      if (editando) {
        await atualizar.mutateAsync({ id: petEmEdicao.id, pet: dados });
      } else {
        await criar.mutateAsync(dados);
      }
      navigation.goBack();
    } catch (e) {
      setErroGeral(mensagemDoErro(e, 'Não foi possível salvar o pet'));
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.fundo}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        {editando ? (
          <ImageBackground
            source={require('../../assets/fundo-cabecalho-pet.png')}
            style={estilos.cabecalhoPet}
            imageStyle={estilos.cabecalhoFundo}
            resizeMode="cover"
          >
            <Pressable onPress={escolherFoto} style={estilos.molduraArea}>
              <View style={estilos.moldura}>
                {fotoUri ? (
                  <Image source={{ uri: fotoUri }} style={estilos.foto} />
                ) : (
                  <View style={estilos.fotoVazia}>
                    <Ionicons name="paw" size={28} color={cores.laranja} />
                  </View>
                )}
              </View>

              <View style={estilos.botaoCamera}>
                <Ionicons name="camera" size={14} color="#3B1A05" />
              </View>
            </Pressable>

            <View style={{ flex: 1 }}>
              <View style={estilos.linhaNome}>
                <Text style={estilos.nomePet}>{petEmEdicao?.nome}</Text>
                {!!petEmEdicao?.sexo && (
                  <Ionicons
                    name={petEmEdicao.sexo === 'FEMEA' ? 'female' : 'male'}
                    size={18}
                    color={petEmEdicao.sexo === 'FEMEA' ? '#F472B6' : '#3B82F6'}
                  />
                )}
              </View>

              <Text style={estilos.subPet}>
                {[
                  petEmEdicao?.raca || 'Sem raça definida',
                  petEmEdicao?.idadeAnos != null ? `${petEmEdicao.idadeAnos} anos` : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </Text>

              <View style={estilos.seloFamilia}>
                <Ionicons name="paw" size={13} color={cores.laranja} />
                <Text style={estilos.seloFamiliaTexto}>
                  {pontosGanhos > 0 ? `Foto adicionada · +${pontosGanhos} pts` : 'Pet da família'}
                </Text>
                <Ionicons name="heart" size={12} color={cores.laranja} />
              </View>
            </View>
          </ImageBackground>
        ) : (
          <>
            <Text style={estilos.titulo}>Cadastrar pet</Text>
            <Text style={estilos.descricao}>
              Quanto mais completo o perfil, melhores os lembretes de cuidado.
            </Text>
          </>
        )}

        <View style={estilos.formulario}>
          <CampoTexto
            rotulo="Nome"
            iconeRotulo="pricetag-outline"
            icone="paw"
            placeholder="Como ele se chama?"
            value={nome}
            onChangeText={setNome}
            erro={erros.nome}
          />

          <Rotulo icone="paw-outline" texto="Espécie" />
          <View style={estilos.opcoes}>
            {ESPECIES.map((opcao) => {
              const ativa = especie === opcao.valor;
              return (
                <Pressable
                  key={opcao.valor}
                  onPress={() => setEspecie(opcao.valor)}
                  style={[estilos.opcao, estilos.opcaoComIcone, ativa && estilos.opcaoAtiva]}
                >
                  <Ionicons
                    name={opcao.icone}
                    size={17}
                    color={ativa ? cores.primaria : cores.textoSuave}
                  />
                  <Text style={[estilos.opcaoTexto, ativa && estilos.opcaoTextoAtivo]}>
                    {opcao.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Rotulo icone="male-female-outline" texto="Sexo" />
          <View style={estilos.opcoes}>
            {SEXOS.map((opcao) => {
              const ativa = sexo === opcao.valor;
              return (
                <Pressable
                  key={opcao.valor}
                  onPress={() => setSexo(ativa ? null : opcao.valor)}
                  style={[
                    estilos.opcao,
                    estilos.opcaoComIcone,
                    ativa && { borderColor: opcao.cor, backgroundColor: `${opcao.cor}22` },
                  ]}
                >
                  <Ionicons
                    name={opcao.icone}
                    size={17}
                    color={ativa ? opcao.cor : cores.textoSuave}
                  />
                  <Text
                    style={[
                      estilos.opcaoTexto,
                      ativa && { color: opcao.cor, fontWeight: '600' },
                    ]}
                  >
                    {opcao.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <CampoTexto
            rotulo="Raça"
            iconeRotulo="pricetag-outline"
            icone="paw"
            placeholder="Ex: Golden Retriever"
            value={raca}
            onChangeText={setRaca}
          />
          <CampoTexto
            rotulo="Data de nascimento"
            iconeRotulo="calendar-outline"
            icone="paw"
            sufixo="calendar-outline"
            placeholder="AAAA-MM-DD"
            value={dataNascimento}
            onChangeText={setDataNascimento}
            erro={erros.data}
          />
          <CampoTexto
            rotulo="Peso (kg)"
            iconeRotulo="barbell-outline"
            icone="barbell-outline"
            sufixoTexto="kg"
            placeholder="Ex: 8.5"
            value={peso}
            onChangeText={setPeso}
            keyboardType="decimal-pad"
            erro={erros.peso}
          />
          <CampoTexto
            rotulo="Observações de saúde"
            iconeRotulo="pulse-outline"
            icone="pulse-outline"
            sufixo="create-outline"
            placeholder="Alergias, tratamentos em curso…"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={3}
            style={estilos.multilinha}
          />

          {!!observacoes.trim() && (
            <View style={estilos.atencao}>
              <View style={estilos.atencaoIcone}>
                <Ionicons name="paw" size={13} color={cores.laranja} />
              </View>
              <Text style={estilos.atencaoTexto}>Atenção especial</Text>
            </View>
          )}

          {!!erroGeral && (
            <View style={estilos.avisoErro}>
              <Text style={estilos.avisoErroTexto}>{erroGeral}</Text>
            </View>
          )}

          <Botao
            titulo={editando ? 'Salvar alterações' : 'Cadastrar pet'}
            icone="save-outline"
            onPress={salvar}
            carregando={salvando}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Rótulo de seção com ícone, no mesmo padrão dos campos. */
function Rotulo({ icone, texto }: { icone: keyof typeof Ionicons.glyphMap; texto: string }) {
  return (
    <View style={estilos.linhaRotulo}>
      <Ionicons name={icone} size={14} color={cores.textoSuave} />
      <Text style={estilos.rotulo}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    padding: espacamentos.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  descricao: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginTop: espacamentos.xs,
    marginBottom: espacamentos.lg,
  },
  formulario: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.lg,
  },
  rotulo: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
    marginBottom: espacamentos.xs,
  },
  opcoes: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    marginBottom: espacamentos.md,
  },
  opcao: {
    flex: 1,
    paddingVertical: espacamentos.sm + 2,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
  },
  cabecalhoPet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
    // recorta a arte de fundo no limite do cartão
    borderRadius: raios.lg,
    overflow: 'hidden',
  },
  cabecalhoFundo: { borderRadius: raios.lg, resizeMode: 'cover' },
  molduraArea: { width: 84, height: 84 },
  moldura: {
    width: 84,
    height: 84,
    borderRadius: raios.pill,
    borderWidth: 2.5,
    borderColor: cores.laranja,
    overflow: 'hidden',
  },
  foto: { width: '100%', height: '100%' },
  fotoVazia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  botaoCamera: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: raios.pill,
    backgroundColor: cores.laranja,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7A4110',
  },
  linhaNome: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  nomePet: { color: '#FFF6EC', fontSize: 21, fontWeight: '800' },
  subPet: { color: 'rgba(255,246,236,0.75)', fontSize: 13, marginTop: 1 },
  seloFamilia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: espacamentos.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: raios.pill,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  seloFamiliaTexto: { color: cores.laranja, fontSize: 12, fontWeight: '700' },
  opcaoComIcone: {
    flexDirection: 'row',
    // com direção em linha, o conteúdo precisa ser centrado no eixo horizontal
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: espacamentos.md,
  },
  linhaRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: espacamentos.xs,
  },
  atencao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,138,61,0.12)',
    borderRadius: raios.pill,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: -espacamentos.sm,
    marginBottom: espacamentos.md,
  },
  atencaoIcone: {
    width: 22,
    height: 22,
    borderRadius: raios.pill,
    borderWidth: 1,
    borderColor: cores.laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atencaoTexto: { color: cores.laranja, fontSize: 12, fontWeight: '700' },
  opcaoAtiva: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
  },
  opcaoTexto: { ...tipografia.corpo, color: cores.textoSecundario },
  opcaoTextoAtivo: { color: cores.primaria, fontWeight: '600' },
  multilinha: { minHeight: 80, textAlignVertical: 'top' },
  avisoErro: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.md,
  },
  avisoErroTexto: { ...tipografia.corpo, color: cores.erro },
});
