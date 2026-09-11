import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFotoPet } from '../hooks/useFotoPet';
import { IconePet } from './IconePet';
import type { Pet } from '../services/tipos';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

interface Props {
  visivel: boolean;
  pets: Pet[];
  idAtivo: number | null;
  onSelecionar: (idPet: number) => void;
  onFechar: () => void;
  onCadastrar: () => void;
}

/** Lista os pets do tutor para trocar qual deles está no contexto do app. */
export function SeletorPet({
  visivel,
  pets,
  idAtivo,
  onSelecionar,
  onFechar,
  onCadastrar,
}: Props) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View style={estilos.cabecalho}>
            <Text style={estilos.titulo}>Trocar de pet</Text>
            <Pressable onPress={onFechar} hitSlop={10}>
              <Ionicons name="close" size={22} color={cores.textoSecundario} />
            </Pressable>
          </View>

          {pets.map((pet) => (
            <ItemPet
              key={pet.id}
              pet={pet}
              ativo={pet.id === idAtivo}
              onPress={() => {
                onSelecionar(pet.id);
                onFechar();
              }}
            />
          ))}

          <Pressable
            style={estilos.novoPet}
            onPress={() => {
              onFechar();
              onCadastrar();
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={cores.laranja} />
            <Text style={estilos.novoPetTexto}>Cadastrar outro pet</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ItemPet({ pet, ativo, onPress }: { pet: Pet; ativo: boolean; onPress: () => void }) {
  const { uri } = useFotoPet(pet.id);

  return (
    <Pressable style={[estilos.item, ativo && estilos.itemAtivo]} onPress={onPress}>
      <View style={[estilos.moldura, ativo && { borderColor: cores.primaria }]}>
        {uri ? (
          <Image source={{ uri }} style={estilos.foto} />
        ) : (
          <View style={estilos.fotoVazia}>
            <IconePet especie={pet.especie} tamanho={24} />
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={estilos.nome}>{pet.nome}</Text>
        <Text style={estilos.detalhe}>
          {[pet.raca || 'Sem raça definida', pet.idadeAnos != null ? `${pet.idadeAnos} anos` : null]
            .filter(Boolean)
            .join(' • ')}
        </Text>
      </View>

      {ativo && <Ionicons name="checkmark-circle" size={20} color={cores.primaria} />}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: cores.overlay,
    justifyContent: 'center',
    padding: espacamentos.lg,
  },
  painel: {
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    gap: espacamentos.xs,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamentos.sm,
  },
  titulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    padding: espacamentos.sm,
    borderRadius: raios.md,
  },
  itemAtivo: { backgroundColor: cores.primariaSuave },
  moldura: {
    width: 44,
    height: 44,
    borderRadius: raios.pill,
    borderWidth: 2,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  foto: { width: '100%', height: '100%' },
  fotoVazia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieAlt,
  },
  nome: { color: cores.textoPrincipal, fontSize: 15, fontWeight: '700' },
  detalhe: { color: cores.textoSecundario, fontSize: 12 },
  novoPet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamentos.xs,
    paddingVertical: espacamentos.sm + 2,
    marginTop: espacamentos.xs,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  novoPetTexto: { color: cores.laranja, fontSize: 14, fontWeight: '700' },
});
