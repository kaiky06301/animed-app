import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Pet } from '../services/tipos';

export type AbasParamList = {
  Inicio: undefined;
  Pets: undefined;
  Cuidados: undefined;
  Atendimentos: undefined;
  Recompensas: undefined;
  Perfil: undefined;
};

export type AbasDoutorParamList = {
  AgendaDoutor: undefined;
  Pacientes: undefined;
  PerfilDoutor: undefined;
};

export type RaizParamList = {
  // Fluxo público
  Login: undefined;
  CriarConta: undefined;

  // Fluxo autenticado do tutor
  Abas: NavigatorScreenParams<AbasParamList>;

  // Fluxo autenticado do veterinário
  AbasDoutor: NavigatorScreenParams<AbasDoutorParamList>;
  FichaPaciente: { idPet: number; nomePet: string; especie?: string };
  MeusPets: undefined;
  FormPet: { pet?: Pet };
  Vacinas: { idPet: number; nomePet: string };
  CadastroPet: undefined;
  Planos: undefined;
  Historico: undefined;
};
