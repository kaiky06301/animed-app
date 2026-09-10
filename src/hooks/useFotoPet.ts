import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as fotoService from '../services/fotoPetService';
import { registrarFotoDoPet } from '../services/petService';

/**
 * Controla a foto de um pet: carrega a salva, abre a galeria e persiste
 * a escolha. Avisa, pelo retorno, quando a foto foi definida pela
 * primeira vez — é o gancho usado para creditar os pontos.
 */
export function useFotoPet(idPet: number | null) {
  const client = useQueryClient();
  const [uri, setUri] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [pontosGanhos, setPontosGanhos] = useState(0);

  useEffect(() => {
    let ativo = true;
    if (idPet == null) {
      setUri(null);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    fotoService.fotoDoPet(idPet).then((salva) => {
      if (ativo) {
        setUri(salva);
        setCarregando(false);
      }
    });
    return () => {
      ativo = false;
    };
  }, [idPet]);

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
    setUri(nova);

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

  return { uri, carregando, escolherFoto, pontosGanhos };
}
