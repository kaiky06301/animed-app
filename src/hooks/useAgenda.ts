import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as agendaService from '../services/agendaService';

/** Horários livres do dia selecionado. */
export function useDisponibilidade(data: string | null, idVeterinario?: number) {
  return useQuery({
    queryKey: ['agenda', data, idVeterinario ?? null],
    queryFn: () => agendaService.disponibilidade(data as string, idVeterinario),
    enabled: !!data,
  });
}

/** Calendário do mês: quais dias ainda têm vaga. */
export function useMesDaAgenda(ano: number, mes: number, idVeterinario?: number) {
  return useQuery({
    queryKey: ['agenda', 'mes', ano, mes, idVeterinario ?? null],
    queryFn: () => agendaService.mes(ano, mes, idVeterinario),
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
      // Sem isto a lista de atendimentos do tutor continua com a versão
      // anterior e o horário recém-marcado não aparece.
      client.invalidateQueries({ queryKey: ['consultas'] });
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

/** Detalhe de um atendimento, carregado ao abrir o cartão. */
export function useDetalheAtendimento(idConsulta: number | null) {
  return useQuery({
    queryKey: ['atendimento', idConsulta],
    queryFn: () => agendaService.detalhe(idConsulta as number),
    enabled: idConsulta != null,
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

/** Registro de falta pelo veterinário. */
export function useRegistrarFalta() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: agendaService.registrarFalta,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['agenda'] });
      client.invalidateQueries({ queryKey: ['consultas'] });
      client.invalidateQueries({ queryKey: ['tutor'] });
    },
  });
}

/** Cancelamento do atendimento pelo tutor. */
export function useCancelarAtendimento() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: agendaService.cancelar,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['tutor'] });
      client.invalidateQueries({ queryKey: ['agenda'] });
      client.invalidateQueries({ queryKey: ['consultas'] });
      client.invalidateQueries({ queryKey: ['atendimento'] });
      client.invalidateQueries({ queryKey: ['saude-pet'] });
    },
  });
}
