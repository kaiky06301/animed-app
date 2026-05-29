import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Cartao } from '../components/Cartao';
import { POSTS_COMUNIDADE, type PostComunidade } from '../data/comunidade';
import { cores, espacamentos, raios } from '../theme/cores';

export function ComunidadeScreen() {
  return (
    <View style={estilos.container}>
      <FlatList
        data={POSTS_COMUNIDADE}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <Text style={estilos.titulo}>Comunidade Animed</Text>
            <Text style={estilos.subtitulo}>
              Dicas reais de tutores · troca por raça e experiência
            </Text>
          </View>
        }
        renderItem={({ item }) => <CartaoPost post={item} />}
        contentContainerStyle={estilos.lista}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function CartaoPost({ post }: { post: PostComunidade }) {
  return (
    <Cartao style={{ gap: espacamentos.sm }}>
      <View style={estilos.topo}>
        <View style={estilos.avatar}>
          <Text style={{ fontSize: 22 }}>{post.emoji}</Text>
        </View>
        <View>
          <Text style={estilos.autor}>{post.autor}</Text>
          <Text style={estilos.raca}>Tutor(a) de {post.raca}</Text>
        </View>
      </View>
      <Text style={estilos.texto}>{post.texto}</Text>
      <View style={estilos.rodape}>
        <View style={estilos.interacao}>
          <Ionicons name="heart" size={16} color={cores.laranja} />
          <Text style={estilos.numero}>{post.curtidas}</Text>
        </View>
        <View style={estilos.interacao}>
          <Ionicons name="chatbubble-ellipses" size={16} color={cores.primaria} />
          <Text style={estilos.numero}>{post.comentarios}</Text>
        </View>
      </View>
    </Cartao>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: espacamentos.lg, paddingBottom: espacamentos.xxl, gap: espacamentos.md },
  cabecalho: { marginBottom: espacamentos.md },
  titulo: { color: cores.textoPrincipal, fontSize: 24, fontWeight: '700' },
  subtitulo: { color: cores.textoSecundario, fontSize: 13, marginTop: 4 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: raios.pill,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autor: { color: cores.textoPrincipal, fontWeight: '700', fontSize: 14 },
  raca: { color: cores.textoSecundario, fontSize: 12 },
  texto: { color: cores.textoPrincipal, fontSize: 14, lineHeight: 20 },
  rodape: { flexDirection: 'row', gap: espacamentos.lg, marginTop: 4 },
  interacao: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numero: { color: cores.textoSecundario, fontSize: 12, fontWeight: '600' },
});
