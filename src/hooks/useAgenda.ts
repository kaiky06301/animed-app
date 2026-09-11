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

/** Calendário do mês: quais dias ainda têm vaga. */
export function useMesDaAgenda(ano: number, mes: number) {
  return useQuery({
    queryKey: ['agenda', 'mes', ano, mes],
    queryFn: () => agendaService.mes(ano, mes),
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

/** Agenda do veterinário no dia escolhido. */
export function useAgendaDoDia(data: string) {
  return useQuery({
    queryKey: ['agenda', 'dia', data],
    queryFn: () => agendaService.agendaDoDia(data),
  });
}

/** Conclusão do atendimento pelo veterinário. */
export function useConcluirAtendimento() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: agendaService.concluir,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['agenda'] });
      client.invalidateQueries({ queryKey: ['consultas'] });
    },
  });
}
