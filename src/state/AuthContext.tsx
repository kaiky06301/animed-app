import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { RespostaAutenticacao } from '../services/tipos';

interface EstadoAutenticacao {
  usuario: RespostaAutenticacao | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: {
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    telefone?: string;
  }) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<EstadoAutenticacao | undefined>(undefined);

/**
 * Guarda a sessão autenticada e a restaura quando o app é reaberto,
 * de modo que o usuário não precise entrar de novo a cada abertura.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<RespostaAutenticacao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    authService
      .sessaoSalva()
      .then(setUsuario)
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    setUsuario(await authService.entrar(email, senha));
  }, []);

  const cadastrar = useCallback(async (dados: Parameters<typeof authService.cadastrar>[0]) => {
    setUsuario(await authService.cadastrar(dados));
  }, []);

  const sair = useCallback(async () => {
    await authService.sair();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair }),
    [usuario, carregando, entrar, cadastrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): EstadoAutenticacao {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de AuthProvider');
  }
  return contexto;
}
