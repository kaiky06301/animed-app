import { useQuery } from '@tanstack/react-query';
import * as petService from '../services/petService';

/**
 * Pacientes sob cuidado da clínica.
 * Diferente de usePets, que traz apenas os pets de um tutor.
 */
export function usePacientes() {
  return useQuery({
    queryKey: ['pacientes'],
    queryFn: petService.listarTodosOsPets,
  });
}
