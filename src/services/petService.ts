import { api } from '../api/cliente';
import { Pagina, Pet, PetRequisicao } from './tipos';

/** Operações de CRUD de pets contra a API. */

export async function listarPetsDoTutor(idTutor: number): Promise<Pet[]> {
  const { data } = await api.get<Pagina<Pet>>(`/api/pets/por-tutor/${idTutor}`, {
    params: { size: 50, sort: 'nome,asc' },
  });
  return data.content;
}

export async function buscarPet(id: number): Promise<Pet> {
  const { data } = await api.get<Pet>(`/api/pets/${id}`);
  return data;
}

export async function criarPet(pet: PetRequisicao): Promise<Pet> {
  const { data } = await api.post<Pet>('/api/pets', pet);
  return data;
}

export async function atualizarPet(id: number, pet: PetRequisicao): Promise<Pet> {
  const { data } = await api.put<Pet>(`/api/pets/${id}`, pet);
  return data;
}

export async function excluirPet(id: number): Promise<void> {
  await api.delete(`/api/pets/${id}`);
}
