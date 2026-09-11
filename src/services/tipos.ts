/** Contratos de dados trocados com a API. */

export type Perfil = 'TUTOR' | 'DOUTOR';

export interface RespostaAutenticacao {
  token: string;
  tipo: string;
  expiraEmMs: number;
  idUsuario: number;
  idTutor: number | null;
  nome: string;
  email: string;
  role: Perfil;
}

export type SexoPet = 'MACHO' | 'FEMEA';

export interface Pet {
  id: number;
  nome: string;
  especie: string;
  sexo: SexoPet | null;
  raca: string | null;
  dataNascimento: string | null;
  idadeAnos: number | null;
  pesoKg: number | null;
  castrado: boolean;
  observacoesSaude: string | null;
  idTutor: number;
  nomeTutor: string;
}

export interface PetRequisicao {
  nome: string;
  especie: string;
  sexo?: SexoPet | null;
  raca?: string | null;
  dataNascimento?: string | null;
  pesoKg?: number | null;
  castrado?: boolean;
  observacoesSaude?: string | null;
  idTutor: number;
}

export interface Vacina {
  id: number;
  nomeVacina: string;
  dataAplicacao: string;
  dataProximaDose: string | null;
  veterinarioResponsavel: string | null;
  clinica: string | null;
  lote: string | null;
  observacoes: string | null;
  idPet: number;
  nomePet: string;
}

export interface VacinaRequisicao {
  nomeVacina: string;
  dataAplicacao: string;
  dataProximaDose?: string | null;
  veterinarioResponsavel?: string | null;
  clinica?: string | null;
  lote?: string | null;
  observacoes?: string | null;
  idPet: number;
}

/** Envelope de paginação devolvido pelo Spring Data. */
export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface Consulta {
  id: number;
  dataHora: string;
  motivo: string;
  diagnostico: string | null;
  status: 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'NAO_COMPARECEU';
  veterinario: string | null;
  idPet: number;
  nomePet: string;
}

export interface Tutor {
  id: number;
  nome: string;
  email: string;
  pontosTotais: number;
  moedas: number;
  podeGastarMoedas: boolean;
  nivel: 'BASICO' | 'CUIDADOR' | 'TUTOR_PREMIUM';
  nivelDescricao: string;
  descontoPercentual: number;
  plano: string;
}

export type TipoCuidado =
  | 'MEDICACAO'
  | 'VERMIFUGACAO'
  | 'PESAGEM'
  | 'AGENDAMENTO'
  | 'CHECKUP';

export interface CuidadoRegistrado {
  tipo: TipoCuidado;
  descricao: string;
  pontosGanhos: number;
  pontosTotais: number;
  moedas: number;
}

export interface DisponibilidadeAgenda {
  data: string;
  atende: boolean;
  veterinario: string;
  observacao: string;
  horarios: string[];
  duracaoMinutos: number;
  clinica: string;
  endereco: string;
}

export interface Atendimento {
  idConsulta: number;
  horario: string;
  idPet: number;
  nomePet: string;
  nomeTutor: string;
  motivo: string;
  status: 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'NAO_COMPARECEU';
}

export interface AtendimentoConcluido {
  atendimento: Atendimento;
  retorno: string | null;
  pontosCreditados: number;
}

export interface DetalheAtendimento {
  idConsulta: number;
  dataHora: string;
  motivo: string;
  status: 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'NAO_COMPARECEU';
  veterinario: string | null;
  clinica: string;
  endereco: string;
  duracaoMinutos: number;
  idPet: number;
  nomePet: string;
  diagnostico: string | null;
  prescricao: string | null;
  /** Instrução escrita pelo veterinário, quando há. */
  orientacao: string | null;
}

export interface AtendimentoCancelado {
  idConsulta: number;
  dataHora: string;
  motivo: string;
  pontosEstornados: number;
}

export interface AgendaDoDia {
  data: string;
  veterinario: string;
  horariosLivres: number;
  atendimentos: Atendimento[];
}

export interface DiaDoMes {
  data: string;
  disponivel: boolean;
  horariosLivres: number;
}

export interface MesDaAgenda {
  ano: number;
  mes: number;
  dias: DiaDoMes[];
}

export interface AgendamentoConfirmado {
  idConsulta: number;
  dataHora: string;
  motivo: string;
  veterinario: string;
  pontosGanhos: number;
}
