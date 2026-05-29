export interface Produto {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  preco: number;
  emoji: string;
}

export const PRODUTOS_PARCEIROS: Produto[] = [
  { id: 'p1', nome: 'Ração Premium Adulto 15kg', marca: 'PetVida', categoria: 'Ração', preco: 219.9, emoji: '🍖' },
  { id: 'p2', nome: 'Antipulgas Mensal', marca: 'CãoSeguro', categoria: 'Saúde', preco: 89.9, emoji: '💊' },
  { id: 'p3', nome: 'Caminha Ortopédica G', marca: 'SoftPet', categoria: 'Casa', preco: 159.0, emoji: '🛏️' },
  { id: 'p4', nome: 'Brinquedo Mordedor Reforçado', marca: 'PetFun', categoria: 'Diversão', preco: 49.9, emoji: '🦴' },
  { id: 'p5', nome: 'Shampoo Hipoalergênico 500ml', marca: 'CleanDog', categoria: 'Higiene', preco: 39.9, emoji: '🧴' },
  { id: 'p6', nome: 'Coleira Refletiva Ajustável', marca: 'WalkPro', categoria: 'Passeio', preco: 59.9, emoji: '🦮' },
  { id: 'p7', nome: 'Areia Sanitária 12kg', marca: 'GataLimpa', categoria: 'Higiene', preco: 34.9, emoji: '🐱' },
  { id: 'p8', nome: 'Petisco Natural 200g', marca: 'NatPet', categoria: 'Petisco', preco: 24.9, emoji: '🥩' },
];
