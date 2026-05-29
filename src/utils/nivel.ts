export type CodigoNivel = 'basico' | 'cuidador' | 'premium';

export interface Nivel {
  codigo: CodigoNivel;
  nome: string;
  emoji: string;
  minimo: number;
  maximo: number;
  descontoPercentual: number;
  cor: string;
}

export const NIVEIS: Nivel[] = [
  {
    codigo: 'basico',
    nome: 'Básico',
    emoji: '🥉',
    minimo: 0,
    maximo: 99,
    descontoPercentual: 0,
    cor: '#CD7F32',
  },
  {
    codigo: 'cuidador',
    nome: 'Cuidador',
    emoji: '🥈',
    minimo: 100,
    maximo: 499,
    descontoPercentual: 5,
    cor: '#C0C0C0',
  },
  {
    codigo: 'premium',
    nome: 'Tutor Premium',
    emoji: '🥇',
    minimo: 500,
    maximo: Infinity,
    descontoPercentual: 15,
    cor: '#FFC857',
  },
];

export function nivelPorPontos(pontos: number): Nivel {
  return NIVEIS.find((n) => pontos >= n.minimo && pontos <= n.maximo) ?? NIVEIS[0];
}

export function proximoNivel(pontos: number): Nivel | null {
  const atual = nivelPorPontos(pontos);
  const idx = NIVEIS.findIndex((n) => n.codigo === atual.codigo);
  return idx < NIVEIS.length - 1 ? NIVEIS[idx + 1] : null;
}

export function progressoNivel(pontos: number): number {
  const atual = nivelPorPontos(pontos);
  const proximo = proximoNivel(pontos);
  if (!proximo) return 1;
  const total = proximo.minimo - atual.minimo;
  const feito = pontos - atual.minimo;
  return Math.max(0, Math.min(1, feito / total));
}

export function aplicarDesconto(valor: number, pontos: number): number {
  const nivel = nivelPorPontos(pontos);
  return valor - valor * (nivel.descontoPercentual / 100);
}

export const PONTOS = {
  cadastroPet: 50,
  raca: 10,
  idade: 10,
  peso: 10,
  historicoSaude: 20,
  perfilCompleto: 50,

  atualizarPeso: 5,
  registrarVacina: 25,
  registrarMedicacao: 15,
  registrarConsulta: 20,

  checkupRealizado: 30,
  agendamento: 10,
  usoDiario: 1,

  compraParceiro: 20,
  checkinParceiro: 5,
} as const;

export type AcaoPontuavel = keyof typeof PONTOS;

export const ROTULOS_ACOES: Record<AcaoPontuavel, string> = {
  cadastroPet: 'Cadastrou o pet',
  raca: 'Informou a raça',
  idade: 'Informou a idade',
  peso: 'Informou o peso',
  historicoSaude: 'Adicionou histórico de saúde',
  perfilCompleto: 'Perfil completo (bônus)',
  atualizarPeso: 'Atualizou o peso',
  registrarVacina: 'Registrou vacinação',
  registrarMedicacao: 'Registrou medicação',
  registrarConsulta: 'Registrou consulta',
  checkupRealizado: 'Check-up realizado',
  agendamento: 'Agendou uma consulta',
  usoDiario: 'Usou o app hoje',
  compraParceiro: 'Comprou em pet shop parceiro',
  checkinParceiro: 'Check-in em parceiro',
};
