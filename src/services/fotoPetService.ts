import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Guarda a foto do pet no próprio dispositivo.
 *
 * A imagem fica local porque a API ainda não armazena arquivos; a chave é
 * o identificador do pet, de modo que cada pet tenha a sua.
 */
const prefixo = '@animed:foto-pet:';

export async function fotoDoPet(idPet: number): Promise<string | null> {
  return AsyncStorage.getItem(prefixo + idPet);
}

export async function salvarFotoDoPet(idPet: number, uri: string): Promise<void> {
  await AsyncStorage.setItem(prefixo + idPet, uri);
}

export async function removerFotoDoPet(idPet: number): Promise<void> {
  await AsyncStorage.removeItem(prefixo + idPet);
}
