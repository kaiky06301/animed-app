import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../components/Botao';
import { CampoData } from '../components/CampoData';
import { CampoTexto } from '../components/CampoTexto';
import { Cartao } from '../components/Cartao';
import { mensagemDoErro } from '../api/cliente';
import {
  useAtualizarVacina,
  useCriarVacina,
  useExcluirVacina,
  useVacinas,
} from '../hooks/useVacinas';
import type { RaizParamList } from '../navigation/tipos';
import type { Vacina } from '../services/tipos';
import { isoParaBr as formatarData } from '../utils/data';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

type Props = NativeStackScreenProps<RaizParamList, 'Vacinas'>;

const HOJE = new Date().toISOString().slice(0, 10);

export function VacinasScreen({ route }: Props) {
  const { idPet, nomePet } = route.params;

  const { data: vacinas, isLoading, isRefetching, refetch, isError, error } = useVacinas(idPet);
  const criar = useCriarVacina();
  const atualizar = useAtualizarVacina();
  const excluir = useExcluirVacina();

  const [formularioAberto, setFormularioAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Vacina | null>(null);
  const [nomeVacina, setNomeVacina] = useState('');
  const [dataAplicacao, setDataAplicacao] = useState(HOJE);
  const [proximaDose, setProximaDose] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [erros, setErros] = useState<{ nome?: string; data?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvando = criar.isPending || atualizar.isPending;

  function limpar() {
    setEmEdicao(null);
    setNomeVacina('');
    setDataAplicacao(HOJE);
    setProximaDose('');
    setVeterinario('');
    setErros({});
    setErroGeral(null);
  }

  function abrirNovo() {
    limpar();
    setFormularioAberto(true);
  }

  function abrirEdicao(vacina: Vacina) {
    setEmEdicao(vacina);
    setNomeVacina(vacina.nomeVacina);
    setDataAplicacao(vacina.dataAplicacao);
    setProximaDose(vacina.dataProximaDose ?? '');
    setVeterinario(vacina.veterinarioResponsavel ?? '');
    setErros({});
    setErroGeral(null);
    setFormularioAberto(true);
  }

  function validar(): boolean {
    const novos: typeof erros = {};
    if (!nomeVacina.trim()) novos.nome = 'Informe o nome da vacina';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataAplicacao)) {
      novos.data = 'Informe uma data válida no formato DD/MM/AAAA';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function salvar() {
    setErroGeral(null);
    if (!validar()) return;

    const dados = {
      nomeVacina: nomeVacina.trim(),
      dataAplicacao,
      dataProximaDose: proximaDose.trim() || null,
      veterinarioResponsavel: veterinario.trim() || null,
      idPet,
    };

    try {
      if (emEdicao) {
        await atualizar.mutateAsync({ id: emEdicao.id, vacina: dados });
      } else {
        await criar.mutateAsync(dados);
      }
      setFormularioAberto(false);
      limpar();
    } catch (e) {
      setErroGeral(mensagemDoErro(e, 'Não foi possível salvar a vacina'));
    }
  }

  function confirmarExclusao(vacina: Vacina) {
    const remover = async () => {
      try {
        await excluir.mutateAsync(vacina.id);
      } catch (e) {
        const msg = mensagemDoErro(e);
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Não foi possível excluir', msg);
      }
    };

    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`Excluir o registro da vacina ${vacina.nomeVacina}?`)) void remover();
      return;
    }

    Alert.alert('Excluir vacina', `Excluir o registro da vacina ${vacina.nomeVacina}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: remover },
    ]);
  }

  if (isLoading) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={cores.primaria} size="large" />
        <Text style={estilos.textoSuave}>Carregando vacinas…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={estilos.centro}>
        <Ionicons name="cloud-offline-outline" size={40} color={cores.textoSuave} />
        <Text style={estilos.erroTitulo}>Não foi possível carregar</Text>
        <Text style={estilos.textoSuave}>{mensagemDoErro(error)}</Text>
        <Botao titulo="Tentar de novo" variante="contorno" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={estilos.fundo}>
      <FlatList
        data={vacinas}
        keyExtractor={(v) => String(v.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={cores.primaria} />
        }
        ListHeaderComponent={
          <View>
            <Text style={estilos.titulo}>Carteira de vacinas</Text>
            <Text style={estilos.subtitulo}>{nomePet}</Text>

            {formularioAberto && (
              <Cartao style={estilos.formulario}>
                <Text style={estilos.formularioTitulo}>
                  {emEdicao ? 'Editar registro' : 'Nova vacina'}
                </Text>

                <CampoTexto
                  rotulo="Vacina"
                  placeholder="Ex: V10, Antirrábica"
                  value={nomeVacina}
                  onChangeText={setNomeVacina}
                  erro={erros.nome}
                />
                <CampoData
                  rotulo="Data de aplicação"
                  icone="medkit-outline"
                  valor={dataAplicacao}
                  onChange={setDataAplicacao}
                  erro={erros.data}
                  bloquearFuturo
                />
                <CampoData
                  rotulo="Próxima dose (opcional)"
                  icone="alarm-outline"
                  valor={proximaDose}
                  onChange={setProximaDose}
                />
                <CampoTexto
                  rotulo="Veterinário (opcional)"
                  placeholder="Quem aplicou"
                  value={veterinario}
                  onChangeText={setVeterinario}
                />

                {!!erroGeral && (
                  <View style={estilos.avisoErro}>
                    <Text style={estilos.avisoErroTexto}>{erroGeral}</Text>
                  </View>
                )}

                <Botao
                  titulo={emEdicao ? 'Salvar alterações' : 'Registrar vacina'}
                  onPress={salvar}
                  carregando={salvando}
                />
                <Botao
                  titulo="Cancelar"
                  variante="sutil"
                  onPress={() => {
                    setFormularioAberto(false);
                    limpar();
                  }}
                  estilo={{ marginTop: espacamentos.sm }}
                />
              </Cartao>
            )}
          </View>
        }
        ListEmptyComponent={
          !formularioAberto ? (
            <Cartao style={estilos.vazio}>
              <Ionicons name="medkit-outline" size={36} color={cores.primaria} />
              <Text style={estilos.vazioTitulo}>Nenhuma vacina registrada</Text>
              <Text style={estilos.textoSuave}>
                Registre as vacinas para acompanhar os prazos e ganhar pontos.
              </Text>
            </Cartao>
          ) : null
        }
        renderItem={({ item }) => (
          <Cartao style={estilos.item}>
            <View style={estilos.itemTopo}>
              <View style={estilos.itemInfo}>
                <Text style={estilos.itemNome}>{item.nomeVacina}</Text>
                <Text style={estilos.textoSuave}>
                  Aplicada em {formatarData(item.dataAplicacao)}
                  {item.dataProximaDose
                    ? ` · próxima em ${formatarData(item.dataProximaDose)}`
                    : ''}
                </Text>
                {!!item.veterinarioResponsavel && (
                  <Text style={estilos.textoSuave}>{item.veterinarioResponsavel}</Text>
                )}
              </View>
            </View>

            <View style={estilos.acoes}>
              <Pressable style={estilos.acao} onPress={() => abrirEdicao(item)}>
                <Ionicons name="create-outline" size={16} color={cores.textoSecundario} />
                <Text style={estilos.acaoTexto}>Editar</Text>
              </Pressable>
              <Pressable style={estilos.acao} onPress={() => confirmarExclusao(item)}>
                <Ionicons name="trash-outline" size={16} color={cores.erro} />
                <Text style={[estilos.acaoTexto, { color: cores.erro }]}>Excluir</Text>
              </Pressable>
            </View>
          </Cartao>
        )}
      />

      {!formularioAberto && (
        <View style={estilos.rodape}>
          <Botao titulo="Registrar vacina" onPress={abrirNovo} />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  centro: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamentos.lg,
    gap: espacamentos.sm,
  },
  lista: {
    padding: espacamentos.md,
    paddingBottom: espacamentos.xxl * 2,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  subtitulo: {
    ...tipografia.corpo,
    color: cores.primaria,
    marginBottom: espacamentos.md,
  },
  erroTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  textoSuave: { ...tipografia.legenda, color: cores.textoSecundario, textAlign: 'center' },
  formulario: { marginBottom: espacamentos.md },
  formularioTitulo: {
    ...tipografia.subtitulo,
    color: cores.textoPrincipal,
    marginBottom: espacamentos.md,
  },
  item: { marginBottom: espacamentos.sm, padding: 0, overflow: 'hidden' },
  itemTopo: { padding: espacamentos.md },
  itemInfo: { gap: 2 },
  itemNome: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  acoes: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: cores.borda },
  acao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamentos.xs,
    paddingVertical: espacamentos.sm + 2,
  },
  acaoTexto: { ...tipografia.legenda, color: cores.textoSecundario },
  vazio: { alignItems: 'center', gap: espacamentos.xs, paddingVertical: espacamentos.lg },
  vazioTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  avisoErro: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.md,
  },
  avisoErroTexto: { ...tipografia.corpo, color: cores.erro },
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: espacamentos.md,
    backgroundColor: cores.fundo,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
});
