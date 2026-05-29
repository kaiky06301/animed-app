import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { useAnimed } from '../state/AnimedContext';
import type { Especie } from '../state/tipos';
import { cores, espacamentos, raios } from '../theme/cores';
import type { RaizParamList } from '../navigation/tipos';

type Props = NativeStackScreenProps<RaizParamList, 'CadastroPet'>;

export function CadastroPetScreen({ navigation }: Props) {
  const { salvarPet, registrarAcao, pet } = useAnimed();

  const [nome, setNome] = useState(pet?.nome ?? '');
  const [especie, setEspecie] = useState<Especie>(pet?.especie ?? 'cao');
  const [raca, setRaca] = useState(pet?.raca ?? '');
  const [idade, setIdade] = useState(pet?.idade ?? '');
  const [peso, setPeso] = useState(pet?.peso ?? '');
  const [historico, setHistorico] = useState(pet?.historicoSaude ?? '');

  const [aviso, setAviso] = useState<string | null>(null);
  const [ganhoTotal, setGanhoTotal] = useState<number | null>(null);

  const ehNovoCadastro = !pet;

  function salvar() {
    if (!nome.trim()) {
      setAviso('Dá um nome bonito pro pet pra continuar ❤️');
      return;
    }
    setAviso(null);

    salvarPet({
      nome: nome.trim(),
      especie,
      raca: raca.trim(),
      idade: idade.trim(),
      peso: peso.trim(),
      historicoSaude: historico.trim(),
    });

    let total = 0;
    if (ehNovoCadastro) {
      total += registrarAcao('cadastroPet', { unico: true });
    }
    if (raca.trim()) total += registrarAcao('raca', { unico: true });
    if (idade.trim()) total += registrarAcao('idade', { unico: true });
    if (peso.trim()) total += registrarAcao('peso', { unico: true });
    if (historico.trim()) total += registrarAcao('historicoSaude', { unico: true });

    const perfilCompleto =
      raca.trim() && idade.trim() && peso.trim() && historico.trim();
    if (perfilCompleto) {
      total += registrarAcao('perfilCompleto', { unico: true });
    }

    setGanhoTotal(total);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={estilos.titulo}>Cadastro do pet</Text>
        <Text style={estilos.subtitulo}>
          Cada campo preenchido vira pontos pra você. 🐾
        </Text>

        <Cartao style={{ gap: espacamentos.md }}>
          <Campo
            rotulo="Nome do pet"
            valor={nome}
            aoMudar={setNome}
            placeholder="Ex.: Thor"
            pontos={50}
          />

          <View>
            <Text style={estilos.rotulo}>Espécie</Text>
            <View style={estilos.linhaEspecie}>
              <SeletorEspecie
                ativo={especie === 'cao'}
                icone="paw"
                titulo="Cão"
                aoTocar={() => setEspecie('cao')}
              />
              <SeletorEspecie
                ativo={especie === 'gato'}
                icone="logo-octocat"
                titulo="Gato"
                aoTocar={() => setEspecie('gato')}
              />
            </View>
          </View>

          <Campo
            rotulo="Raça"
            valor={raca}
            aoMudar={setRaca}
            placeholder="Ex.: Golden Retriever"
            pontos={10}
          />
          <Campo
            rotulo="Idade"
            valor={idade}
            aoMudar={setIdade}
            placeholder="Ex.: 3 anos"
            pontos={10}
          />
          <Campo
            rotulo="Peso (kg)"
            valor={peso}
            aoMudar={setPeso}
            placeholder="Ex.: 12.5"
            teclado="decimal-pad"
            pontos={10}
          />
          <Campo
            rotulo="Histórico de saúde"
            valor={historico}
            aoMudar={setHistorico}
            placeholder="Vacinas, alergias, cirurgias, medicamentos…"
            multiplo
            pontos={20}
          />
        </Cartao>

        {aviso && (
          <Cartao style={{ borderColor: cores.laranjaSuave }}>
            <Text style={{ color: cores.laranja }}>{aviso}</Text>
          </Cartao>
        )}

        {ganhoTotal !== null && (
          <Cartao realce>
            <Text style={{ color: cores.primaria, fontWeight: '700', fontSize: 16 }}>
              {ganhoTotal > 0
                ? `+${ganhoTotal} pontos creditados! 🎉`
                : 'Dados atualizados ✓'}
            </Text>
            <Text style={{ color: cores.textoSecundario, marginTop: 4 }}>
              Cadastros já contabilizados não geram pontos de novo.
            </Text>
          </Cartao>
        )}

        <Botao
          titulo={ehNovoCadastro ? 'Cadastrar e ganhar pontos' : 'Salvar alterações'}
          onPress={salvar}
        />
        <Botao
          titulo="Voltar"
          variante="sutil"
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({
  rotulo,
  valor,
  aoMudar,
  placeholder,
  teclado,
  multiplo,
  pontos,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  placeholder: string;
  teclado?: 'default' | 'decimal-pad';
  multiplo?: boolean;
  pontos: number;
}) {
  return (
    <View>
      <View style={estilos.linhaRotulo}>
        <Text style={estilos.rotulo}>{rotulo}</Text>
        <Text style={estilos.tagPontos}>+{pontos} pts</Text>
      </View>
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSuave}
        keyboardType={teclado ?? 'default'}
        multiline={multiplo}
        numberOfLines={multiplo ? 4 : 1}
        style={[estilos.input, multiplo && { minHeight: 80, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

function SeletorEspecie({
  ativo,
  icone,
  titulo,
  aoTocar,
}: {
  ativo: boolean;
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  aoTocar: () => void;
}) {
  return (
    <Pressable
      onPress={aoTocar}
      style={[
        estilos.especie,
        ativo && { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
      ]}
    >
      <Ionicons
        name={icone}
        size={20}
        color={ativo ? cores.primaria : cores.textoSecundario}
      />
      <Text
        style={[
          estilos.especieTexto,
          { color: ativo ? cores.primaria : cores.textoSecundario },
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    padding: espacamentos.lg,
    paddingBottom: espacamentos.xxl,
    gap: espacamentos.md,
  },
  titulo: { color: cores.textoPrincipal, fontSize: 24, fontWeight: '700' },
  subtitulo: { color: cores.textoSecundario, fontSize: 13 },
  linhaRotulo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rotulo: { color: cores.textoSecundario, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  tagPontos: {
    color: cores.primaria,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: cores.primariaSuave,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: raios.pill,
  },
  input: {
    backgroundColor: cores.superficieAlt,
    color: cores.textoPrincipal,
    borderRadius: raios.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  linhaEspecie: { flexDirection: 'row', gap: espacamentos.sm },
  especie: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    borderRadius: raios.md,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  especieTexto: { fontSize: 14, fontWeight: '600' },
});
