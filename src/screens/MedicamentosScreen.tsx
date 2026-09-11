import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../api/cliente';
import {
  useConfirmarFimTratamento,
  useMedicamentos,
  useRegistrarDose,
} from '../hooks/useMedicamentos';
import type { Medicamento } from '../services/tipos';
import { Botao } from '../components/Botao';
import { usePetAtivo } from '../state/PetAtivoContext';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

/** "2026-09-12T03:09" -> "amanhã às 03:09" / "hoje às 14:00" / "12/09 às 03:09" */
function quando(iso: string): string {
  const data = new Date(iso);
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  const hora = `${String(data.getHours()).padStart(2, '0')}:${String(
    data.getMinutes(),
  ).padStart(2, '0')}`;

  const mesmoDia = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth();

  if (mesmoDia(data, hoje)) return `hoje às ${hora}`;
  if (mesmoDia(data, amanha)) return `amanhã às ${hora}`;

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');

  return `${dia}/${mes} às ${hora}`;
}

/** 200 -> "3h20" ; 45 -> "45 min" ; 1500 -> "1 dia e 1h" */
function duracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  if (horas < 24) return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`;

  const dias = Math.floor(horas / 24);
  const horasRestantes = horas % 24;

  return `${dias} ${dias === 1 ? 'dia' : 'dias'}${
    horasRestantes > 0 ? ` e ${horasRestantes}h` : ''
  }`;
}

/** "2026-09-18" -> "18/09/2026" */
function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function Cartao({
  medicamento,
  onRegistrar,
  onConfirmarFim,
  registrando,
  confirmando,
}: {
  medicamento: Medicamento;
  onRegistrar: () => void;
  onConfirmarFim: () => void;
  registrando: boolean;
  confirmando: boolean;
}) {
  const { emCurso, doseLiberada, aguardandoConfirmacao, minutosDeAtraso } = medicamento;
  const atrasada = minutosDeAtraso > 0;

  return (
    <View
      style={[
        estilos.cartao,
        !emCurso && estilos.cartaoEncerrado,
        emCurso && atrasada && !aguardandoConfirmacao && estilos.cartaoAtrasado,
      ]}
    >
      <View style={estilos.linhaTopo}>
        <View style={[estilos.icone, !emCurso && { backgroundColor: cores.superficieAlt }]}>
          <MaterialCommunityIcons
            name="pill"
            size={22}
            color={emCurso ? cores.laranja : cores.textoSuave}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[estilos.nome, !emCurso && { color: cores.textoSecundario }]}>
            {medicamento.nome}
          </Text>
          <Text style={estilos.posologia}>
            {medicamento.dosagem ? `${medicamento.dosagem}, ` : ''}
            {medicamento.posologia}
          </Text>
        </View>

        {emCurso ? (
          <View style={estilos.selo}>
            <Text style={estilos.seloTexto}>+15 pts</Text>
          </View>
        ) : (
          <View style={[estilos.selo, { backgroundColor: cores.superficieAlt }]}>
            <Text style={[estilos.seloTexto, { color: cores.textoSuave }]}>encerrado</Text>
          </View>
        )}
      </View>

      <View style={estilos.detalhes}>
        <Text style={estilos.detalhe}>
          <Ionicons name="calendar-outline" size={12} color={cores.textoSuave} />{' '}
          {medicamento.dataFim
            ? `Até ${dataCurta(medicamento.dataFim)}`
            : 'Uso contínuo'}
        </Text>

        {!!medicamento.veterinario && (
          <Text style={estilos.detalhe}>
            <Ionicons name="medkit-outline" size={12} color={cores.textoSuave} />{' '}
            {medicamento.veterinario}
          </Text>
        )}
      </View>

      {!!medicamento.observacao && (
        <Text style={estilos.observacao}>{medicamento.observacao}</Text>
      )}

      {aguardandoConfirmacao && (
        <View style={estilos.fim}>
          <View style={estilos.fimTopo}>
            <Ionicons name="checkmark-done-circle" size={17} color={cores.primaria} />
            <Text style={estilos.fimTitulo}>Tratamento concluído</Text>
          </View>

          <Text style={estilos.fimTexto}>
            Os dias receitados terminaram em {dataCurta(medicamento.dataFim!)}. Se o
            tratamento acabou mesmo, confirme e este remédio sai da sua lista.
          </Text>

          <Pressable
            onPress={onConfirmarFim}
            disabled={confirmando}
            style={({ pressed }) => [estilos.fimBotao, pressed && { opacity: 0.7 }]}
          >
            <Text style={estilos.fimBotaoTexto}>Confirmar e arquivar</Text>
          </Pressable>
        </View>
      )}

      {emCurso && !aguardandoConfirmacao && (
        <>
          <View style={estilos.rodape}>
            <Text style={estilos.doses}>
              {medicamento.dosesRegistradas === 0
                ? 'Nenhuma dose registrada'
                : `${medicamento.dosesRegistradas} ${
                    medicamento.dosesRegistradas === 1 ? 'dose dada' : 'doses dadas'
                  }`}
            </Text>

            {!!medicamento.proximaDose && (
              <Text
                style={[
                  estilos.proxima,
                  doseLiberada && { color: cores.primaria },
                  atrasada && { color: cores.erro },
                ]}
              >
                {atrasada
                  ? `Atrasada há ${duracao(minutosDeAtraso)}`
                  : doseLiberada
                    ? 'Pode dar a próxima'
                    : `Próxima ${quando(medicamento.proximaDose)}`}
              </Text>
            )}
          </View>

          {medicamento.dosePerdida && (
            <View style={estilos.atraso}>
              <Ionicons name="alert-circle" size={15} color={cores.erro} />
              <Text style={estilos.atrasoTexto}>
                Passou mais de um intervalo inteiro. Essa dose não conta para os pontos, e
                o horário do tratamento recomeça a partir da próxima que você der.
              </Text>
            </View>
          )}

          {/* Sem a hora da última dose, o tutor não percebe que o registro
              entrou nem que o próximo horário se moveu junto. */}
          {!!medicamento.ultimaDose && (
            <Text style={estilos.ultima}>
              Última dose {quando(medicamento.ultimaDose)}
            </Text>
          )}

          <Pressable
            onPress={onRegistrar}
            disabled={registrando}
            style={({ pressed }) => [
              estilos.botao,
              !doseLiberada && estilos.botaoAdiantado,
              atrasada && estilos.botaoAtrasado,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={atrasada ? cores.erro : doseLiberada ? cores.primaria : cores.textoSuave}
            />
            <Text
              style={[
                estilos.botaoTexto,
                !doseLiberada && { color: cores.textoSuave },
                atrasada && { color: cores.erro },
              ]}
            >
              {atrasada
                ? 'Dei o remédio agora'
                : doseLiberada
                  ? 'Registrar dose'
                  : 'Registrar mesmo assim'}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

/**
 * Medicamentos do pet.
 *
 * A lista é a receita: o tutor não inventa um tratamento, ele cumpre o que
 * o veterinário prescreveu. Registrar a dose fora do intervalo continua
 * valendo como histórico, mas não rende pontos.
 */
export function MedicamentosScreen() {
  const { petAtivo } = usePetAtivo();
  const { data: medicamentos, isLoading } = useMedicamentos(petAtivo?.id ?? null);
  const registrarDose = useRegistrarDose();
  const confirmarFimTratamento = useConfirmarFimTratamento();

  const [aviso, setAviso] = useState<string | null>(null);
  const [avisoPontuou, setAvisoPontuou] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  /** Dose pedida, à espera de confirmação. */
  const [aConfirmar, setAConfirmar] = useState<Medicamento | null>(null);

  async function registrar(medicamento: Medicamento) {
    setErro(null);
    setAviso(null);
    setAConfirmar(null);

    try {
      const dose = await registrarDose.mutateAsync({ idMedicamento: medicamento.id });

      setAvisoPontuou(dose.pontosGanhos > 0);
      setAviso(
        dose.pontosGanhos > 0
          ? `${dose.medicamento}: +${dose.pontosGanhos} pontos. Próxima dose ${quando(
              dose.proximaDose,
            )}.`
          : `${dose.aviso ?? 'Dose fora do intervalo da receita'}. `
            + `Próxima dose ${quando(dose.proximaDose)}.`,
      );
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível registrar a dose'));
    }
  }

  const emCurso = (medicamentos ?? []).filter((m) => m.emCurso);
  const encerrados = (medicamentos ?? []).filter((m) => !m.emCurso);

  async function confirmarFim(medicamento: Medicamento) {
    setErro(null);

    try {
      await confirmarFimTratamento.mutateAsync(medicamento.id);
      setAvisoPontuou(true);
      setAviso(`${medicamento.nome} foi arquivado. Tratamento concluído!`);
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível concluir o tratamento'));
    }
  }

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Medicamentos</Text>
      <Text style={estilos.subtitulo}>
        Receitados por sua veterinária para {petAtivo?.nome ?? 'seu pet'}. Registre cada dose
        no horário e ganhe pontos.
      </Text>

      {!!aviso && (
        <View style={[estilos.faixa, !avisoPontuou && estilos.faixaAtencao]}>
          <Ionicons
            name={avisoPontuou ? 'checkmark-circle' : 'information-circle'}
            size={17}
            color={avisoPontuou ? cores.primaria : cores.alerta}
          />
          <Text style={estilos.faixaTexto}>{aviso}</Text>
          <Pressable onPress={() => setAviso(null)} hitSlop={10}>
            <Ionicons name="close" size={15} color={cores.textoSecundario} />
          </Pressable>
        </View>
      )}

      {!!erro && <Text style={estilos.erro}>{erro}</Text>}

      {isLoading ? (
        <ActivityIndicator color={cores.primaria} style={{ marginTop: espacamentos.lg }} />
      ) : (medicamentos ?? []).length === 0 ? (
        <View style={estilos.vazio}>
          <MaterialCommunityIcons name="pill-off" size={34} color={cores.textoSuave} />
          <Text style={estilos.vazioTexto}>
            Nenhum medicamento receitado. Quando a veterinária prescrever algo em uma
            consulta, aparece aqui.
          </Text>
        </View>
      ) : (
        <>
          {emCurso.map((m) => (
            <Cartao
              key={m.id}
              medicamento={m}
              registrando={registrarDose.isPending}
              confirmando={confirmarFimTratamento.isPending}
              onRegistrar={() => setAConfirmar(m)}
              onConfirmarFim={() => confirmarFim(m)}
            />
          ))}

          {encerrados.length > 0 && (
            <>
              <Text style={estilos.secao}>Tratamentos encerrados</Text>
              {encerrados.map((m) => (
                <Cartao
                  key={m.id}
                  medicamento={m}
                  registrando={false}
                  confirmando={confirmarFimTratamento.isPending}
                  onRegistrar={() => undefined}
                  onConfirmarFim={() => confirmarFim(m)}
                />
              ))}
            </>
          )}
        </>
      )}

      {/* Dar remédio é ato de saúde: confirma antes de contar como dado */}
      <Modal
        visible={!!aConfirmar}
        transparent
        animationType="fade"
        onRequestClose={() => setAConfirmar(null)}
      >
        <Pressable style={estilos.fundoModal} onPress={() => setAConfirmar(null)}>
          <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
            <View style={estilos.painelTopo}>
              <MaterialCommunityIcons name="pill" size={26} color={cores.laranja} />
            </View>

            <Text style={estilos.painelTitulo}>Confirmar a dose</Text>

            <Text style={estilos.painelTexto}>
              {aConfirmar?.dosagem ? `${aConfirmar.dosagem} de ` : ''}
              <Text style={estilos.destaque}>{aConfirmar?.nome}</Text> para{' '}
              {petAtivo?.nome}, agora.
            </Text>

            {!!aConfirmar && aConfirmar.dosePerdida && (
              <View style={[estilos.alerta, estilos.alertaGrave]}>
                <Ionicons name="alert-circle" size={15} color={cores.erro} />
                <Text style={[estilos.alertaTexto, { color: cores.erro }]}>
                  Atrasada há {duracao(aConfirmar.minutosDeAtraso)}: passou de um intervalo
                  inteiro. A dose não rende pontos e o horário recomeça a contar de agora.
                </Text>
              </View>
            )}

            {!!aConfirmar &&
              !aConfirmar.dosePerdida &&
              !aConfirmar.doseLiberada &&
              !!aConfirmar.proximaDose && (
                <View style={estilos.alerta}>
                  <Ionicons name="warning" size={15} color={cores.alerta} />
                  <Text style={estilos.alertaTexto}>
                    A receita pede a próxima dose {quando(aConfirmar.proximaDose)}. A dose
                    fica registrada, mas não rende pontos.
                  </Text>
                </View>
              )}

            <View style={estilos.botoes}>
              <Botao
                titulo="Voltar"
                variante="sutil"
                onPress={() => setAConfirmar(null)}
                estilo={{ flex: 1 }}
              />
              <Botao
                titulo="Dei o remédio"
                onPress={() => aConfirmar && registrar(aConfirmar)}
                carregando={registrarDose.isPending}
                estilo={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.md, paddingBottom: espacamentos.xxl, flexGrow: 1 },

  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  subtitulo: {
    fontSize: 13,
    color: cores.textoSecundario,
    lineHeight: 18,
    marginBottom: espacamentos.md,
  },

  faixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.sm,
  },
  faixaAtencao: { backgroundColor: 'rgba(255,180,84,0.12)' },
  faixaTexto: { flex: 1, fontSize: 12, color: cores.textoPrincipal, lineHeight: 17 },
  erro: { color: cores.erro, fontSize: 12, marginBottom: espacamentos.sm },

  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    marginBottom: espacamentos.sm,
  },
  cartaoEncerrado: { opacity: 0.65 },
  cartaoAtrasado: { borderColor: 'rgba(255,107,107,0.5)' },

  atraso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.sm,
    backgroundColor: 'rgba(255,107,107,0.10)',
    borderRadius: raios.md,
    padding: espacamentos.sm,
    marginTop: espacamentos.sm,
  },
  atrasoTexto: { flex: 1, fontSize: 11, color: cores.erro, lineHeight: 16 },

  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  icone: {
    width: 42,
    height: 42,
    borderRadius: raios.md,
    backgroundColor: cores.laranjaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { fontSize: 15, fontWeight: '700', color: cores.textoPrincipal },
  posologia: { fontSize: 12, color: cores.laranja, marginTop: 1 },

  selo: {
    backgroundColor: cores.laranjaSuave,
    paddingHorizontal: espacamentos.sm,
    paddingVertical: 3,
    borderRadius: raios.pill,
  },
  seloTexto: { fontSize: 11, fontWeight: '700', color: cores.laranja },

  detalhes: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.md, marginTop: 10 },
  detalhe: { fontSize: 11, color: cores.textoSuave },
  observacao: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: espacamentos.sm,
    lineHeight: 17,
  },

  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacamentos.sm + 2,
  },
  doses: { fontSize: 12, color: cores.textoSecundario },
  proxima: { fontSize: 12, color: cores.textoSuave, fontWeight: '600' },
  ultima: { fontSize: 11, color: cores.textoSuave, marginTop: 3 },

  fim: {
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginTop: espacamentos.sm,
    gap: 4,
  },
  fimTopo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fimTitulo: { fontSize: 13, fontWeight: '800', color: cores.primaria },
  fimTexto: { fontSize: 12, color: cores.textoSecundario, lineHeight: 17 },
  fimBotao: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: raios.md,
    paddingVertical: espacamentos.sm,
    marginTop: espacamentos.xs,
  },
  fimBotaoTexto: { fontSize: 13, fontWeight: '700', color: cores.primaria },

  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: raios.md,
    paddingVertical: espacamentos.sm + 2,
    marginTop: espacamentos.sm,
  },
  botaoAdiantado: { borderColor: cores.borda },
  botaoAtrasado: { borderColor: cores.erro },
  botaoTexto: { fontSize: 13, fontWeight: '700', color: cores.primaria },

  secao: {
    ...tipografia.legenda,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    marginTop: espacamentos.md,
    marginBottom: espacamentos.sm,
  },

  fundoModal: {
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
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    gap: espacamentos.sm,
  },
  painelTopo: { alignItems: 'center' },
  painelTitulo: {
    ...tipografia.subtitulo,
    color: cores.textoPrincipal,
    textAlign: 'center',
  },
  painelTexto: {
    fontSize: 13,
    color: cores.textoSecundario,
    textAlign: 'center',
    lineHeight: 19,
  },
  destaque: { color: cores.textoPrincipal, fontWeight: '700' },
  alerta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.sm,
    backgroundColor: 'rgba(255,180,84,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
  },
  alertaGrave: { backgroundColor: 'rgba(255,107,107,0.12)' },
  alertaTexto: { flex: 1, fontSize: 12, color: cores.alerta, lineHeight: 17 },
  botoes: { flexDirection: 'row', gap: espacamentos.sm, marginTop: espacamentos.xs },

  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamentos.sm,
  },
  vazioTexto: {
    color: cores.textoSecundario,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: espacamentos.lg,
    lineHeight: 19,
  },
});
