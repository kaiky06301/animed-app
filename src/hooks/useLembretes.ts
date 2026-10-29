import { useQueries } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import type { RaizParamList } from '../navigation/tipos';
import * as medicamentoService from '../services/medicamentoService';
import * as notificacaoService from '../services/notificacaoService';
import type { DestinoNotificacao } from '../services/notificacaoService';
import { usePetAtivo } from '../state/PetAtivoContext';

/**
 * Mantém os lembretes de remédio em dia com o que está na API.
 *
 * Quando o veterinário prescreve um medicamento, o tutor recebe o aviso
 * assim que o app carrega a lista: na hora, se a dose já está liberada, ou
 * agendado para o horário da próxima dose.
 */
export function useLembretesDeMedicamentos() {
  const { pets } = usePetAtivo();

  // mesma chave de useMedicamentos, então reaproveita o cache das telas
  const consultas = useQueries({
    queries: pets.map((pet) => ({
      queryKey: ['medicamentos', pet.id],
      queryFn: () => medicamentoService.listarPorPet(pet.id),
    })),
  });

  const medicamentos = consultas.flatMap((c) => c.data ?? []);
  const assinatura = medicamentos
    .map((m) => `${m.id}:${m.emCurso}:${m.proximaDose}:${m.doseLiberada}`)
    .join('|');

  useEffect(() => {
    void notificacaoService.prepararNotificacoes();
  }, []);

  useEffect(() => {
    for (const medicamento of medicamentos) {
      if (!medicamento.emCurso) {
        void notificacaoService.cancelarLembreteDeDose(medicamento.id);
      } else if (medicamento.doseLiberada && !medicamento.dosePerdida) {
        void notificacaoService.avisarDoseLiberada(medicamento);
      } else if (medicamento.proximaDose) {
        void notificacaoService.agendarProximaDose(medicamento, medicamento.proximaDose);
      }
    }
    // a assinatura muda só quando algo relevante dos medicamentos muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura]);
}

/**
 * Ao tocar numa notificação, abre a tela do lembrete no pet certo.
 * Usado dentro do fluxo do tutor, então só age com a sessão aberta.
 */
export function useAberturaPorNotificacao() {
  const navigation = useNavigation<NativeStackNavigationProp<RaizParamList>>();
  const { selecionarPet } = usePetAtivo();

  useEffect(() => {
    // no navegador não existe notificação local
    if (Platform.OS === 'web') return;

    function abrir(resposta: Notifications.NotificationResponse | null) {
      const destino = resposta?.notification.request.content.data as
        | DestinoNotificacao
        | undefined;
      if (!destino?.tela) return;

      selecionarPet(destino.idPet);
      if (destino.tela === 'Vacinas') {
        navigation.navigate('Vacinas', { idPet: destino.idPet, nomePet: destino.nomePet });
      } else {
        navigation.navigate('Medicamentos');
      }
      void Notifications.clearLastNotificationResponseAsync();
    }

    // app aberto pelo toque (estava fechado) ou tocado com o app rodando
    void Notifications.getLastNotificationResponseAsync().then(abrir);
    const assinatura = Notifications.addNotificationResponseReceivedListener(abrir);
    return () => assinatura.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
