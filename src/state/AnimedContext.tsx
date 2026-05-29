import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PONTOS, ROTULOS_ACOES, type AcaoPontuavel } from '../utils/nivel';
import type { EstadoPersistido, Pet, PlanoB2C } from './tipos';

const CHAVE_STORAGE = '@animed/estado-v1';

const ESTADO_INICIAL: EstadoPersistido = {
  pet: null,
  pontos: 0,
  plano: 'gratuito',
  historico: [],
  acoesContabilizadas: [],
};

interface ContextoAnimed extends EstadoPersistido {
  pronto: boolean;
  registrarAcao: (acao: AcaoPontuavel, opcoes?: { unico?: boolean }) => number;
  salvarPet: (pet: Pet) => void;
  escolherPlano: (plano: PlanoB2C) => void;
  resetarTudo: () => void;
}

const AnimedContext = createContext<ContextoAnimed | undefined>(undefined);

function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function AnimedProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoPersistido>(ESTADO_INICIAL);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const bruto = await AsyncStorage.getItem(CHAVE_STORAGE);
        if (bruto) {
          const carregado = JSON.parse(bruto) as EstadoPersistido;
          setEstado({ ...ESTADO_INICIAL, ...carregado });
        }
      } catch (erro) {
        console.warn('Falha ao carregar estado:', erro);
      } finally {
        setPronto(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!pronto) return;
    AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado)).catch((erro) =>
      console.warn('Falha ao persistir estado:', erro),
    );
  }, [estado, pronto]);

  const registrarAcao = useCallback<ContextoAnimed['registrarAcao']>(
    (acao, opcoes) => {
      let ganho = 0;
      setEstado((anterior) => {
        if (opcoes?.unico && anterior.acoesContabilizadas.includes(acao)) {
          return anterior;
        }
        ganho = PONTOS[acao];
        const evento = {
          id: gerarId(),
          acao,
          rotulo: ROTULOS_ACOES[acao],
          pontos: ganho,
          data: new Date().toISOString(),
        };
        return {
          ...anterior,
          pontos: anterior.pontos + ganho,
          historico: [evento, ...anterior.historico].slice(0, 100),
          acoesContabilizadas: opcoes?.unico
            ? [...anterior.acoesContabilizadas, acao]
            : anterior.acoesContabilizadas,
        };
      });
      return ganho;
    },
    [],
  );

  const salvarPet = useCallback<ContextoAnimed['salvarPet']>((pet) => {
    setEstado((anterior) => ({ ...anterior, pet }));
  }, []);

  const escolherPlano = useCallback<ContextoAnimed['escolherPlano']>((plano) => {
    setEstado((anterior) => ({ ...anterior, plano }));
  }, []);

  const resetarTudo = useCallback(() => {
    setEstado(ESTADO_INICIAL);
  }, []);

  const valor = useMemo<ContextoAnimed>(
    () => ({
      ...estado,
      pronto,
      registrarAcao,
      salvarPet,
      escolherPlano,
      resetarTudo,
    }),
    [estado, pronto, registrarAcao, salvarPet, escolherPlano, resetarTudo],
  );

  return <AnimedContext.Provider value={valor}>{children}</AnimedContext.Provider>;
}

export function useAnimed(): ContextoAnimed {
  const ctx = useContext(AnimedContext);
  if (!ctx) {
    throw new Error('useAnimed deve ser usado dentro de <AnimedProvider>.');
  }
  return ctx;
}
