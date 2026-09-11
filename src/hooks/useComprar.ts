import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as transacaoService from '../services/transacaoService';

/** Compra em parceiro: rende pontos e pode gastar moedas. */
export function useComprar() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: transacaoService.comprar,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['tutor'] });
      client.invalidateQueries({ queryKey: ['historico-pontos'] });
    },
  });
}
