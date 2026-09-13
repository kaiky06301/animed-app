import { api } from '../api/cliente';
import type { Perfil } from './tipos';

export interface UsuarioDaClinica {
  id: number;
  nome: string;
  email: string;
  role: Perfil;
  ativo: boolean;
  dataCadastro: string;
  idTutor: number | null;
  pets: number;
}

/** Contas de acesso da clínica, ativas primeiro. */
export async function listarUsuarios(): Promise<UsuarioDaClinica[]> {
  const { data } = await api.get<UsuarioDaClinica[]>('/api/usuarios');
  return data;
}

/**
 * Liga ou desliga o acesso de alguém.
 *
 * A conta não é apagada: o histórico clínico que a pessoa produziu continua
 * com autoria.
 */
export async function mudarAcesso(id: number, ativo: boolean): Promise<UsuarioDaClinica> {
  const { data } = await api.patch<UsuarioDaClinica>(`/api/usuarios/${id}/acesso`, { ativo });
  return data;
}
