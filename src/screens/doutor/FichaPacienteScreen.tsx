import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { mensagemDoErro } from '../../api/cliente';
import { Botao } from '../../components/Botao';
import { CampoData } from '../../components/CampoData';
import { CampoSugestao } from '../../components/CampoSugestao';
import { CampoTexto } from '../../components/CampoTexto';
import { Cartao } from '../../components/Cartao';
import {
  useAtualizarVacina,
  useCriarVacina,
  useExcluirVacina,
  useVacinas,
} from '../../hooks/useVacinas';
import type { RaizParamList } from '../../navigation/tipos';
import type { Vacina } from '../../services/tipos';
import { vacinasSugeridas } from '../../data/vacinas';
import { useAuth } from '../../state/AuthContext';
import { isoParaBr } from '../../utils/data';
import { cores, espacamentos, raios, tipografia } from '../../theme/cores';

type Props = NativeStackScreenProps<RaizParamList, 'FichaPaciente'>;

const HOJE = new Date().toISOString().slice(0, 10);

/**
 * Ficha clínica do paciente.
 *
 * É aqui que o veterinário registra as vacinas aplicadas — o que credita
 * os pontos de cuidado ao tutor do pet.
 */
export function FichaPacienteScreen({ route }: Props) {
  const { idPet, nomePet, especie } = route.params;
  const { usuario } = useAuth();

  const { data: vacinas, isLoading, isRefetching, refetch, isError, error } = useVacinas(idPet);
  const criar = useCriarVacina();
  const atualizar = useAtualizarVacina();
  const excluir = useExcluirVacina();

  const [formularioAberto, setFormularioAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Vacina | null>(null);
  const [nomeVacina, setNomeVacina] = useState('');
  const [dataAplicacao, setDataAplicacao] = useState(HOJE);
  const [proximaDose, setProximaDose] = useState('');
  const [lote, setLote] = useState('');
  const [erros, setErros] = useState<{ nome?: string; data?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [pontosCreditados, setPontosCreditados] = useState(false);

  const salvando = criar.isPending || atualizar.isPending;

  function limpar() {
    setEmEdicao(null);
    setNomeVacina('');
    setDataAplicacao(HOJE);
    setProximaDose('');
    setLote('');
    setErros({});
    setErroGeral(null);
  }

  function abrirNovo() {
    limpar();
    setPontosCreditados(false);
    setFormularioAberto(true);
  }

  function abrirEdicao(vacina: Vacina) {
    setEmEdicao(vacina);
    setNomeVacina(vacina.nomeVacina);
    setDataAplicacao(vacina.dataAplicacao);
    setProximaDose(vacina.dataProximaDose ?? '');
    setLote(vacina.lote ?? '');
    setErros({});
    setErroGeral(null);
    setFormularioAberto(true);
  }

  function validar(): boolean {
    const novos: typeof erros = {};
    if (!nomeVacina.trim()) novos.nome = 'Informe a vacina aplicada';
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
      dataProximaDose: proximaDose || null,
      // O responsável é o próprio veterinário autenticado
      veterinarioResponsavel: usuario?.nome ?? usuario?.email ?? null,
      lote: lote.trim() || null,
      idPet,
    };

    try {
      if (emEdicao) {
        await atualizar.mutateAsync({ id: emEdicao.id, vacina: dados });
        setPontosCreditados(false);
      } else {
        await criar.mutateAsync(dados);
        setPontosCreditados(true);
      }
      setFormularioAberto(false);
      limpar();
    } catch (e) {
      setErroGeral(mensagemDoErro(e, 'Não foi possível salvar o registro'));
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

    const pergunta = `Excluir o registro da vacina ${vacina.nomeVacina}?`;

    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(pergunta)) void remover();
      return;
    }

    Alert.alert('Excluir registro', pergunta, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: remover },
    ]);
  }

  if (isLoading) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={estilos.textoSuave}>Carregando ficha…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={estilos.centro}>
        <Ionicons name="cloud-offline-outline" size={40} color={cores.textoSuave} />
        <Text style={estilos.tituloErro}>Não foi possível carregar</Text>
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
            <Text style={estilos.titulo}>Ficha clínica</Text>
            <Text style={estilos.subtitulo}>{nomePet}</Text>

            {pontosCreditados && !formularioAberto && (
              <View style={estilos.aviso}>
                <Ionicons name="checkmark-circle" size={18} color={cores.primaria} />
                <Text style={estilos.avisoTexto}>
                  Registro salvo. Os pontos foram creditados ao tutor.
                </Text>
              </View>
            )}

            {formularioAberto && (
              <Cartao style={estilos.formulario}>
                <Text style={estilos.formularioTitulo}>
                  {emEdicao ? 'Editar registro' : 'Registrar vacina aplicada'}
                </Text>

                <CampoSugestao
                  rotulo="Vacina"
                  iconeRotulo="medkit-outline"
                  icone="medkit-outline"
                  placeholder="Ex: V10, Antirrábica"
                  valor={nomeVacina}
                  onChange={setNomeVacina}
                  sugestoes={vacinasSugeridas(especie)}
                  dica={
                    especie === 'GATO'
                      ? 'Vacinas comuns em gatos'
                      : especie === 'CACHORRO'
                        ? 'Vacinas comuns em cães'
                        : 'Vacinas mais aplicadas'
                  }
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
                  rotulo="Lote (opcional)"
                  iconeRotulo="barcode-outline"
                  icone="barcode-outline"
                  placeholder="Número do lote"
                  value={lote}
                  onChangeText={setLote}
                />

                {!!erroGeral && (
                  <View style={estilos.avisoErro}>
                    <Text style={estilos.avisoErroTexto}>{erroGeral}</Text>
                  </View>
                )}

                <Botao
                  titulo={emEdicao ? 'Salvar alterações' : 'Registrar aplicação'}
                  icone="save-outline"
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
              <Ionicons name="medkit-outline" size={34} color={cores.primaria} />
              <Text style={estilos.vazioTitulo}>Nenhuma vacina registrada</Text>
              <Text style={estilos.textoSuave}>
                Registre as aplicações para manter o histórico do paciente.
              </Text>
            </Cartao>
          ) : null
        }
        renderItem={({ item }) => (
          <Cartao style={estilos.item}>
            <View style={estilos.itemTopo}>
              <Text style={estilos.itemNome}>{item.nomeVacina}</Text>
              <Text style={estilos.textoSuaveEsq}>
                Aplicada em {isoParaBr(item.dataAplicacao)}
                {item.dataProximaDose ? ` · próxima em ${isoParaBr(item.dataProximaDose)}` : ''}
              </Text>
              {!!item.veterinarioResponsavel && (
                <Text style={estilos.textoSuaveEsq}>{item.veterinarioResponsavel}</Text>
              )}
              {!!item.lote && <Text style={estilos.textoSuaveEsq}>Lote {item.lote}</Text>}
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
          <Botao titulo="Registrar vacina" icone="add-circle-outline" onPress={abrirNovo} />
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
  subtitulo: { ...tipografia.corpo, color: cores.primaria, marginBottom: espacamentos.md },
  tituloErro: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  textoSuave: { ...tipografia.legenda, color: cores.textoSecundario, textAlign: 'center' },
  textoSuaveEsq: { ...tipografia.legenda, color: cores.textoSecundario },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.md,
  },
  avisoTexto: { flex: 1, color: cores.primaria, fontSize: 12, fontWeight: '600' },
  formulario: { marginBottom: espacamentos.md },
  formularioTitulo: {
    ...tipografia.subtitulo,
    color: cores.textoPrincipal,
    marginBottom: espacamentos.md,
  },
  item: { marginBottom: espacamentos.sm, padding: 0, overflow: 'hidden' },
  itemTopo: { padding: espacamentos.md, gap: 2 },
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
