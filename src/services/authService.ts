import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, CHAVE_TOKEN } from '../api/cliente';
import { Perfil, RespostaAutenticacao } from './tipos';

const CHAVE_USUARIO = '@animed:usuario';

/** Autentica na API e persiste a sessão no dispositivo. */
export async function entrar(email: string, senha: string): Promise<RespostaAutenticacao> {
  const { data } = await api.post<RespostaAutenticacao>('/api/auth/login', { email, senha });
  await salvarSessao(data);
  return data;
}

/** Cria uma conta de tutor e já devolve a sessão autenticada. */
export async function cadastrar(dados: {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone?: string;
}): Promise<RespostaAutenticacao> {
  const { data } = await api.post<RespostaAutenticacao>('/api/auth/registrar', {
    ...dados,
    role: 'TUTOR',
  });
  await salvarSessao(data);
  return data;
}

/**
 * Cadastra uma pessoa em nome da clínica.
 *
 * Diferente de `cadastrar`, não troca a sessão: quem está no aplicativo é o
 * veterinário atendendo no balcão, e ele precisa continuar sendo ele depois
 * de abrir o acesso para outra pessoa.
 *
 * Criar conta de veterinário exige estar autenticado como veterinário — a
 * regra é validada pela API, não aqui.
 */
export async function cadastrarPessoa(dados: {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone?: string;
  role: Perfil;
}): Promise<void> {
  await api.post('/api/auth/registrar', dados);
}

export async function sair(): Promise<void> {
  await AsyncStorage.multiRemove([CHAVE_TOKEN, CHAVE_USUARIO]);
}

/** Recupera a sessão salva, permitindo reabrir o app já autenticado. */
export async function sessaoSalva(): Promise<RespostaAutenticacao | null> {
  const bruto = await AsyncStorage.getItem(CHAVE_USUARIO);
  return bruto ? (JSON.parse(bruto) as RespostaAutenticacao) : null;
}

async function salvarSessao(sessao: RespostaAutenticacao): Promise<void> {
  await AsyncStorage.multiSet([
    [CHAVE_TOKEN, sessao.token],
    [CHAVE_USUARIO, JSON.stringify(sessao)],
  ]);
}

/** Troca a senha do usuário autenticado; exige a senha atual. */
export async function trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  await api.patch('/api/auth/senha', { senhaAtual, novaSenha });
}
