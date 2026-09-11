import { api } from '../api/cliente';
import { CuidadoRegistrado, TipoCuidado } from './tipos';

/** Registra um cuidado realizado pelo tutor e devolve os pontos creditados. */
export async function registrarCuidado(dados: {
  idPet: number;
  tipo: TipoCuidado;
  pesoKg?: number;
  observacao?: string;
}): Promise<CuidadoRegistrado> {
  const { data } = await api.post<CuidadoRegistrado>('/api/cuidados', dados);
  return data;
}
