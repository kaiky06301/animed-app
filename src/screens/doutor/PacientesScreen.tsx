import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../../api/cliente';
import { Botao } from '../../components/Botao';
import { Cartao } from '../../components/Cartao';
import { IconePet } from '../../components/IconePet';
import { CampoTexto } from '../../components/CampoTexto';
import { useFotoPet } from '../../hooks/useFotoPet';
import { usePacientes } from '../../hooks/usePacientes';
import type { RaizParamList } from '../../navigation/tipos';
import type { Pet, SexoPet } from '../../services/tipos';
import { cores, espacamentos, raios, tipografia } from '../../theme/cores';

type Navegacao = NativeStackNavigationProp<RaizParamList>;

/** Lista de pacientes da clínica, com busca por pet ou tutor. */
export function PacientesScreen() {
  const navigation = useNavigation<Navegacao>();
  const { data: pacientes, isLoading, isRefetching, refetch, isError, error } = usePacientes();

  const [busca, setBusca] = useState('');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [especie, setEspecie] = useState<string | null>(null);
  const [sexo, setSexo] = useState<SexoPet | null>(null);

  const total = pacientes?.length ?? 0;
  const filtrando = especie !== null || sexo !== null;

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return (pacientes ?? []).filter((pet) => {
      if (especie && pet.especie !== especie) return false;
      if (sexo && pet.sexo !== sexo) return false;
      if (!termo) return true;

      return (
        pet.nome.toLowerCase().includes(termo) ||
        pet.nomeTutor.toLowerCase().includes(termo) ||
        (pet.raca ?? '').toLowerCase().includes(termo)
      );
    });
  }, [pacientes, busca, especie, sexo]);

  if (isLoading) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={estilos.textoSuave}>Carregando pacientes…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={estilos.centro}>
        <Ionicons name="cloud-offline-outline" size={40} color={cores.textoSuave} />
        <Text style={estilos.tituloErro}>Não foi possível carregar</Text>
        <Text style={estilos.textoSuave}>{mensagemDoErro(error)}</Text>
        <Botao titulo="Tentar de novo" variante="contorno" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={estilos.fundo}>
      <FlatList
        data={filtrados}
        keyExtractor={(pet) => String(pet.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={cores.primaria} />
        }
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <View style={estilos.cabecalhoTopo}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.saudacao}>Área do veterinário</Text>
                <Text style={estilos.titulo}>Pacientes</Text>
                <Text style={estilos.subtitulo}>
                  {total === 1
                    ? '1 paciente na clínica'
                    : `${total} pacientes na clínica`}
                </Text>
              </View>

              <Pressable
                onPress={() => setFiltrosAbertos(true)}
                style={({ pressed }) => [
                  estilos.botaoFiltros,
                  filtrando && estilos.botaoFiltrosAtivo,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons
                  name="options-outline"
                  size={17}
                  color={filtrando ? cores.primaria : cores.textoSecundario}
                />
                <Text
                  style={[
                    estilos.botaoFiltrosTexto,
                    filtrando && { color: cores.primaria },
                  ]}
                >
                  Filtros
                </Text>
              </Pressable>
            </View>

            <CampoTexto
              rotulo=""
              icone="search"
              placeholder="Buscar por pet, tutor ou raça"
              value={busca}
              onChangeText={setBusca}
              autoCapitalize="none"
            />
          </View>
        }
        ListEmptyComponent={
          <Cartao style={estilos.vazio}>
            <Ionicons name="search" size={34} color={cores.textoSuave} />
            <Text style={estilos.vazioTitulo}>Nenhum paciente encontrado</Text>
            <Text style={estilos.textoSuave}>Ajuste a busca para ver outros resultados.</Text>
          </Cartao>
        }
        renderItem={({ item }) => (
          <ItemPaciente
            pet={item}
            onPress={() =>
              navigation.navigate('FichaPaciente', {
                idPet: item.id,
                nomePet: item.nome,
                especie: item.especie,
              })
            }
          />
        )}
      />

      <FiltrosPacientes
        visivel={filtrosAbertos}
        especie={especie}
        sexo={sexo}
        onEspecie={setEspecie}
        onSexo={setSexo}
        onLimpar={() => {
          setEspecie(null);
          setSexo(null);
        }}
        onFechar={() => setFiltrosAbertos(false)}
        encontrados={filtrados.length}
      />
    </View>
  );
}

interface FiltrosProps {
  visivel: boolean;
  especie: string | null;
  sexo: SexoPet | null;
  onEspecie: (valor: string | null) => void;
  onSexo: (valor: SexoPet | null) => void;
  onLimpar: () => void;
  onFechar: () => void;
  encontrados: number;
}

const ESPECIES = [
  { valor: 'CACHORRO', rotulo: 'Cães' },
  { valor: 'GATO', rotulo: 'Gatos' },
  { valor: 'AVE', rotulo: 'Aves' },
  { valor: 'ROEDOR', rotulo: 'Roedores' },
];

const SEXOS: { valor: SexoPet; rotulo: string }[] = [
  { valor: 'MACHO', rotulo: 'Machos' },
  { valor: 'FEMEA', rotulo: 'Fêmeas' },
];

/**
 * Recortes da lista de pacientes.
 *
 * Tocar de novo na opção já escolhida desmarca: com poucas opções, isso
 * evita um botão de limpar para cada linha.
 */
