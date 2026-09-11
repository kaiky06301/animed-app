import { api } from '../api/cliente';
import { AgendamentoConfirmado, DisponibilidadeAgenda, MesDaAgenda } from './tipos';

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
