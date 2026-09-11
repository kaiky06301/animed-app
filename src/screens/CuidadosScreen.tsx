import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
import { Botao } from '../components/Botao';
import { useRegistrarCuidado } from '../hooks/useRegistrarCuidado';
import { useTutor } from '../hooks/useTutor';
import type { RaizParamList } from '../navigation/tipos';
import type { TipoCuidado } from '../services/tipos';
import { usePetAtivo } from '../state/PetAtivoContext';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

type Navegacao = NativeStackNavigationProp<RaizParamList>;

interface AcaoCuidado {
  tipo: TipoCuidado;
  titulo: string;
  descricao: string;
  pontos: number;
  cor: string;
  icone: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Pede um valor numérico antes de registrar (caso da pesagem). */
  pedeValor?: boolean;
}

/** Cuidados que o próprio tutor realiza no dia a dia. */
const ACOES_TUTOR: AcaoCuidado[] = [
  {
    tipo: 'MEDICACAO',
    titulo: 'Medicação dada',
    descricao: 'Registre a aplicação de medicamentos e mantenha o controle de doses.',
    pontos: 15,
    cor: '#FF8A3D',
    icone: 'pill',
  },
  {
    tipo: 'VERMIFUGACAO',
    titulo: 'Vermifugação',
    descricao: 'Registre o vermífugo aplicado e acompanhe o próximo prazo.',
    pontos: 15,
    cor: '#7C5CFF',
    icone: 'bottle-tonic-plus',
  },
  {
    tipo: 'PESAGEM',
    titulo: 'Pesagem registrada',
    descricao: 'Atualize o peso regularmente e acompanhe a evolução.',
    pontos: 5,
    cor: '#F05252',
    icone: 'scale-bathroom',
    pedeValor: true,
  },
  {
    tipo: 'AGENDAMENTO',
    titulo: 'Agendou consulta',
    descricao: 'Planejou o cuidado futuro do seu pet.',
    pontos: 10,
    cor: '#EAB308',
    icone: 'calendar-check',
  },
];

/** Registros clínicos: acontecem na clínica e são lançados pelo veterinário. */
const ACOES_CLINICAS = [
  {
    titulo: 'Vacina aplicada',
    descricao: 'Registrada pelo veterinário a cada aplicação.',
    pontos: 25,
    cor: '#22D3A0',
    icone: 'needle' as const,
  },
  {
    titulo: 'Consulta no veterinário',
    descricao: 'Lançada pela clínica após o atendimento.',
    pontos: 20,
    cor: '#3B82F6',
    icone: 'stethoscope' as const,
  },
  {
    titulo: 'Check-up preventivo',
    descricao: 'Registrado pela clínica ao concluir a avaliação.',
    pontos: 30,
    cor: '#A78BFA',
    icone: 'heart-pulse' as const,
  },
];

