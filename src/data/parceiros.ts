export interface Produto {
  id: string;
  nome: string;
  marca: string;
  /** Agrupa o produto nos filtros da tela de recompensas. */
  categoria: Categoria;
  descricao: string;
  preco: number;
  emoji: string;
}

export type Categoria = 'Alimentação' | 'Saúde' | 'Casa' | 'Diversão';

export const CATEGORIAS: { rotulo: Categoria | 'Todos'; icone: string }[] = [
  { rotulo: 'Todos', icone: 'grid' },
  { rotulo: 'Alimentação', icone: 'nutrition' },
  { rotulo: 'Saúde', icone: 'medkit' },
  { rotulo: 'Casa', icone: 'home' },
  { rotulo: 'Diversão', icone: 'tennisball' },
];

export const PRODUTOS_PARCEIROS: Produto[] = [
  {
    id: 'p1',
    nome: 'Ração Premium Adulto 15kg',
    marca: 'PetVida',
    categoria: 'Alimentação',
    descricao: 'Alimento completo para cães adultos de todas as raças.',
    preco: 219.9,
    emoji: '🍖',
  },
  {
    id: 'p2',
    nome: 'Antipulgas Mensal',
    marca: 'CãoSeguro',
    categoria: 'Saúde',
    descricao: 'Proteção contra pulgas e carrapatos por 30 dias.',
    preco: 89.9,
    emoji: '💊',
  },
  {
    id: 'p3',
    nome: 'Caminha Ortopédica G',
    marca: 'SoftPet',
    categoria: 'Casa',
    descricao: 'Espuma que alivia as articulações de pets idosos.',
    preco: 159.0,
    emoji: '🛏️',
  },
  {
    id: 'p4',
    nome: 'Brinquedo Mordedor Reforçado',
    marca: 'PetFun',
    categoria: 'Diversão',
    descricao: 'Estimula a brincadeira e ajuda a limpar os dentes.',
    preco: 49.9,
    emoji: '🦴',
  },
  {
    id: 'p5',
    nome: 'Shampoo Hipoalergênico 500ml',
    marca: 'CleanDog',
    categoria: 'Saúde',
    descricao: 'Limpeza e cuidado para peles sensíveis.',
    preco: 39.9,
    emoji: '🧴',
  },
  {
    id: 'p6',
    nome: 'Coleira Refletiva Ajustável',
    marca: 'WalkPro',
    categoria: 'Diversão',
    descricao: 'Passeios noturnos mais seguros, com ajuste rápido.',
    preco: 59.9,
    emoji: '🦮',
  },
  {
    id: 'p7',
    nome: 'Areia Sanitária 12kg',
    marca: 'GataLimpa',
    categoria: 'Casa',
    descricao: 'Alta absorção e controle de odor para gatos.',
    preco: 34.9,
    emoji: '🐱',
  },
  {
    id: 'p8',
    nome: 'Petisco Natural 200g',
    marca: 'NatPet',
    categoria: 'Alimentação',
    descricao: 'Sem corantes nem conservantes, feito de carne desidratada.',
    preco: 24.9,
    emoji: '🥩',
  },
];
