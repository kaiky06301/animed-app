import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../components/Botao';
import { Cartao } from '../../components/Cartao';
import { usePacientes } from '../../hooks/usePacientes';
import { useAuth } from '../../state/AuthContext';
import { cores, espacamentos, raios, tipografia } from '../../theme/cores';

/** Perfil do veterinário, com um resumo da carteira de pacientes. */
export function PerfilDoutorScreen() {
  const { usuario, sair } = useAuth();
  const { data: pacientes } = usePacientes();

  const total = pacientes?.length ?? 0;
  const cachorros = pacientes?.filter((p) => p.especie === 'CACHORRO').length ?? 0;
  const gatos = pacientes?.filter((p) => p.especie === 'GATO').length ?? 0;

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Perfil</Text>

      <Cartao realce style={estilos.cartaoPrincipal}>
        <View style={estilos.avatar}>
          <Ionicons name="medkit" size={30} color={cores.primaria} />
        </View>
        <Text style={estilos.nome}>{usuario?.nome}</Text>
        <Text style={estilos.papel}>Médico veterinário</Text>
      </Cartao>

      <View style={estilos.grade}>
        <Indicador valor={String(total)} rotulo="Pacientes" />
        <Indicador valor={String(cachorros)} rotulo="Cachorros" />
        <Indicador valor={String(gatos)} rotulo="Gatos" />
      </View>

      <Cartao>
        <Text style={estilos.secao}>O que você pode fazer</Text>
        <Linha icone="medkit-outline" texto="Registrar vacinas aplicadas nos pacientes" />
        <Linha icone="trophy-outline" texto="Cada registro credita pontos ao tutor" />
        <Linha icone="people-outline" texto="Consultar a carteira de pacientes da clínica" />
      </Cartao>

      <Cartao>
        <Text style={estilos.secao}>Sessão</Text>
        <Text style={estilos.email}>{usuario?.email}</Text>
        <Botao
          titulo="Sair da conta"
          variante="contorno"
          onPress={sair}
          estilo={{ marginTop: espacamentos.md }}
        />
      </Cartao>
    </ScrollView>
  );
}

function Indicador({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <Cartao style={estilos.indicador}>
      <Text style={estilos.indicadorValor}>{valor}</Text>
      <Text style={estilos.indicadorRotulo}>{rotulo}</Text>
    </Cartao>
  );
}

function Linha({ icone, texto }: { icone: keyof typeof Ionicons.glyphMap; texto: string }) {
  return (
    <View style={estilos.linha}>
      <Ionicons name={icone} size={17} color={cores.primaria} />
      <Text style={estilos.linhaTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    padding: espacamentos.lg,
    paddingBottom: espacamentos.xxl * 2,
    gap: espacamentos.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  cartaoPrincipal: { alignItems: 'center', gap: 4 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: raios.pill,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { ...tipografia.subtitulo, color: cores.textoPrincipal, marginTop: 4 },
  papel: { ...tipografia.legenda, color: cores.primaria },
  grade: { flexDirection: 'row', gap: espacamentos.sm },
  indicador: { flex: 1, alignItems: 'center', padding: espacamentos.sm },
  indicadorValor: { color: cores.textoPrincipal, fontSize: 20, fontWeight: '800' },
  indicadorRotulo: { color: cores.textoSecundario, fontSize: 11, marginTop: 2 },
  secao: {
    ...tipografia.subtitulo,
    color: cores.textoPrincipal,
    fontSize: 15,
    marginBottom: espacamentos.sm,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm, paddingVertical: 5 },
  linhaTexto: { flex: 1, color: cores.textoSecundario, fontSize: 13 },
  email: { color: cores.textoSecundario, fontSize: 13 },
});
