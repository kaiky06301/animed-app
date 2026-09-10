import { useQuery } from '@tanstack/react-query';
import * as consultaService from '../services/consultaService';
import * as vacinaService from '../services/vacinaService';

export interface SaudeDoPet {
  /** true quando não há vacina vencida */
  emDia: boolean;
  /** rótulo curto para exibição */
  situacao: string;
  /** data da última consulta realizada, em ISO, ou null */
  ultimaConsulta: string | null;
}

/**
 * Resume a situação de saúde do pet a partir dos dados reais:
 * uma vacina com a próxima dose vencida coloca o pet em atenção.
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

      const vacinasVencidas = vacinas.filter(
        (v) => v.dataProximaDose != null && new Date(v.dataProximaDose) < hoje,
      );

      const realizadas = consultas
        .filter((c) => c.status === 'REALIZADA')
        .sort((a, b) => (a.dataHora < b.dataHora ? 1 : -1));

      return {
        emDia: vacinasVencidas.length === 0,
        situacao:
          vacinasVencidas.length === 0
            ? 'Saúde em dia!'
            : vacinasVencidas.length === 1
              ? '1 vacina atrasada'
              : `${vacinasVencidas.length} vacinas atrasadas`,
        ultimaConsulta: realizadas[0]?.dataHora ?? null,
      };
    },
  });
}
