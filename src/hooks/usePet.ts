import { useQuery } from '@tanstack/react-query';
import * as petService from '../services/petService';

/** Dados de um pet específico. */
export function usePet(idPet: number | null) {
  return useQuery({
    queryKey: ['pet', idPet],
    queryFn: () => petService.buscarPet(idPet as number),
    enabled: idPet != null,
  });
}