function FiltrosPacientes({
  visivel, especie, sexo, onEspecie, onSexo, onLimpar, onFechar, encontrados,
}: FiltrosProps) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={estilos.fundoModal} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View style={estilos.painelTopo}>
            <Text style={estilos.painelTitulo}>Filtros</Text>
            <Pressable onPress={onFechar} hitSlop={10} style={estilos.fechar}>
              <Ionicons name="close" size={20} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <Text style={estilos.painelRotulo}>Espécie</Text>
          <View style={estilos.opcoes}>
            {ESPECIES.map((opcao) => (
              <Pressable
                key={opcao.valor}
                onPress={() => onEspecie(especie === opcao.valor ? null : opcao.valor)}
                style={[estilos.opcao, especie === opcao.valor && estilos.opcaoAtiva]}
              >
                <Text
                  style={[
                    estilos.opcaoTexto,
                    especie === opcao.valor && estilos.opcaoTextoAtivo,
                  ]}
                >
                  {opcao.rotulo}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={estilos.painelRotulo}>Sexo</Text>
          <View style={estilos.opcoes}>
            {SEXOS.map((opcao) => (
              <Pressable
                key={opcao.valor}
                onPress={() => onSexo(sexo === opcao.valor ? null : opcao.valor)}
                style={[estilos.opcao, sexo === opcao.valor && estilos.opcaoAtiva]}
              >
                <Text
                  style={[estilos.opcaoTexto, sexo === opcao.valor && estilos.opcaoTextoAtivo]}
                >
                  {opcao.rotulo}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={estilos.encontrados}>
            {encontrados === 1 ? '1 paciente encontrado' : `${encontrados} pacientes encontrados`}
          </Text>

          <View style={estilos.painelAcoes}>
            <Pressable onPress={onLimpar} hitSlop={8}>
              <Text style={estilos.limpar}>Limpar filtros</Text>
            </Pressable>

            <Pressable
              onPress={onFechar}
              style={({ pressed }) => [estilos.aplicar, pressed && { opacity: 0.85 }]}
            >
              <Text style={estilos.aplicarTexto}>Ver resultados</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ItemPaciente({ pet, onPress }: { pet: Pet; onPress: () => void }) {
  const { uri } = useFotoPet(pet.id);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.75 }}>
      <Cartao style={estilos.item}>
        <View style={estilos.avatar}>
          {uri ? (
            <Image source={{ uri }} style={estilos.avatarFoto} />
          ) : (
            <IconePet especie={pet.especie} tamanho={27} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={estilos.linhaNome}>
            <Text style={estilos.nome}>{pet.nome}</Text>
            {!!pet.sexo && (
              <Ionicons
                name={pet.sexo === 'FEMEA' ? 'female' : 'male'}
                size={14}
                color={pet.sexo === 'FEMEA' ? '#F472B6' : '#3B82F6'}
              />
            )}
          </View>

          <Text style={estilos.detalhe}>
            {[
              pet.raca || 'Sem raça definida',
              pet.idadeAnos != null ? `${pet.idadeAnos} anos` : null,
            ]
              .filter(Boolean)
              .join(' • ')}
          </Text>

          <Text style={estilos.tutor}>Tutor: {pet.nomeTutor}</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
      </Cartao>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  centro: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamentos.lg,
    gap: espacamentos.sm,
  },
  lista: {
    padding: espacamentos.md,
    paddingBottom: espacamentos.xxl,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: { marginBottom: espacamentos.sm },
  saudacao: { color: cores.primaria, fontSize: 12, fontWeight: '700' },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  subtitulo: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginBottom: espacamentos.md,
  },
  tituloErro: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  textoSuave: { ...tipografia.legenda, color: cores.textoSecundario, textAlign: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    marginBottom: espacamentos.sm,
    // Faixa que dá identidade à lista e separa um paciente do outro
    borderLeftWidth: 3,
    borderLeftColor: cores.primaria,
  },

  cabecalhoTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.sm },
  botaoFiltros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: 9,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    marginTop: 4,
  },
  botaoFiltrosAtivo: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  botaoFiltrosTexto: { fontSize: 13, fontWeight: '700', color: cores.textoSecundario },

  fundoModal: {
    flex: 1,
    backgroundColor: cores.overlay,
    justifyContent: 'center',
    padding: espacamentos.md,
  },
  painel: {
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  painelTopo: { flexDirection: 'row', alignItems: 'center' },
  painelTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal, flex: 1 },
  fechar: {
    width: 30,
    height: 30,
    borderRadius: raios.sm,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  painelRotulo: {
    fontSize: 12,
    fontWeight: '700',
    color: cores.textoSecundario,
    marginTop: espacamentos.md,
    marginBottom: espacamentos.xs,
  },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.xs },
  opcao: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: 8,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  opcaoAtiva: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  opcaoTexto: { fontSize: 13, fontWeight: '600', color: cores.textoSecundario },
  opcaoTextoAtivo: { color: cores.primaria, fontWeight: '700' },
  encontrados: {
    fontSize: 12,
    color: cores.textoSuave,
    marginTop: espacamentos.md,
  },
  painelAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacamentos.sm,
  },
  limpar: { fontSize: 13, color: cores.textoSecundario, fontWeight: '600' },
  aplicar: {
    paddingHorizontal: espacamentos.md,
    paddingVertical: 10,
    borderRadius: raios.md,
    backgroundColor: cores.primaria,
  },
  aplicarTexto: { fontSize: 13, fontWeight: '800', color: '#06281F' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: raios.pill,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarFoto: { width: '100%', height: '100%' },
  linhaNome: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nome: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  detalhe: { ...tipografia.legenda, color: cores.textoSecundario, marginTop: 1 },
  tutor: { ...tipografia.legenda, color: cores.textoSuave, marginTop: 2 },
  vazio: { alignItems: 'center', gap: espacamentos.xs, paddingVertical: espacamentos.lg },
  vazioTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
});
