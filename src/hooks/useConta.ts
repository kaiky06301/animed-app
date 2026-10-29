import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authService from '../services/authService';

/** Troca de senha do usuário logado. */
export function useTrocarSenha() {
  return useMutation({
    mutationFn: ({ atual, nova }: { atual: string; nova: string }) =>
      authService.trocarSenha(atual, nova),
  });
}

/** Cadastro de tutor ou veterinário feito pela clínica; atualiza a lista de usuários. */
export function useCadastrarPessoa() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authService.cadastrarPessoa,
    onSuccess: () => client.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}
