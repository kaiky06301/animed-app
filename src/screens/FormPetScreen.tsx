import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { mensagemDoErro } from '../api/cliente';
import { useAtualizarPet, useCriarPet } from '../hooks/usePets';
import type { RaizParamList } from '../navigation/tipos';
import { useAuth } from '../state/AuthContext';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

type Props = NativeStackScreenProps<RaizParamList, 'FormPet'>;

const ESPECIES = [
  { valor: 'CACHORRO', rotulo: 'Cachorro' },
  { valor: 'GATO', rotulo: 'Gato' },
] as const;

const SEXOS = [
  { valor: 'MACHO', rotulo: 'Macho' },
  { valor: 'FEMEA', rotulo: 'Fêmea' },
] as const;

export function FormPetScreen({ route, navigation }: Props) {
  const petEmEdicao = route.params?.pet;
  const editando = !!petEmEdicao;

  const { usuario } = useAuth();
  const criar = useCriarPet();
  const atualizar = useAtualizarPet();

  const [nome, setNome] = useState(petEmEdicao?.nome ?? '');
  const [especie, setEspecie] = useState<string>(petEmEdicao?.especie ?? 'CACHORRO');
  const [sexo, setSexo] = useState<string | null>(petEmEdicao?.sexo ?? null);
  const [raca, setRaca] = useState(petEmEdicao?.raca ?? '');
  const [dataNascimento, setDataNascimento] = useState(petEmEdicao?.dataNascimento ?? '');
  const [peso, setPeso] = useState(
    petEmEdicao?.pesoKg != null ? String(petEmEdicao.pesoKg) : '',
  );
  const [observacoes, setObservacoes] = useState(petEmEdicao?.observacoesSaude ?? '');

  const [erros, setErros] = useState<{ nome?: string; peso?: string; data?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const salvando = criar.isPending || atualizar.isPending;

  function validar(): boolean {
    const novos: typeof erros = {};
    if (!nome.trim()) novos.nome = 'Informe o nome do pet';
    if (peso && Number.isNaN(Number(peso.replace(',', '.')))) {
      novos.peso = 'Peso deve ser um número (ex: 8.5)';
    }
    if (dataNascimento && !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
      novos.data = 'Use o formato AAAA-MM-DD';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function salvar() {
    setErroGeral(null);
    if (!validar()) return;
    if (!usuario?.idTutor) {
      setErroGeral('Sua conta não está vinculada a um tutor.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      especie,
      sexo: (sexo as 'MACHO' | 'FEMEA' | null) ?? null,
      raca: raca.trim() || null,
      dataNascimento: dataNascimento.trim() || null,
      pesoKg: peso ? Number(peso.replace(',', '.')) : null,
      castrado: petEmEdicao?.castrado ?? false,
      observacoesSaude: observacoes.trim() || null,
      idTutor: usuario.idTutor,
    };

    try {
      if (editando) {
        await atualizar.mutateAsync({ id: petEmEdicao.id, pet: dados });
      } else {
        await criar.mutateAsync(dados);
      }
      navigation.goBack();
    } catch (e) {
      setErroGeral(mensagemDoErro(e, 'Não foi possível salvar o pet'));
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.fundo}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo}>{editando ? 'Editar pet' : 'Cadastrar pet'}</Text>
        <Text style={estilos.descricao}>
          {editando
            ? 'Atualize os dados do seu companheiro.'
            : 'Quanto mais completo o perfil, melhores os lembretes de cuidado.'}
        </Text>

        <View style={estilos.formulario}>
          <CampoTexto
            rotulo="Nome"
            placeholder="Como ele se chama?"
            value={nome}
            onChangeText={setNome}
            erro={erros.nome}
          />

          <Text style={estilos.rotulo}>Espécie</Text>
          <View style={estilos.opcoes}>
            {ESPECIES.map((opcao) => {
              const ativa = especie === opcao.valor;
              return (
                <Pressable
                  key={opcao.valor}
                  onPress={() => setEspecie(opcao.valor)}
                  style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
                >
                  <Text style={[estilos.opcaoTexto, ativa && estilos.opcaoTextoAtivo]}>
                    {opcao.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={estilos.rotulo}>Sexo</Text>
          <View style={estilos.opcoes}>
            {SEXOS.map((opcao) => {
              const ativa = sexo === opcao.valor;
              return (
                <Pressable
                  key={opcao.valor}
                  onPress={() => setSexo(ativa ? null : opcao.valor)}
                  style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
                >
                  <Text style={[estilos.opcaoTexto, ativa && estilos.opcaoTextoAtivo]}>
                    {opcao.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <CampoTexto
            rotulo="Raça"
            placeholder="Ex: Golden Retriever"
            value={raca}
            onChangeText={setRaca}
          />
          <CampoTexto
            rotulo="Data de nascimento"
            placeholder="AAAA-MM-DD"
            value={dataNascimento}
            onChangeText={setDataNascimento}
            erro={erros.data}
          />
          <CampoTexto
            rotulo="Peso (kg)"
            placeholder="Ex: 8.5"
            value={peso}
            onChangeText={setPeso}
            keyboardType="decimal-pad"
            erro={erros.peso}
          />
          <CampoTexto
            rotulo="Observações de saúde"
            placeholder="Alergias, tratamentos em curso…"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={3}
            style={estilos.multilinha}
          />

          {!!erroGeral && (
            <View style={estilos.avisoErro}>
              <Text style={estilos.avisoErroTexto}>{erroGeral}</Text>
            </View>
          )}

          <Botao
            titulo={editando ? 'Salvar alterações' : 'Cadastrar pet'}
            onPress={salvar}
            carregando={salvando}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    padding: espacamentos.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  descricao: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginTop: espacamentos.xs,
    marginBottom: espacamentos.lg,
  },
  formulario: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.lg,
  },
  rotulo: {
    ...tipografia.legenda,
    color: cores.textoSecundario,
    marginBottom: espacamentos.xs,
  },
  opcoes: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    marginBottom: espacamentos.md,
  },
  opcao: {
    flex: 1,
    paddingVertical: espacamentos.sm + 2,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
  },
  opcaoAtiva: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
  },
  opcaoTexto: { ...tipografia.corpo, color: cores.textoSecundario },
  opcaoTextoAtivo: { color: cores.primaria, fontWeight: '600' },
  multilinha: { minHeight: 80, textAlignVertical: 'top' },
  avisoErro: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.md,
  },
  avisoErroTexto: { ...tipografia.corpo, color: cores.erro },
});
