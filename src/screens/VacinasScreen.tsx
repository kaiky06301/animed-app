import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { mensagemDoErro } from '../api/cliente';
import { useVacinas } from '../hooks/useVacinas';
import type { RaizParamList } from '../navigation/tipos';
import type { Vacina } from '../services/tipos';
import { isoParaBr as formatarData } from '../utils/data';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

type Props = NativeStackScreenProps<RaizParamList, 'Vacinas'>;

const HOJE = new Date().toISOString().slice(0, 10);

export function VacinasScreen({ route }: Props) {
  const { idPet, nomePet } = route.params;

  const { data: vacinas, isLoading, isRefetching, refetch, isError, error } = useVacinas(idPet);

  if (isLoading) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={cores.primaria} size="large" />
        <Text style={estilos.textoSuave}>Carregando vacinas…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={estilos.centro}>
        <Ionicons name="cloud-offline-outline" size={40} color={cores.textoSuave} />
        <Text style={estilos.erroTitulo}>Não foi possível carregar</Text>
        <Text style={estilos.textoSuave}>{mensagemDoErro(error)}</Text>
        <Botao titulo="Tentar de novo" variante="contorno" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={estilos.fundo}>
      <FlatList
        data={vacinas}
        keyExtractor={(v) => String(v.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={cores.primaria} />
        }
        ListHeaderComponent={
          <View>
            <Text style={estilos.titulo}>Carteira de vacinas</Text>
            <Text style={estilos.subtitulo}>{nomePet}</Text>

            <View style={estilos.explicacao}>
              <Ionicons name="shield-checkmark-outline" size={17} color={cores.primaria} />
              <Text style={estilos.explicacaoTexto}>
                O histórico é preenchido pelo veterinário a cada aplicação, e cada
                registro rende pontos para você.
              </Text>
            </View>

          </View>
        }
        ListEmptyComponent={
          <Cartao style={estilos.vazio}>
            <Ionicons name="medkit-outline" size={36} color={cores.primaria} />
            <Text style={estilos.vazioTitulo}>Nenhuma vacina registrada</Text>
            <Text style={estilos.textoSuave}>
              Assim que o veterinário registrar uma aplicação, ela aparece aqui.
            </Text>
          </Cartao>
        }
        renderItem={({ item }) => (
          <Cartao style={estilos.item}>
            <View style={estilos.itemTopo}>
              <View style={estilos.itemInfo}>
                <Text style={estilos.itemNome}>{item.nomeVacina}</Text>
                <Text style={estilos.textoSuave}>
                  Aplicada em {formatarData(item.dataAplicacao)}
                  {item.dataProximaDose
                    ? ` · próxima em ${formatarData(item.dataProximaDose)}`
                    : ''}
                </Text>
                {!!item.veterinarioResponsavel && (
                  <Text style={estilos.textoSuave}>{item.veterinarioResponsavel}</Text>
                )}
              </View>
            </View>

          </Cartao>
        )}
      />

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
  lista: {
    padding: espacamentos.md,
    paddingBottom: espacamentos.xxl * 2,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  subtitulo: {
    ...tipografia.corpo,
    color: cores.primaria,
    marginBottom: espacamentos.md,
  },
  erroTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  textoSuave: { ...tipografia.legenda, color: cores.textoSecundario, textAlign: 'center' },
  explicacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.md,
  },
  explicacaoTexto: { flex: 1, color: cores.primaria, fontSize: 12, lineHeight: 17 },
  formularioTitulo: {
    ...tipografia.subtitulo,
    color: cores.textoPrincipal,
    marginBottom: espacamentos.md,
  },
  item: { marginBottom: espacamentos.sm, padding: 0, overflow: 'hidden' },
  itemTopo: { padding: espacamentos.md },
  itemInfo: { gap: 2 },
  itemNome: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  acoes: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: cores.borda },
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
  avisoErro: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.md,
  },
  avisoErroTexto: { ...tipografia.corpo, color: cores.erro },
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
