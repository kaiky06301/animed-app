import { api } from '../api/cliente';
import { Tutor } from './tipos';

export async function buscarTutor(idTutor: number): Promise<Tutor> {
  const { data } = await api.get<Tutor>(`/api/tutores/${idTutor}`);
  return data;
}
