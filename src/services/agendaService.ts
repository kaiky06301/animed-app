import { api } from '../api/cliente';
import { AgendamentoConfirmado, DisponibilidadeAgenda } from './tipos';

/** Horários livres da clínica em um dia. */
export async function disponibilidade(data: string): Promise<DisponibilidadeAgenda> {
  const { data: resposta } = await api.get<DisponibilidadeAgenda>(
    '/api/agenda/disponibilidade',
    { params: { data } },
  );
  return resposta;
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
