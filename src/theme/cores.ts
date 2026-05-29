export const cores = {
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

  dourado: '#FFC857',
  douradoSuave: 'rgba(255, 200, 87, 0.18)',

  bronze: '#CD7F32',
  prata: '#C0C0C0',

  erro: '#FF6B6B',
  sucesso: '#22D3A0',
  alerta: '#FFB454',

  overlay: 'rgba(0,0,0,0.55)',
} as const;

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
