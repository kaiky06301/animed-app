import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { mensagemDoErro } from '../api/cliente';
import { usePrescrever } from '../hooks/useMedicamentos';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';
import { Botao } from './Botao';

interface Props {
  visivel: boolean;
  idPet: number;
  nomePet: string;
  onFechar: () => void;
  onPrescrito: (mensagem: string) => void;
}

/**
 * Intervalos usuais, em horas.
 *
 * Poupam o veterinário de converter meses em horas e mantêm a receita em
 * uma unidade só — o que permite tratar vermífugo e antibiótico pelo mesmo
 * mecanismo.
 */
const INTERVALOS = [
  { rotulo: '8/8h', horas: 8 },
  { rotulo: '12/12h', horas: 12 },
  { rotulo: '1x ao dia', horas: 24 },
  { rotulo: 'Semanal', horas: 168 },
  { rotulo: 'Mensal', horas: 720 },
  { rotulo: 'A cada 3 meses', horas: 2160 },
];

/** Sugestões que cobrem a maior parte das receitas do dia a dia. */
const SUGESTOES = [
  'Vermífugo',
  'Antipulgas',
  'Anti-inflamatório',
  'Antibiótico',
  'Analgésico',
];

function hoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** Soma dias a uma data ISO e devolve outra data ISO. */
function somarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia + dias);

  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(
    data.getDate(),
  ).padStart(2, '0')}`;
}

/**
 * Prescrição de medicamento pelo veterinário.
 *
 * O que sai daqui define o que o tutor vê e quando a dose dele conta:
 * nome, quanto dar, de quanto em quanto tempo e até quando.
 */
export function PrescreverMedicamento({
  visivel,
  idPet,
  nomePet,
  onFechar,
  onPrescrito,
}: Props) {
  const prescrever = usePrescrever();

  const [nome, setNome] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [intervalo, setIntervalo] = useState(12);
  const [duracaoDias, setDuracaoDias] = useState('7');
  const [continuo, setContinuo] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (visivel) {
      setNome('');
      setDosagem('');
      setIntervalo(12);
      setDuracaoDias('7');
      setContinuo(false);
      setObservacao('');
      setErro(null);
    }
  }, [visivel]);

  async function confirmar() {
    if (!nome.trim()) {
      setErro('Informe o nome do medicamento');
      return;
    }

    const dias = Number(duracaoDias);

    if (!continuo && (!duracaoDias || Number.isNaN(dias) || dias < 1)) {
      setErro('Informe por quantos dias o tratamento dura');
      return;
    }

    setErro(null);
    const inicio = hoje();

    try {
      await prescrever.mutateAsync({
        idPet,
        nome: nome.trim(),
        dosagem: dosagem.trim() || null,
        intervaloHoras: intervalo,
        dataInicio: inicio,
        dataFim: continuo ? null : somarDias(inicio, dias - 1),
        observacao: observacao.trim() || null,
      });

      onPrescrito(`${nome.trim()} receitado para ${nomePet}.`);
      onFechar();
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível prescrever o medicamento'));
    }
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View style={estilos.cabecalho}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.titulo}>Prescrever medicamento</Text>
              <Text style={estilos.subtitulo}>Para {nomePet}</Text>
            </View>
            <Pressable onPress={onFechar} hitSlop={10} style={estilos.fechar}>
              <Ionicons name="close" size={20} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={estilos.rotulo}>Medicamento</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Ex.: Amoxicilina 250mg"
              placeholderTextColor={cores.textoSuave}
              style={estilos.campo}
            />

            <View style={estilos.sugestoes}>
              {SUGESTOES.map((s) => (
                <Pressable key={s} onPress={() => setNome(s)} style={estilos.sugestao}>
                  <Text style={estilos.sugestaoTexto}>{s}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={estilos.rotulo}>Quanto dar por vez</Text>
            <TextInput
              value={dosagem}
              onChangeText={setDosagem}
              placeholder="Ex.: 1 comprimido, 5 ml"
              placeholderTextColor={cores.textoSuave}
              style={estilos.campo}
            />

            <Text style={estilos.rotulo}>De quanto em quanto tempo</Text>
            <View style={estilos.opcoes}>
              {INTERVALOS.map((opcao) => {
                const ativo = intervalo === opcao.horas;
                return (
                  <Pressable
                    key={opcao.horas}
                    onPress={() => setIntervalo(opcao.horas)}
                    style={[estilos.opcao, ativo && estilos.opcaoAtiva]}
                  >
                    <Text style={[estilos.opcaoTexto, ativo && { color: cores.primaria }]}>
                      {opcao.rotulo}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={estilos.rotulo}>Duração</Text>
            <View style={estilos.duracao}>
              <TextInput
                value={continuo ? '' : duracaoDias}
                onChangeText={setDuracaoDias}
                editable={!continuo}
                placeholder="7"
                placeholderTextColor={cores.textoSuave}
                keyboardType="number-pad"
                style={[estilos.campo, estilos.campoDias, continuo && { opacity: 0.4 }]}
              />
              <Text style={estilos.diasTexto}>dias</Text>

              <Pressable
                onPress={() => setContinuo((v) => !v)}
                style={[estilos.opcao, continuo && estilos.opcaoAtiva]}
              >
                <Text style={[estilos.opcaoTexto, continuo && { color: cores.primaria }]}>
                  Uso contínuo
                </Text>
              </Pressable>
            </View>

            <Text style={estilos.rotulo}>Orientação ao tutor</Text>
            <TextInput
              value={observacao}
              onChangeText={setObservacao}
              placeholder="Ex.: dar junto com a comida"
              placeholderTextColor={cores.textoSuave}
              multiline
              style={[estilos.campo, { minHeight: 60, textAlignVertical: 'top' }]}
            />

            {!!erro && <Text style={estilos.erro}>{erro}</Text>}
          </ScrollView>

          <Botao
            titulo="Prescrever"
            icone="medkit-outline"
            onPress={confirmar}
            carregando={prescrever.isPending}
            estilo={{ marginTop: espacamentos.sm }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: cores.overlay,
    justifyContent: 'center',
    padding: espacamentos.md,
  },
  painel: {
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    maxWidth: 460,
    maxHeight: '90%',
    width: '100%',
    alignSelf: 'center',
  },

  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.sm },
  titulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  subtitulo: { fontSize: 12, color: cores.primaria, marginTop: 1 },
  fechar: {
    width: 30,
    height: 30,
    borderRadius: raios.sm,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rotulo: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.textoSecundario,
    marginTop: espacamentos.md,
    marginBottom: 6,
  },
  campo: {
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: espacamentos.sm + 2,
    color: cores.textoPrincipal,
    fontSize: 13,
  },

  sugestoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.xs,
    marginTop: espacamentos.xs,
  },
  sugestao: {
    borderRadius: raios.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: espacamentos.sm,
    paddingVertical: 4,
  },
  sugestaoTexto: { fontSize: 11, color: cores.textoSecundario },

  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.xs },
  opcao: {
    borderRadius: raios.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: 7,
  },
  opcaoAtiva: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  opcaoTexto: { fontSize: 12, fontWeight: '600', color: cores.textoSecundario },

  duracao: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  campoDias: { width: 70, textAlign: 'center' },
  diasTexto: { fontSize: 13, color: cores.textoSecundario, marginRight: espacamentos.xs },

  erro: { color: cores.erro, fontSize: 12, marginTop: espacamentos.sm },
});
