import { api } from '../api/cliente';
import type { DoseRegistrada, Medicamento, MedicamentoRequisicao } from './tipos';

/** Medicamentos prescritos ao pet, do mais recente para o mais antigo. */
export async function listarPorPet(idPet: number): Promise<Medicamento[]> {
  const { data } = await api.get<Medicamento[]>(`/api/medicamentos/por-pet/${idPet}`);
  return data;
}

/** Prescrição — só o veterinário pode. */
export async function prescrever(pedido: MedicamentoRequisicao): Promise<Medicamento> {
  const { data } = await api.post<Medicamento>('/api/medicamentos', pedido);
  return data;
}

/** Registro de uma dose dada pelo tutor. */
export async function registrarDose(
  idMedicamento: number,
  observacao?: string,
): Promise<DoseRegistrada> {
  const { data } = await api.post<DoseRegistrada>(
    `/api/medicamentos/${idMedicamento}/doses`,
    { observacao: observacao ?? null },
  );
  return data;
}

/** Encerra o tratamento na data de hoje. */
export async function encerrar(idMedicamento: number): Promise<void> {
  await api.delete(`/api/medicamentos/${idMedicamento}`);
}
