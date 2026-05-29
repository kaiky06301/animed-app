import type { NavigatorScreenParams } from '@react-navigation/native';

export type AbasParamList = {
  Inicio: undefined;
  Cuidados: undefined;
  Comunidade: undefined;
  Recompensas: undefined;
  Perfil: undefined;
};

export type RaizParamList = {
  Abas: NavigatorScreenParams<AbasParamList>;
  CadastroPet: undefined;
  Planos: undefined;
  Historico: undefined;
};
