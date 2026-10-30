import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as fotoService from '../services/fotoPetService';
import { registrarFotoDoPet } from '../services/petService';

/**
 * Controla a foto de um pet: carrega a salva, abre a galeria e persiste
 * a escolha. Avisa, pelo retorno, quando a foto foi definida pela
 * primeira vez — é o gancho usado para creditar os pontos.
 *
 * A foto fica no cache do TanStack Query, então todas as telas que mostram
 * o mesmo pet (Início, Meus pets, Perfil...) atualizam juntas.
 */
export function useFotoPet(idPet: number | null) {
  const client = useQueryClient();
  const [pontosGanhos, setPontosGanhos] = useState(0);

  const consulta = useQuery({
    queryKey: ['foto-pet', idPet],
    queryFn: () => fotoService.fotoDoPet(idPet as number),
    enabled: idPet != null,
    staleTime: Infinity,
  });
  const uri = idPet == null ? null : consulta.data ?? null;

  /** Abre a galeria e salva a escolha. Retorna true se era a primeira foto. */
  const escolherFoto = useCallback(async (): Promise<boolean> => {
    if (idPet == null) return false;

    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) return false;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (resultado.canceled || !resultado.assets?.length) return false;

    const eraPrimeira = uri == null;
    const nova = resultado.assets[0].uri;
    await fotoService.salvarFotoDoPet(idPet, nova);
    client.setQueryData(['foto-pet', idPet], nova);

    if (eraPrimeira) {
      // A API decide se há pontos: só o primeiro pet do tutor rende, uma vez
      try {
        const ganhos = await registrarFotoDoPet(idPet);
        setPontosGanhos(ganhos);
        if (ganhos > 0) {
          client.invalidateQueries({ queryKey: ['tutor'] });
        }
      } catch {
        // A foto continua salva mesmo se a pontuação falhar
      }
    }

    return eraPrimeira;
  }, [idPet, uri, client]);

  return { uri, carregando: idPet != null && consulta.isLoading, escolherFoto, pontosGanhos };
}
