import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as petService from '../services/petService';
import { PetRequisicao } from '../services/tipos';

/**
 * Hooks de acesso aos pets.
 * Concentram a comunicação com a API e o cache, deixando as telas
 * responsáveis apenas por exibir dados e disparar ações.
 */

export const CHAVE_PETS = 'pets';

export function usePets(idTutor: number | null) {
  return useQuery({
    queryKey: [CHAVE_PETS, idTutor],
    queryFn: () => petService.listarPetsDoTutor(idTutor as number),
    enabled: idTutor != null,
  });
}

export function useCriarPet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (pet: PetRequisicao) => petService.criarPet(pet),
    // Invalida o cache para a lista refletir a mudança sem recarregar o app
    onSuccess: () => client.invalidateQueries({ queryKey: [CHAVE_PETS] }),
  });
}

export function useAtualizarPet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pet }: { id: number; pet: PetRequisicao }) =>
      petService.atualizarPet(id, pet),
    onSuccess: () => client.invalidateQueries({ queryKey: [CHAVE_PETS] }),
  });
}

export function useExcluirPet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => petService.excluirPet(id),
    onSuccess: () => client.invalidateQueries({ queryKey: [CHAVE_PETS] }),
  });
}
