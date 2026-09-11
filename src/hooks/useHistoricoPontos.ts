import { useQuery } from '@tanstack/react-query';
import * as historicoService from '../services/historicoService';

/** Histórico de pontuação do tutor. */
export function useHistoricoPontos(idTutor: number | null) {
  return useQuery({
    queryKey: ['historico-pontos', idTutor],
    queryFn: () => historicoService.listarPorTutor(idTutor as number),
    enabled: idTutor != null,
  });
}
