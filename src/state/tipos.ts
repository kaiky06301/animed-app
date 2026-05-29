import type { AcaoPontuavel } from '../utils/nivel';

export type Especie = 'cao' | 'gato';
export type PlanoB2C = 'gratuito' | 'intermediario' | 'premium';

export interface Pet {
  nome: string;
  especie: Especie;
  raca: string;
  idade: string;
  peso: string;
  historicoSaude: string;
}

export interface EventoPontuacao {
  id: string;
  acao: AcaoPontuavel;
  rotulo: string;
  pontos: number;
  data: string;
}

export interface EstadoPersistido {
  pet: Pet | null;
  pontos: number;
  plano: PlanoB2C;
  historico: EventoPontuacao[];
  acoesContabilizadas: AcaoPontuavel[];
}
