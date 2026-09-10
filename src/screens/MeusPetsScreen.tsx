import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { mensagemDoErro } from '../api/cliente';
import { useFotoPet } from '../hooks/useFotoPet';
import { useExcluirPet, usePets } from '../hooks/usePets';
import type { RaizParamList } from '../navigation/tipos';
import type { Pet } from '../services/tipos';
import { useAuth } from '../state/AuthContext';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

/** A tela é usada como aba, então a navegação da pilha vem do hook. */
type NavegacaoPilha = NativeStackNavigationProp<RaizParamList>;

export function MeusPetsScreen() {
  const navigation = useNavigation<NavegacaoPilha>();
  const { usuario } = useAuth();
  const idTutor = usuario?.idTutor ?? null;

  const { data: pets, isLoading, isRefetching, refetch, isError, error } = usePets(idTutor);
  const excluir = useExcluirPet();

  function confirmarExclusao(pet: Pet) {
    const remover = async () => {
      try {
        await excluir.mutateAsync(pet.id);
      } catch (e) {
        avisar('Não foi possível excluir', mensagemDoErro(e));
      }
    };

    // No navegador o Alert do React Native não oferece botões,
    // então usamos a confirmação nativa da própria página.
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`Excluir ${pet.nome}? Esta ação não pode ser desfeita.`)) {
        void remover();
      }
      return;
    }

    Alert.alert('Excluir pet', `Excluir ${pet.nome}? Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: remover },
    ]);
  }

  function avisar(titulo: string, mensagem: string) {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      window.alert(`${titulo}\n\n${mensagem}`);
      return;
    }
    Alert.alert(titulo, mensagem);
  }

  if (isLoading) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={cores.primaria} size="large" />
        <Text style={estilos.carregandoTexto}>Carregando seus pets…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={estilos.centro}>
        <Ionicons name="cloud-offline-outline" size={40} color={cores.textoSuave} />
        <Text style={estilos.erroTitulo}>Não foi possível carregar</Text>
        <Text style={estilos.erroTexto}>{mensagemDoErro(error)}</Text>
        <Botao titulo="Tentar de novo" variante="contorno" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={estilos.fundo}>
      <FlatList
        data={pets}
        keyExtractor={(pet) => String(pet.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={cores.primaria}
          />
        }
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <Text style={estilos.titulo}>Meus pets</Text>
            <Text style={estilos.subtitulo}>
              {pets?.length
                ? `${pets.length} ${pets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'}`
                : 'Nenhum pet cadastrado ainda'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Cartao style={estilos.vazio}>
            <Ionicons name="paw-outline" size={36} color={cores.primaria} />
            <Text style={estilos.vazioTitulo}>Cadastre seu primeiro pet</Text>
            <Text style={estilos.vazioTexto}>
              É por aqui que começa a jornada de cuidado — e os seus pontos.
            </Text>
          </Cartao>
        }
        renderItem={({ item }) => (
          <Cartao style={estilos.item}>
            <Pressable
              style={estilos.itemToque}
              onPress={() => navigation.navigate('Vacinas', { idPet: item.id, nomePet: item.nome })}
            >
              <AvatarPet especie={item.especie} idPet={item.id} />

              <View style={estilos.itemInfo}>
                <Text style={estilos.itemNome}>{item.nome}</Text>
                <Text style={estilos.itemDetalhe}>
                  {[
                    item.especie === 'GATO' ? 'Gato' : 'Cachorro',
                    item.raca,
                    item.idadeAnos != null ? `${item.idadeAnos} ano(s)` : null,
                    item.pesoKg != null ? `${item.pesoKg} kg` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
            </Pressable>

            <View style={estilos.acoes}>
              <Pressable
                style={estilos.acao}
                onPress={() => navigation.navigate('FormPet', { pet: item })}
              >
                <Ionicons name="create-outline" size={16} color={cores.textoSecundario} />
                <Text style={estilos.acaoTexto}>Editar</Text>
              </Pressable>

              <Pressable style={estilos.acao} onPress={() => confirmarExclusao(item)}>
                <Ionicons name="trash-outline" size={16} color={cores.erro} />
                <Text style={[estilos.acaoTexto, { color: cores.erro }]}>Excluir</Text>
              </Pressable>
            </View>
          </Cartao>
        )}
      />

      <View style={estilos.rodape}>
        <Botao
          titulo="Cadastrar pet"
          onPress={() => navigation.navigate('FormPet', { pet: undefined })}
        />
      </View>
    </View>
  );
}

/** Avatar do pet na lista: usa a foto escolhida ou o ícone da espécie. */
function AvatarPet({ idPet, especie }: { idPet: number; especie: string }) {
  const { uri } = useFotoPet(idPet);

  return (
    <View style={estilos.avatar}>
      {uri ? (
        <Image source={{ uri }} style={estilos.avatarFoto} />
      ) : (
        <Ionicons
          name={especie === 'GATO' ? 'logo-octocat' : 'paw'}
          size={22}
          color={cores.primaria}
        />
      )}
    </View>
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
  carregandoTexto: { ...tipografia.corpo, color: cores.textoSecundario },
  erroTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  erroTexto: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginBottom: espacamentos.sm,
  },
  lista: {
    padding: espacamentos.md,
    paddingBottom: espacamentos.xxl * 2,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: { marginBottom: espacamentos.md },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  subtitulo: { ...tipografia.corpo, color: cores.textoSecundario, marginTop: 2 },
  item: { marginBottom: espacamentos.sm, padding: 0, overflow: 'hidden' },
  itemToque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    padding: espacamentos.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: raios.pill,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarFoto: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemNome: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  itemDetalhe: { ...tipografia.legenda, color: cores.textoSecundario, marginTop: 2 },
  acoes: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  acao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamentos.xs,
    paddingVertical: espacamentos.sm + 2,
  },
  acaoTexto: { ...tipografia.legenda, color: cores.textoSecundario },
  vazio: { alignItems: 'center', gap: espacamentos.xs, paddingVertical: espacamentos.lg },
  vazioTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  vazioTexto: { ...tipografia.corpo, color: cores.textoSecundario, textAlign: 'center' },
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: espacamentos.md,
    backgroundColor: cores.fundo,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
});
