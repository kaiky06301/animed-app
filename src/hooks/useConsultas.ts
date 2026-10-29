import { useQuery } from '@tanstack/react-query';
import * as consultaService from '../services/consultaService';

/**
 * Atendimentos de um pet. `ativo` permite adiar a busca (ex.: só quando a
 * janela de agendamento estiver aberta).
 */
export function useConsultasDoPet(idPet: number | null | undefined, ativo = true) {
  return useQuery({
    queryKey: ['consultas', idPet],
    queryFn: () => consultaService.listarConsultasDoPet(idPet as number),
    enabled: idPet != null && ativo,
  });
}
