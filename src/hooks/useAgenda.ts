import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as agendaService from '../services/agendaService';

/** Horários livres do dia selecionado. */
export function useDisponibilidade(data: string | null) {
  return useQuery({
    queryKey: ['agenda', data],
    queryFn: () => agendaService.disponibilidade(data as string),
    enabled: !!data,
  });
}

export function useAgendar() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: agendaService.agendar,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['tutor'] });
      client.invalidateQueries({ queryKey: ['agenda'] });
      client.invalidateQueries({ queryKey: ['saude-pet'] });
    },
  });
}
