/**
 * Vacinas mais aplicadas na rotina clínica brasileira, usadas como
 * sugestão no registro. A lista padroniza a escrita; o veterinário pode
 * registrar qualquer outra digitando livremente.
 */

export const VACINAS_CACHORRO = [
  'V8 (óctupla canina)',
  'V10 (múltipla canina)',
  'Antirrábica',
  'Giárdia',
  'Gripe canina (Bordetella)',
  'Leishmaniose',
] as const;

export const VACINAS_GATO = [
  'V3 (tríplice felina)',
  'V4 (quádrupla felina)',
  'V5 (quíntupla felina)',
  'Antirrábica',
  'Leucemia felina (FeLV)',
] as const;

/** Sugestões conforme a espécie do paciente. */
export function vacinasSugeridas(especie?: string | null): string[] {
  if (especie === 'GATO') return [...VACINAS_GATO];
  if (especie === 'CACHORRO') return [...VACINAS_CACHORRO];

  // Espécie desconhecida: oferece as duas listas, sem repetir
  return Array.from(new Set([...VACINAS_CACHORRO, ...VACINAS_GATO]));
}
