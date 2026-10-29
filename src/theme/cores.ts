/** Paleta usada quando o app está no tema escuro. */
export const coresEscuras = {
  fundo: '#0F1419',
  fundoElevado: '#171D24',
  superficie: '#1B2330',
  superficieAlt: '#222B3A',
  borda: 'rgba(255,255,255,0.08)',

  textoPrincipal: '#F4F6F7',
  textoSecundario: '#9AAAB5',
  textoSuave: '#6B7A85',

  primaria: '#22D3A0',
  primariaForte: '#15B286',
  primariaSuave: 'rgba(34, 211, 160, 0.15)',

  laranja: '#FF8A3D',
  laranjaSuave: 'rgba(255, 138, 61, 0.15)',

  /** Traço das ilustrações de estado vazio */
  azulSuave: '#8FB4D9',

  dourado: '#FFC857',
  douradoSuave: 'rgba(255, 200, 87, 0.18)',

  bronze: '#CD7F32',
  prata: '#C0C0C0',

  erro: '#FF6B6B',
  sucesso: '#22D3A0',
  alerta: '#FFB454',

  overlay: 'rgba(0,0,0,0.55)',
};

export type Paleta = typeof coresEscuras;

/** Paleta usada quando o app está no tema claro. Tons mais fechados para dar contraste no fundo branco. */
export const coresClaras: Paleta = {
  fundo: '#F4F6F8',
  fundoElevado: '#FFFFFF',
  superficie: '#FFFFFF',
  superficieAlt: '#E9EEF2',
  borda: 'rgba(15,20,25,0.10)',

  textoPrincipal: '#0F1419',
  textoSecundario: '#4A5A66',
  textoSuave: '#7A8994',

  primaria: '#0E9F78',
  primariaForte: '#0B8463',
  primariaSuave: 'rgba(14, 159, 120, 0.12)',

  laranja: '#E8691C',
  laranjaSuave: 'rgba(232, 105, 28, 0.12)',

  azulSuave: '#5B85B0',

  dourado: '#C98A00',
  douradoSuave: 'rgba(201, 138, 0, 0.15)',

  bronze: '#A9652A',
  prata: '#8A8F94',

  erro: '#D64545',
  sucesso: '#0E9F78',
  alerta: '#C77A00',

  overlay: 'rgba(15,20,25,0.45)',
};

export const espacamentos = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const raios = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const tipografia = {
  titulo: { fontSize: 24, fontWeight: '700' as const },
  subtitulo: { fontSize: 18, fontWeight: '600' as const },
  corpo: { fontSize: 14, fontWeight: '400' as const },
  legenda: { fontSize: 12, fontWeight: '500' as const },
};
