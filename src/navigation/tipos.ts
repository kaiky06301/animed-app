import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Pet } from '../services/tipos';

export type AbasParamList = {
  Inicio: undefined;
  Pets: undefined;
  Cuidados: undefined;
  Comunidade: undefined;
  Recompensas: undefined;
  Perfil: undefined;
};

export type RaizParamList = {
  // Fluxo público
  Login: undefined;
  CriarConta: undefined;

  // Fluxo autenticado
  Abas: NavigatorScreenParams<AbasParamList>;
  MeusPets: undefined;
  FormPet: { pet?: Pet };
  Vacinas: { idPet: number; nomePet: string };
  CadastroPet: undefined;
  Planos: undefined;
  Historico: undefined;
};
