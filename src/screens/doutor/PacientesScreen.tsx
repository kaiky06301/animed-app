import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../../api/cliente';
import { Botao } from '../../components/Botao';
import { Cartao } from '../../components/Cartao';
import { CampoTexto } from '../../components/CampoTexto';
import { useFotoPet } from '../../hooks/useFotoPet';
import { usePacientes } from '../../hooks/usePacientes';
import type { RaizParamList } from '../../navigation/tipos';
import type { Pet } from '../../services/tipos';
import { useAuth } from '../../state/AuthContext';
import { cores, espacamentos, raios, tipografia } from '../../theme/cores';

type Navegacao = NativeStackNavigationProp<RaizParamList>;

/** Lista de pacientes da clínica, com busca por pet ou tutor. */
export function PacientesScreen() {
  const navigation = useNavigation<Navegacao>();
  const { usuario } = useAuth();
  const { data: pacientes, isLoading, isRefetching, refetch, isError, error } = usePacientes();

  const [busca, setBusca] = useState('');

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pacientes ?? [];

    return (pacientes ?? []).filter(
      (pet) =>
        pet.nome.toLowerCase().includes(termo) ||
        pet.nomeTutor.toLowerCase().includes(termo) ||
        (pet.raca ?? '').toLowerCase().includes(termo),
    );
  }, [pacientes, busca]);

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
            <Text style={estilos.saudacao}>Área do veterinário</Text>
            <Text style={estilos.titulo}>Pacientes</Text>
            <Text style={estilos.subtitulo}>
              {pacientes?.length === 1
                ? '1 paciente na clínica'
                : `${pacientes?.length ?? 0} pacientes na clínica`}
            </Text>

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

      <View style={estilos.rodape}>
        <Text style={estilos.rodapeTexto}>
          {usuario?.email} · perfil veterinário
        </Text>
      </View>
    </View>
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
            <Ionicons
              name={pet.especie === 'GATO' ? 'logo-octocat' : 'paw'}
              size={22}
              color={cores.primaria}
            />
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
    paddingBottom: espacamentos.xxl * 2,
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
  },
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
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: espacamentos.sm,
    backgroundColor: cores.fundoElevado,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    alignItems: 'center',
  },
  rodapeTexto: { color: cores.textoSuave, fontSize: 11 },
});
