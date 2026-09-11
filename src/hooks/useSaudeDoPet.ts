import { useQuery } from '@tanstack/react-query';
import * as consultaService from '../services/consultaService';
import * as vacinaService from '../services/vacinaService';

export type SituacaoSaude = 'em-dia' | 'atrasado' | 'sem-historico' | 'sem-previsao';

export interface SaudeDoPet {
  /** Estado do acompanhamento de vacinação. */
  estado: SituacaoSaude;
  /** true apenas quando há reforço previsto e nenhum vencido. */
  emDia: boolean;
  /** Rótulo curto para exibição. */
  situacao: string;
  /** Data da última consulta realizada, em ISO, ou null. */
  ultimaConsulta: string | null;
  /** Próximo atendimento ainda por acontecer, ou null. */
  proximoAtendimento: { dataHora: string; motivo: string } | null;
}

/**
 * Resume a situação de saúde do pet a partir dos dados reais.
 *
 * Só afirma que está em dia quando existe histórico com reforço previsto
 * e nenhuma dose vencida: pet sem vacina registrada não tem como estar
 * "em dia", e dizer isso daria uma segurança falsa ao tutor.
 */
export function useSaudeDoPet(idPet: number | null) {
  return useQuery<SaudeDoPet>({
    queryKey: ['saude-pet', idPet],
    enabled: idPet != null,
    queryFn: async () => {
      const [vacinas, consultas] = await Promise.all([
        vacinaService.listarVacinasDoPet(idPet as number),
        consultaService.listarConsultasDoPet(idPet as number),
      ]);

      const hoje = new Date();

      const vencidas = vacinas.filter(
        (v) => v.dataProximaDose != null && new Date(v.dataProximaDose) < hoje,
      );

      // Só conta como "última" a consulta que já aconteceu de fato
      const realizadas = consultas
        .filter((c) => c.status === 'REALIZADA' && new Date(c.dataHora) <= hoje)
        .sort((a, b) => (a.dataHora < b.dataHora ? 1 : -1));

      const agendadas = consultas
        .filter((c) => c.status === 'AGENDADA' && new Date(c.dataHora) >= hoje)
        .sort((a, b) => (a.dataHora > b.dataHora ? 1 : -1));

      let estado: SituacaoSaude;
      if (vacinas.length === 0) estado = 'sem-historico';
      else if (vencidas.length > 0) estado = 'atrasado';
      else if (!vacinas.some((v) => v.dataProximaDose)) estado = 'sem-previsao';
      else estado = 'em-dia';

      const situacao =
        estado === 'em-dia'
          ? 'Vacinas em dia!'
          : estado === 'atrasado'
            ? vencidas.length === 1
              ? '1 vacina atrasada'
              : `${vencidas.length} vacinas atrasadas`
            : estado === 'sem-historico'
              ? 'Sem vacinas registradas'
              : 'Sem reforço previsto';

      return {
        estado,
        emDia: estado === 'em-dia',
        situacao,
        ultimaConsulta: realizadas[0]?.dataHora ?? null,
        proximoAtendimento: agendadas[0]
          ? { dataHora: agendadas[0].dataHora, motivo: agendadas[0].motivo }
          : null,
      };
    },
  });
}
