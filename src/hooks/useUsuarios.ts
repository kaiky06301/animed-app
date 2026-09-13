import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as usuarioService from '../services/usuarioService';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: usuarioService.listarUsuarios,
  });
}

/**
 * Liga ou desliga o acesso de uma conta.
 *
 * Invalida a lista ao terminar para que a tela reflita a mudança sem que o
 * veterinário precise sair e voltar.
 */
export function useMudarAcesso() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) =>
      usuarioService.mudarAcesso(id, ativo),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
