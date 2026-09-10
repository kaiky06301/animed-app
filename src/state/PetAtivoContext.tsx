import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePets } from '../hooks/usePets';
import type { Pet } from '../services/tipos';
import { useAuth } from './AuthContext';

const CHAVE_PET_ATIVO = '@animed:pet-ativo';

interface EstadoPetAtivo {
  /** Pet que está no contexto das telas. */
  petAtivo: Pet | null;
  /** Todos os pets do tutor. */
  pets: Pet[];
  carregando: boolean;
  selecionarPet: (idPet: number) => void;
}

const PetAtivoContext = createContext<EstadoPetAtivo | undefined>(undefined);

/**
 * Mantém qual pet está selecionado.
 *
 * A escolha é persistida, de modo que o app reabre no mesmo pet. Se o pet
 * salvo não existir mais (excluído, por exemplo), cai no primeiro da lista.
 */
export function PetAtivoProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const { data: pets, isLoading } = usePets(usuario?.idTutor ?? null);

  const [idSelecionado, setIdSelecionado] = useState<number | null>(null);

  // Recupera a última escolha salva
  useEffect(() => {
    AsyncStorage.getItem(CHAVE_PET_ATIVO).then((salvo) => {
      if (salvo) setIdSelecionado(Number(salvo));
    });
  }, []);

  const lista = pets ?? [];

  const petAtivo = useMemo(() => {
    if (!lista.length) return null;
    return lista.find((p) => p.id === idSelecionado) ?? lista[0];
  }, [lista, idSelecionado]);

  function selecionarPet(idPet: number) {
    setIdSelecionado(idPet);
    void AsyncStorage.setItem(CHAVE_PET_ATIVO, String(idPet));
  }

  const valor = useMemo(
    () => ({ petAtivo, pets: lista, carregando: isLoading, selecionarPet }),
    [petAtivo, lista, isLoading],
  );

  return <PetAtivoContext.Provider value={valor}>{children}</PetAtivoContext.Provider>;
}

export function usePetAtivo(): EstadoPetAtivo {
  const contexto = useContext(PetAtivoContext);
  if (!contexto) {
    throw new Error('usePetAtivo precisa estar dentro de PetAtivoProvider');
  }
  return contexto;
}
