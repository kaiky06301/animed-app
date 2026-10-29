import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTema } from '../state/TemaContext';

interface Props {
  especie?: string | null;
  tamanho?: number;
  cor?: string;
}

/**
 * Ícone que representa a espécie do pet.
 * Usado quando não há foto definida, em qualquer tela.
 */
export function IconePet({ especie, tamanho = 22, cor }: Props) {
  const { cores } = useTema();
  const nome = especie === 'GATO' ? 'cat' : especie === 'CACHORRO' ? 'dog' : 'paw';

  return <MaterialCommunityIcons name={nome} size={tamanho} color={cor ?? cores.primaria} />;
}
