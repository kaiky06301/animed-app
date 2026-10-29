import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as medicamentoService from '../services/medicamentoService';
import * as notificacaoService from '../services/notificacaoService';
import type { Medicamento } from '../services/tipos';

/** Medicamentos prescritos ao pet. */
export function useMedicamentos(idPet: number | null) {
  return useQuery({
    queryKey: ['medicamentos', idPet],
    queryFn: () => medicamentoService.listarPorPet(idPet as number),
    enabled: idPet != null,
  });
}

/** Registro de uma dose pelo tutor; já deixa agendado o lembrete da próxima. */
export function useRegistrarDose() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ medicamento, observacao }: {
      medicamento: Medicamento;
      observacao?: string;
    }) => medicamentoService.registrarDose(medicamento.id, observacao),
    onSuccess: (dose, { medicamento }) => {
      void notificacaoService.agendarProximaDose(medicamento, dose.proximaDose);
      client.invalidateQueries({ queryKey: ['medicamentos'] });
      client.invalidateQueries({ queryKey: ['tutor'] });
    },
  });
}

/** Confirmação do fim do tratamento pelo tutor. */
export function useConfirmarFimTratamento() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: medicamentoService.confirmarFim,
    onSuccess: (_, idMedicamento) => {
      void notificacaoService.cancelarLembreteDeDose(idMedicamento);
      client.invalidateQueries({ queryKey: ['medicamentos'] });
    },
  });
}

/** Prescrição pelo veterinário. */
export function usePrescrever() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: medicamentoService.prescrever,
    onSuccess: () => client.invalidateQueries({ queryKey: ['medicamentos'] }),
  });
}

/** Encerramento do tratamento pelo veterinário. */
export function useEncerrarMedicamento() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: medicamentoService.encerrar,
    onSuccess: () => client.invalidateQueries({ queryKey: ['medicamentos'] }),
  });
}
