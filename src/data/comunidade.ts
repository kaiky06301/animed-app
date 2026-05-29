export interface PostComunidade {
  id: string;
  autor: string;
  raca: string;
  emoji: string;
  texto: string;
  curtidas: number;
  comentarios: number;
}

export const POSTS_COMUNIDADE: PostComunidade[] = [
  {
    id: 'c1',
    autor: 'Marina',
    raca: 'Golden Retriever',
    emoji: '🦮',
    texto:
      'Dica pra dono de Golden: escovação 3x por semana ajuda muito no controle de pelo solto e dermatite. Meu Thor adora!',
    curtidas: 32,
    comentarios: 8,
  },
  {
    id: 'c2',
    autor: 'Rafael',
    raca: 'Shih Tzu',
    emoji: '🐶',
    texto:
      'Atenção, donos de Shih Tzu: olho lacrimejante NÃO é normal. Levei a Mel no vet e era infecção. Cuidado com o lacrimejamento excessivo.',
    curtidas: 21,
    comentarios: 12,
  },
  {
    id: 'c3',
    autor: 'Beatriz',
    raca: 'SRD',
    emoji: '🐕',
    texto:
      'Adotem vira-latas! Adotei minha Nina há 2 anos e ela é a coisa mais saudável. SRD geralmente é mais resistente que raça pura.',
    curtidas: 87,
    comentarios: 24,
  },
  {
    id: 'c4',
    autor: 'Lucas',
    raca: 'Persa',
    emoji: '🐱',
    texto:
      'Donos de Persa, atenção pro calor! Eles sofrem demais no verão. Mantenham água gelada sempre e evitem sol direto.',
    curtidas: 18,
    comentarios: 5,
  },
  {
    id: 'c5',
    autor: 'Camila',
    raca: 'Bulldog Francês',
    emoji: '🐶',
    texto:
      'Bulldogs Franceses NÃO podem fazer exercício pesado no calor. Risco de problema respiratório sério. Foco em passeios curtos cedo de manhã.',
    curtidas: 41,
    comentarios: 9,
  },
];
