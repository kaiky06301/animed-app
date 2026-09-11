import { api } from '../api/cliente';
import {
  AgendaDoDia,
  AgendamentoConfirmado,
  AtendimentoConcluido,
  DetalheAtendimento,
  DisponibilidadeAgenda,
  MesDaAgenda,
} from './tipos';

/** Horários livres da clínica em um dia. */
export async function disponibilidade(data: string): Promise<DisponibilidadeAgenda> {
  const { data: resposta } = await api.get<DisponibilidadeAgenda>(
    '/api/agenda/disponibilidade',
    { params: { data } },
  );
  return resposta;
}

/** Dias do mês em que a clínica ainda tem horário livre. */
export async function mes(ano: number, numeroDoMes: number): Promise<MesDaAgenda> {
  const { data } = await api.get<MesDaAgenda>('/api/agenda/disponibilidade/mes', {
    params: { ano, mes: numeroDoMes },
  });
  return data;
}

/** Marca o horário escolhido e devolve a confirmação com as orientações. */
export async function agendar(pedido: {
  idPet: number;
  dataHora: string;
  motivo: string;
}): Promise<AgendamentoConfirmado> {
  const { data } = await api.post<AgendamentoConfirmado>('/api/agenda/agendamentos', pedido);
  return data;
}

/** Agenda do veterinário em um dia: o que já está marcado. */
export async function agendaDoDia(data: string): Promise<AgendaDoDia> {
  const { data: resposta } = await api.get<AgendaDoDia>('/api/agenda/dia', {
    params: { data },
  });
  return resposta;
}

/**
 * Fecha o atendimento e credita os pontos ao tutor.
 *
 * O retorno é opcional e vem no formato "2026-09-28T09:00:00"; quando
 * informado, o horário é reservado na mesma agenda.
 */
export async function concluir(pedido: {
  idConsulta: number;
  retorno?: string | null;
}): Promise<AtendimentoConcluido> {
  const { data } = await api.patch<AtendimentoConcluido>(
    `/api/agenda/atendimentos/${pedido.idConsulta}/concluir`,
    { retorno: pedido.retorno ?? null },
  );
  return data;
}

/** Tudo sobre um atendimento: profissional, endereço, horário e preparo. */
export async function detalhe(idConsulta: number): Promise<DetalheAtendimento> {
  const { data } = await api.get<DetalheAtendimento>(
    `/api/agenda/atendimentos/${idConsulta}`,
  );
  return data;
}
