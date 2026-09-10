import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as vacinaService from '../services/vacinaService';
import { VacinaRequisicao } from '../services/tipos';

/** Hooks de acesso às vacinas de um pet. */

export const CHAVE_VACINAS = 'vacinas';

export function useVacinas(idPet: number | null) {
  return useQuery({
    queryKey: [CHAVE_VACINAS, idPet],
    queryFn: () => vacinaService.listarVacinasDoPet(idPet as number),
    enabled: idPet != null,
  });
}

export function useCriarVacina() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (vacina: VacinaRequisicao) => vacinaService.criarVacina(vacina),
    onSuccess: () => client.invalidateQueries({ queryKey: [CHAVE_VACINAS] }),
  });
}

export function useAtualizarVacina() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, vacina }: { id: number; vacina: VacinaRequisicao }) =>
      vacinaService.atualizarVacina(id, vacina),
    onSuccess: () => client.invalidateQueries({ queryKey: [CHAVE_VACINAS] }),
  });
}

export function useExcluirVacina() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vacinaService.excluirVacina(id),
    onSuccess: () => client.invalidateQueries({ queryKey: [CHAVE_VACINAS] }),
  });
}
