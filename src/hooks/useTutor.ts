import { useQuery } from '@tanstack/react-query';
import * as tutorService from '../services/tutorService';
import { useAuth } from '../state/AuthContext';

/**
 * Dados de gamificação do tutor autenticado: pontos, moedas e nível.
 * A fonte é sempre a API — o saldo é calculado no servidor.
 */
export function useTutor() {
  const { usuario } = useAuth();
  const idTutor = usuario?.idTutor ?? null;

  return useQuery({
    queryKey: ['tutor', idTutor],
    queryFn: () => tutorService.buscarTutor(idTutor as number),
    enabled: idTutor != null,
  });
}
