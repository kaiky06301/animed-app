import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../api/cliente';
import { useMedicamentos, useRegistrarDose } from '../hooks/useMedicamentos';
import type { Medicamento } from '../services/tipos';
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

/** "2026-09-18" -> "18/09/2026" */
function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function Cartao({
  medicamento,
  onRegistrar,
  registrando,
}: {
  medicamento: Medicamento;
  onRegistrar: () => void;
  registrando: boolean;
}) {
  const { emCurso, doseLiberada } = medicamento;

  return (
    <View style={[estilos.cartao, !emCurso && estilos.cartaoEncerrado]}>
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

      {emCurso && (
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
              <Text style={[estilos.proxima, doseLiberada && { color: cores.primaria }]}>
                {doseLiberada
                  ? 'Pode dar a próxima'
                  : `Próxima ${quando(medicamento.proximaDose)}`}
              </Text>
            )}
          </View>

          <Pressable
            onPress={onRegistrar}
            disabled={registrando}
            style={({ pressed }) => [
              estilos.botao,
              !doseLiberada && estilos.botaoAdiantado,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={doseLiberada ? cores.primaria : cores.textoSuave}
            />
            <Text
              style={[estilos.botaoTexto, !doseLiberada && { color: cores.textoSuave }]}
            >
              {doseLiberada ? 'Registrar dose' : 'Registrar mesmo assim'}
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

  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function registrar(medicamento: Medicamento) {
    setErro(null);
    setAviso(null);

    try {
      const dose = await registrarDose.mutateAsync({ idMedicamento: medicamento.id });

      setAviso(
        dose.pontosGanhos > 0
          ? `${dose.medicamento}: +${dose.pontosGanhos} pontos. Próxima dose ${quando(
              dose.proximaDose,
            )}.`
          : `Dose registrada fora do intervalo da receita, por isso não rendeu pontos.`,
      );
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível registrar a dose'));
    }
  }

  const emCurso = (medicamentos ?? []).filter((m) => m.emCurso);
  const encerrados = (medicamentos ?? []).filter((m) => !m.emCurso);

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Medicamentos</Text>
      <Text style={estilos.subtitulo}>
        Receitados por sua veterinária para {petAtivo?.nome ?? 'seu pet'}. Registre cada dose
        no horário e ganhe pontos.
      </Text>

      {!!aviso && (
        <View style={estilos.faixa}>
          <Ionicons name="checkmark-circle" size={17} color={cores.primaria} />
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
              onRegistrar={() => registrar(m)}
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
                  onRegistrar={() => undefined}
                />
              ))}
            </>
          )}
        </>
      )}
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
  botaoTexto: { fontSize: 13, fontWeight: '700', color: cores.primaria },

  secao: {
    ...tipografia.legenda,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    marginTop: espacamentos.md,
    marginBottom: espacamentos.sm,
  },

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
