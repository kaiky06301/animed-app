import { api } from '../api/cliente';
import { Pagina, Vacina, VacinaRequisicao } from './tipos';

/** Operações de CRUD de vacinas contra a API. */

export async function listarVacinasDoPet(idPet: number): Promise<Vacina[]> {
  const { data } = await api.get<Pagina<Vacina>>(`/api/vacinas/por-pet/${idPet}`, {
    params: { size: 50, sort: 'dataAplicacao,desc' },
  });
  return data.content;
}

export async function criarVacina(vacina: VacinaRequisicao): Promise<Vacina> {
  const { data } = await api.post<Vacina>('/api/vacinas', vacina);
  return data;
}

export async function atualizarVacina(id: number, vacina: VacinaRequisicao): Promise<Vacina> {
  const { data } = await api.put<Vacina>(`/api/vacinas/${id}`, vacina);
  return data;
}

export async function excluirVacina(id: number): Promise<void> {
  await api.delete(`/api/vacinas/${id}`);
}
