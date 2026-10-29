import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { coresClaras, coresEscuras, type Paleta } from '../theme/cores';

const CHAVE_TEMA = '@animed:tema';

/** "sistema" segue o tema configurado no celular. */
export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';

interface EstadoTema {
  cores: Paleta;
  escuro: boolean;
  preferencia: PreferenciaTema;
  mudarPreferencia: (preferencia: PreferenciaTema) => void;
}

const TemaContext = createContext<EstadoTema | undefined>(undefined);

/**
 * Decide entre o tema claro e o escuro.
 *
 * Por padrão acompanha o celular (useColorScheme); o tutor pode fixar um
 * dos dois no Perfil, e a escolha fica salva para a próxima abertura.
 */
export function TemaProvider({ children }: { children: React.ReactNode }) {
  const esquemaDoCelular = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaTema>('sistema');

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_TEMA).then((salvo) => {
      if (salvo === 'claro' || salvo === 'escuro' || salvo === 'sistema') setPreferencia(salvo);
    });
  }, []);

  function mudarPreferencia(nova: PreferenciaTema) {
    setPreferencia(nova);
    void AsyncStorage.setItem(CHAVE_TEMA, nova);
  }

  const escuro =
    preferencia === 'sistema' ? esquemaDoCelular !== 'light' : preferencia === 'escuro';

  const valor = useMemo(
    () => ({ cores: escuro ? coresEscuras : coresClaras, escuro, preferencia, mudarPreferencia }),
    [escuro, preferencia],
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema(): EstadoTema {
  const contexto = useContext(TemaContext);
  if (!contexto) throw new Error('useTema precisa estar dentro de <TemaProvider>');
  return contexto;
}

/** Monta o StyleSheet da tela com as cores do tema atual. */
export function useEstilos<T>(criarEstilos: (cores: Paleta) => T): T {
  const { cores } = useTema();
  return useMemo(() => criarEstilos(cores), [cores, criarEstilos]);
}
