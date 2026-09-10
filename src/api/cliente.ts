import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Endereço da API.
 *
 * No emulador Android o host da máquina é 10.0.2.2; no navegador e no iOS
 * o localhost resolve normalmente. Em dispositivo físico, troque por
 * EXPO_PUBLIC_API_URL com o IP da máquina na rede local.
 */
const URL_PADRAO = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? URL_PADRAO;

export const CHAVE_TOKEN = '@animed:token';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** Anexa o token salvo a cada requisição. */
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(CHAVE_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Converte o erro da API em uma mensagem legível para a interface. */
export function mensagemDoErro(erro: unknown, padrao = 'Não foi possível concluir a operação'): string {
  if (axios.isAxiosError(erro)) {
    const dados = erro.response?.data as { message?: string; details?: string[] } | undefined;
    if (dados?.details?.length) return dados.details.join('\n');
    if (dados?.message) return dados.message;
    if (erro.code === 'ECONNABORTED') return 'A API demorou para responder. Tente novamente.';
    if (!erro.response) return 'Não foi possível falar com a API. Ela está no ar?';
  }
  return padrao;
}
