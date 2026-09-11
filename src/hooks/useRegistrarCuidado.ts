import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as cuidadoService from '../services/cuidadoService';
import { TipoCuidado } from '../services/tipos';

/**
 * Registra um cuidado do tutor.
 * Atualiza o saldo de pontos e os dados do pet após o registro.
 */
export function useRegistrarCuidado() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (dados: {
      idPet: number;
      tipo: TipoCuidado;
      pesoKg?: number;
      observacao?: string;
    }) => cuidadoService.registrarCuidado(dados),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['tutor'] });
      client.invalidateQueries({ queryKey: ['pets'] });
      client.invalidateQueries({ queryKey: ['pet'] });
    },
  });
}
