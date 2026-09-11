import { api } from '../api/cliente';
import type { CompraRealizada } from './tipos';

/**
 * Registra a compra em um pet shop parceiro.
 *
 * As moedas são opcionais: quando informadas, abatem parte do valor, e a
 * API recusa se o nível do tutor ainda não as liberou.
 */
export async function comprar(pedido: {
  valorBruto: number;
  descricaoProduto: string;
  idTutor: number;
  idPetShop: number;
  moedasUsadas?: number;
}): Promise<CompraRealizada> {
  const { data } = await api.post<CompraRealizada>('/api/transacoes', {
    ...pedido,
    moedasUsadas: pedido.moedasUsadas ?? 0,
  });
  return data;
}
