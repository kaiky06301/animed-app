import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Medicamento } from './tipos';

/**
 * Lembretes locais do Animed (expo-notifications).
 *
 * O próprio celular agenda e mostra os avisos, então funcionam mesmo sem
 * internet. Cada lembrete leva no `data` a tela que deve abrir ao toque.
 */

/** Para onde o toque na notificação leva o tutor. */
export type DestinoNotificacao =
  | { tela: 'Medicamentos'; idPet: number }
  | { tela: 'Vacinas'; idPet: number; nomePet: string };

const CANAL = 'lembretes';
const CHAVE_AVISADAS = '@animed:doses-avisadas';

/** Navegador não agenda notificação local; lá os lembretes são ignorados. */
const suportado = Platform.OS !== 'web';

// Mostra o aviso mesmo com o app aberto na tela
if (suportado) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Pede a permissão (Android 13+ e iOS) e cria o canal de lembretes. */
export async function prepararNotificacoes(): Promise<boolean> {
  if (!suportado) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Lembretes de cuidado',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

/** Converte o LocalDateTime da API ("2026-10-29T14:00:00") em Date local. */
function paraData(iso: string): Date {
  return new Date(iso);
}

function idDoLembreteDeDose(idMedicamento: number) {
  return `dose-${idMedicamento}`;
}

/**
 * Agenda o aviso da próxima dose. Substitui o lembrete anterior do mesmo
 * medicamento, para nunca haver dois avisos da mesma dose.
 */
export async function agendarProximaDose(
  medicamento: Pick<Medicamento, 'id' | 'nome' | 'dosagem' | 'idPet' | 'nomePet'>,
  proximaDose: string,
): Promise<void> {
  if (!suportado) return;

  const quando = paraData(proximaDose);
  if (quando.getTime() <= Date.now()) return;

  const identifier = idDoLembreteDeDose(medicamento.id);
  await Notifications.cancelScheduledNotificationAsync(identifier);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: `Hora do remédio de ${medicamento.nomePet} 💊`,
      body: `${medicamento.nome}${medicamento.dosagem ? ` ${medicamento.dosagem}` : ''}. `
        + 'Registre a dose no Animed para ganhar pontos.',
      data: { tela: 'Medicamentos', idPet: medicamento.idPet } satisfies DestinoNotificacao,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: quando, channelId: CANAL },
  });
}

/** Cancela o lembrete de um medicamento que saiu de uso. */
export async function cancelarLembreteDeDose(idMedicamento: number): Promise<void> {
  if (!suportado) return;
  await Notifications.cancelScheduledNotificationAsync(idDoLembreteDeDose(idMedicamento));
}

/**
 * Avisa na hora que uma dose já pode ser dada (ex.: o veterinário acabou
 * de prescrever). Cada dose é avisada uma única vez.
 */
export async function avisarDoseLiberada(medicamento: Medicamento): Promise<void> {
  if (!suportado || !medicamento.proximaDose) return;

  const chaveDaDose = `${medicamento.id}@${medicamento.proximaDose}`;
  const salvas: string[] = JSON.parse((await AsyncStorage.getItem(CHAVE_AVISADAS)) ?? '[]');
  if (salvas.includes(chaveDaDose)) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: medicamento.minutosDeAtraso > 0
        ? `Dose atrasada de ${medicamento.nomePet} ⏰`
        : `Hora do remédio de ${medicamento.nomePet} 💊`,
      body: `${medicamento.nome} (${medicamento.posologia}). Toque para registrar a dose.`,
      data: { tela: 'Medicamentos', idPet: medicamento.idPet } satisfies DestinoNotificacao,
    },
    trigger: { channelId: CANAL, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
  });

  // guarda só as últimas, o suficiente para não repetir
  await AsyncStorage.setItem(CHAVE_AVISADAS, JSON.stringify([...salvas, chaveDaDose].slice(-50)));
}

/** Lembra o reforço da vacina às 9h do dia anterior. */
export async function agendarReforcoDeVacina(vacina: {
  id: number;
  nomeVacina: string;
  dataProximaDose: string | null;
  idPet: number;
  nomePet: string;
}): Promise<void> {
  if (!suportado) return;

  const identifier = `reforco-${vacina.id}`;
  await Notifications.cancelScheduledNotificationAsync(identifier);
  if (!vacina.dataProximaDose) return;

  const [ano, mes, dia] = vacina.dataProximaDose.slice(0, 10).split('-').map(Number);
  const vespera = new Date(ano, mes - 1, dia - 1, 9, 0, 0);
  if (vespera.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: `Reforço de vacina amanhã 💉`,
      body: `${vacina.nomePet} toma o reforço da ${vacina.nomeVacina} amanhã. Já marcou com a clínica?`,
      data: {
        tela: 'Vacinas',
        idPet: vacina.idPet,
        nomePet: vacina.nomePet,
      } satisfies DestinoNotificacao,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: vespera, channelId: CANAL },
  });
}

/** Cancela o lembrete de reforço de uma vacina excluída. */
export async function cancelarReforcoDeVacina(idVacina: number): Promise<void> {
  if (!suportado) return;
  await Notifications.cancelScheduledNotificationAsync(`reforco-${idVacina}`);
}
