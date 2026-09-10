import { api } from '../api/cliente';
import { Consulta, Pagina } from './tipos';

export async function listarConsultasDoPet(idPet: number): Promise<Consulta[]> {
  const { data } = await api.get<Pagina<Consulta>>(`/api/consultas/por-pet/${idPet}`, {
    params: { size: 50, sort: 'dataHora,desc' },
  });
  return data.content;
}
