import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../components/Botao';
import { Cartao } from '../../components/Cartao';
import { TrocarSenha } from '../../components/TrocarSenha';
import type { RaizParamList } from '../../navigation/tipos';
import { usePacientes } from '../../hooks/usePacientes';
import { useAuth } from '../../state/AuthContext';
import { cores, espacamentos, raios, tipografia } from '../../theme/cores';

/** Perfil do veterinário, com um resumo da carteira de pacientes. */
export function PerfilDoutorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RaizParamList>>();
  const { usuario, sair } = useAuth();
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [avisoSenha, setAvisoSenha] = useState<string | null>(null);
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
        <Linha icone="person-add-outline" texto="Cadastrar tutores e outros veterinários" />
      </Cartao>

      <Cartao>
        <Text style={estilos.secao}>Administração da clínica</Text>
        <Text style={estilos.explicacao}>
          Quem chega ao balcão é o tutor, e é a clínica que abre o acesso dele.
        </Text>

        <Botao
          titulo="Cadastrar tutor ou veterinário"
          variante="sutil"
          icone="person-add-outline"
          onPress={() => navigation.navigate('CadastrarPessoa')}
          estilo={{ marginTop: espacamentos.sm }}
        />
      </Cartao>

      <Cartao>
        <Text style={estilos.secao}>Sessão</Text>
        <Text style={estilos.email}>{usuario?.email}</Text>

        {!!avisoSenha && (
          <View style={estilos.aviso}>
            <Ionicons name="checkmark-circle" size={16} color={cores.primaria} />
            <Text style={estilos.avisoTexto}>{avisoSenha}</Text>
          </View>
        )}

        <Botao
          titulo="Trocar senha"
          variante="sutil"
          icone="key-outline"
          onPress={() => setTrocandoSenha(true)}
          estilo={{ marginTop: espacamentos.md }}
        />
        <Botao
          titulo="Sair da conta"
          variante="contorno"
          onPress={sair}
          estilo={{ marginTop: espacamentos.sm }}
        />
      </Cartao>

      <TrocarSenha
        visivel={trocandoSenha}
        onFechar={() => setTrocandoSenha(false)}
        onTrocada={setAvisoSenha}
      />
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
  explicacao: {
    fontSize: 12,
    color: cores.textoSecundario,
    lineHeight: 17,
    marginTop: 2,
  },
  secao: {
    ...tipografia.subtitulo,
    color: cores.textoPrincipal,
    fontSize: 15,
    marginBottom: espacamentos.sm,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm, paddingVertical: 5 },
  linhaTexto: { flex: 1, color: cores.textoSecundario, fontSize: 13 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm,
    marginTop: espacamentos.sm,
  },
  avisoTexto: { flex: 1, fontSize: 12, color: cores.textoPrincipal },
  email: { color: cores.textoSecundario, fontSize: 13 },
});