export function CuidadosScreen() {
  const navigation = useNavigation<Navegacao>();
  const { petAtivo } = usePetAtivo();
  const { data: tutor } = useTutor();
  const registrar = useRegistrarCuidado();

  const [acaoAberta, setAcaoAberta] = useState<AcaoCuidado | null>(null);
  const [peso, setPeso] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  function abrir(acao: AcaoCuidado) {
    setAcaoAberta(acao);
    setPeso(petAtivo?.pesoKg != null ? String(petAtivo.pesoKg) : '');
    setObservacao('');
    setErro(null);
  }

  function fechar() {
    setAcaoAberta(null);
    setErro(null);
  }

  async function confirmar() {
    if (!acaoAberta || !petAtivo) return;
    setErro(null);

    const valor = Number(peso.replace(',', '.'));

    if (acaoAberta.pedeValor && (!peso || Number.isNaN(valor) || valor <= 0)) {
      setErro('Informe um peso válido, como 8.5');
      return;
    }

    try {
      const resultado = await registrar.mutateAsync({
        idPet: petAtivo.id,
        tipo: acaoAberta.tipo,
        pesoKg: acaoAberta.pedeValor ? valor : undefined,
        observacao: observacao.trim() || undefined,
      });

      setSucesso(`${acaoAberta.titulo}: +${resultado.pontosGanhos} pontos`);
      fechar();
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível registrar o cuidado'));
    }
  }

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cabecalho}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>Cuidados</Text>
          <Text style={estilos.subtitulo}>
            Cada ação de cuidado vira pontos. Registre o que aconteceu com{' '}
            <Text style={estilos.destaque}>{petAtivo?.nome ?? 'seu pet'}</Text>.
          </Text>
        </View>

        <View style={estilos.seloPontos}>
          <Ionicons name="paw" size={13} color={cores.laranja} />
          <Text style={estilos.seloPontosTexto}>
            {(tutor?.pontosTotais ?? 0).toLocaleString('pt-BR')} pts
          </Text>
          <Ionicons name="star" size={12} color={cores.dourado} />
        </View>
      </View>

      {!!sucesso && (
        <View style={estilos.sucesso}>
          <Ionicons name="checkmark-circle" size={18} color={cores.primaria} />
          <Text style={estilos.sucessoTexto}>{sucesso}</Text>
          <Pressable onPress={() => setSucesso(null)} hitSlop={10}>
            <Ionicons name="close" size={16} color={cores.textoSecundario} />
          </Pressable>
        </View>
      )}

      {!petAtivo && (
        <View style={estilos.aviso}>
          <Ionicons name="information-circle" size={18} color={cores.alerta} />
          <Text style={estilos.avisoTexto}>
            Cadastre um pet para começar a registrar os cuidados.
          </Text>
        </View>
      )}

      {ACOES_TUTOR.map((acao) => (
        <View key={acao.tipo} style={[estilos.cartao, { borderColor: `${acao.cor}55` }]}>
          <View style={estilos.linhaCartao}>
            <View style={[estilos.icone, { backgroundColor: `${acao.cor}22` }]}>
              <MaterialCommunityIcons name={acao.icone} size={26} color={acao.cor} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={estilos.cartaoTitulo}>{acao.titulo}</Text>
              <Text style={estilos.cartaoDescricao}>{acao.descricao}</Text>
            </View>

            <View style={[estilos.seloAcao, { backgroundColor: `${acao.cor}22` }]}>
              <Text style={[estilos.seloAcaoTexto, { color: acao.cor }]}>+{acao.pontos} pts</Text>
            </View>
          </View>

          <Pressable
            disabled={!petAtivo}
            onPress={() => abrir(acao)}
            style={({ pressed }) => [
              estilos.botaoRegistrar,
              { borderColor: acao.cor },
              (pressed || !petAtivo) && { opacity: 0.6 },
            ]}
          >
            <Text style={[estilos.botaoTexto, { color: acao.cor }]}>Registrar</Text>
            <Ionicons name="chevron-forward" size={15} color={acao.cor} />
          </Pressable>
        </View>
      ))}

      <Text style={estilos.secao}>Registrado pelo veterinário</Text>
      <Text style={estilos.secaoTexto}>
        Estes cuidados são lançados pela clínica no atendimento, e os pontos entram
        automaticamente para você.
      </Text>

      {ACOES_CLINICAS.map((acao) => (
        <View key={acao.titulo} style={estilos.cartaoClinico}>
          <View style={[estilos.icone, { backgroundColor: `${acao.cor}18` }]}>
            <MaterialCommunityIcons name={acao.icone} size={24} color={acao.cor} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={estilos.cartaoTitulo}>{acao.titulo}</Text>
            <Text style={estilos.cartaoDescricao}>{acao.descricao}</Text>
          </View>

          <View style={estilos.seloClinico}>
            <Text style={estilos.seloClinicoTexto}>+{acao.pontos} pts</Text>
          </View>
        </View>
      ))}

      {!!petAtivo && (
        <Botao
          titulo="Ver carteira de vacinas"
          variante="sutil"
          icone="medkit-outline"
          onPress={() =>
            navigation.navigate('Vacinas', { idPet: petAtivo.id, nomePet: petAtivo.nome })
          }
          estilo={{ marginTop: espacamentos.sm }}
        />
      )}

      {/* Confirmação do registro */}
      <Modal visible={!!acaoAberta} transparent animationType="fade" onRequestClose={fechar}>
        <Pressable style={estilos.fundoModal} onPress={fechar}>
          <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
            <View style={estilos.painelCabecalho}>
              <Text style={estilos.painelTitulo}>{acaoAberta?.titulo}</Text>
              <Pressable onPress={fechar} hitSlop={10}>
                <Ionicons name="close" size={22} color={cores.textoSecundario} />
              </Pressable>
            </View>

            <Text style={estilos.painelTexto}>
              Registrando para <Text style={estilos.destaque}>{petAtivo?.nome}</Text>. Você
              ganha {acaoAberta?.pontos} pontos.
            </Text>

            {acaoAberta?.pedeValor && (
              <View style={estilos.campo}>
                <MaterialCommunityIcons
                  name="scale-bathroom"
                  size={18}
                  color={cores.textoSuave}
                />
                <TextInput
                  value={peso}
                  onChangeText={setPeso}
                  placeholder="Peso em kg"
                  placeholderTextColor={cores.textoSuave}
                  keyboardType="decimal-pad"
                  style={estilos.entrada}
                />
                <Text style={estilos.sufixo}>kg</Text>
              </View>
            )}

            <View style={estilos.campo}>
              <Ionicons name="create-outline" size={18} color={cores.textoSuave} />
              <TextInput
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Observação (opcional)"
                placeholderTextColor={cores.textoSuave}
                style={estilos.entrada}
              />
            </View>

            {!!erro && <Text style={estilos.erro}>{erro}</Text>}

            <Botao
              titulo="Confirmar registro"
              icone="checkmark-circle-outline"
              onPress={confirmar}
              carregando={registrar.isPending}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    padding: espacamentos.md,
    paddingBottom: espacamentos.xxl,
    gap: espacamentos.sm,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.md,
    marginBottom: espacamentos.xs,
  },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  subtitulo: { ...tipografia.corpo, color: cores.textoSecundario, marginTop: 2 },
  destaque: { color: cores.laranja, fontWeight: '700' },
  seloPontos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: raios.pill,
    backgroundColor: '#3A2A18',
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.4)',
  },
  seloPontosTexto: { color: '#F6E7D3', fontSize: 12, fontWeight: '800' },
  sucesso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
  },
  sucessoTexto: { flex: 1, color: cores.primaria, fontSize: 13, fontWeight: '700' },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: 'rgba(255,180,84,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
  },
  avisoTexto: { flex: 1, color: cores.alerta, fontSize: 12 },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    padding: espacamentos.md,
    gap: espacamentos.md,
  },
  linhaCartao: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.md },
  icone: {
    width: 52,
    height: 52,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartaoTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal, fontSize: 16 },
  cartaoDescricao: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  seloAcao: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: raios.pill,
  },
  seloAcaoTexto: { fontSize: 12, fontWeight: '800' },
  botaoRegistrar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: espacamentos.sm + 2,
    borderRadius: raios.md,
    borderWidth: 1,
  },
  botaoTexto: { fontSize: 14, fontWeight: '700' },
  secao: {
    ...tipografia.subtitulo,
    color: cores.textoPrincipal,
    marginTop: espacamentos.md,
  },
  secaoTexto: {
    color: cores.textoSecundario,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: espacamentos.xs,
  },
  cartaoClinico: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
  },
  seloClinico: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: raios.pill,
    backgroundColor: cores.superficieAlt,
  },
  seloClinicoTexto: { color: cores.textoSecundario, fontSize: 12, fontWeight: '700' },
  fundoModal: {
    flex: 1,
    backgroundColor: cores.overlay,
    justifyContent: 'center',
    padding: espacamentos.lg,
  },
  painel: {
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.lg,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    gap: espacamentos.sm,
  },
  painelCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  painelTitulo: { ...tipografia.subtitulo, color: cores.textoPrincipal },
  painelTexto: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginBottom: espacamentos.xs,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.superficieAlt,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 4,
  },
  entrada: { flex: 1, color: cores.textoPrincipal, fontSize: 15, padding: 0 },
  sufixo: { color: cores.textoSuave, fontSize: 13 },
  erro: { color: cores.erro, fontSize: 12 },
});
