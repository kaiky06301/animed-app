import { api } from '../api/cliente';
import type { LancamentoPontos, Pagina } from './tipos';

/** Lançamentos de pontuação do tutor, do mais recente para o mais antigo. */
export async function listarPorTutor(idTutor: number): Promise<LancamentoPontos[]> {
  const { data } = await api.get<Pagina<LancamentoPontos>>(
    `/api/historico-pontuacao/por-tutor/${idTutor}`,
    { params: { size: 100, sort: 'dataHora,desc' } },
  );
  return data.content;
}
