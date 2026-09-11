import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

interface Props {
  visivel: boolean;
  /** Data selecionada em ISO (AAAA-MM-DD). */
  valor: string;
  onSelecionar: (iso: string) => void;
  onFechar: () => void;
  bloquearFuturo?: boolean;
  /** Exibe o atalho para a data de hoje. */
  atalhoHoje?: boolean;
}

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MESES_CURTOS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

/** Quantidade de anos exibidos por página na seleção de ano. */
const ANOS_POR_PAGINA = 12;

type Modo = 'dias' | 'meses' | 'anos';

/**
 * Calendário próprio do aplicativo, igual em todas as plataformas.
 * Evita o seletor nativo do navegador, que abre fora do contexto da tela
 * e não acompanha o tema escuro.
 */
export function Calendario({
  visivel,
  valor,
  onSelecionar,
  onFechar,
  bloquearFuturo = false,
  atalhoHoje = true,
}: Props) {
  const selecionada = valor ? new Date(`${valor}T12:00:00`) : null;
  const hoje = new Date();

  const [mesExibido, setMesExibido] = useState(
    () => new Date((selecionada ?? hoje).getFullYear(), (selecionada ?? hoje).getMonth(), 1),
  );
  const [modo, setModo] = useState<Modo>('dias');

  // Reposiciona no mês da data sempre que o calendário é reaberto
  React.useEffect(() => {
    if (visivel) {
      const base = valor ? new Date(`${valor}T12:00:00`) : new Date();
      setMesExibido(new Date(base.getFullYear(), base.getMonth(), 1));
      setModo('dias');
    }
  }, [visivel, valor]);

  const dias = useMemo(() => {
    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    // Espaços vazios antes do dia 1, para alinhar com o dia da semana
    const celulas: (number | null)[] = Array(primeiroDiaSemana).fill(null);
    for (let dia = 1; dia <= diasNoMes; dia += 1) celulas.push(dia);

    return celulas;
  }, [mesExibido]);

  /** O passo das setas muda conforme o que está sendo escolhido. */
  function navegar(passo: number) {
    setMesExibido((atual) => {
      if (modo === 'dias') return new Date(atual.getFullYear(), atual.getMonth() + passo, 1);
      if (modo === 'meses') return new Date(atual.getFullYear() + passo, atual.getMonth(), 1);
      return new Date(atual.getFullYear() + passo * ANOS_POR_PAGINA, atual.getMonth(), 1);
    });
  }

  /** Primeiro ano da página atual de anos. */
  const anoInicial =
    Math.floor(mesExibido.getFullYear() / ANOS_POR_PAGINA) * ANOS_POR_PAGINA;

  const anosDaPagina = Array.from(
    { length: ANOS_POR_PAGINA },
    (_, i) => anoInicial + i,
  );

  function tituloCabecalho(): string {
    if (modo === 'dias') return `${MESES[mesExibido.getMonth()]} de ${mesExibido.getFullYear()}`;
    if (modo === 'meses') return String(mesExibido.getFullYear());
    return `${anoInicial} — ${anoInicial + ANOS_POR_PAGINA - 1}`;
  }

  function aoTocarTitulo() {
    setModo((atual) => (atual === 'dias' ? 'meses' : atual === 'meses' ? 'anos' : 'dias'));
  }

  function escolher(dia: number, mes = mesExibido.getMonth(), ano = mesExibido.getFullYear()) {
    const iso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    onSelecionar(iso);
    onFechar();
  }

  function estaNoFuturo(dia: number): boolean {
    if (!bloquearFuturo) return false;
    const data = new Date(mesExibido.getFullYear(), mesExibido.getMonth(), dia);
    const limite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    return data > limite;
  }

  function ehSelecionada(dia: number): boolean {
    if (!selecionada) return false;
    return (
      selecionada.getFullYear() === mesExibido.getFullYear() &&
      selecionada.getMonth() === mesExibido.getMonth() &&
      selecionada.getDate() === dia
    );
  }

  function ehHoje(dia: number): boolean {
    return (
      hoje.getFullYear() === mesExibido.getFullYear() &&
      hoje.getMonth() === mesExibido.getMonth() &&
      hoje.getDate() === dia
    );
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={estilos.fundo} onPress={onFechar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View style={estilos.cabecalho}>
            <Pressable onPress={() => navegar(-1)} hitSlop={10} style={estilos.seta}>
              <Ionicons name="chevron-back" size={20} color={cores.primaria} />
            </Pressable>

            {/* Tocar no título alterna entre dias, meses e anos */}
            <Pressable onPress={aoTocarTitulo} hitSlop={8} style={estilos.tituloArea}>
              <Text style={estilos.mesAno}>{tituloCabecalho()}</Text>
              <Ionicons
                name={modo === 'anos' ? 'chevron-up' : 'chevron-down'}
                size={15}
                color={cores.textoSecundario}
              />
            </Pressable>

            <Pressable onPress={() => navegar(1)} hitSlop={10} style={estilos.seta}>
              <Ionicons name="chevron-forward" size={20} color={cores.primaria} />
            </Pressable>
          </View>

          {modo === 'meses' && (
            <View style={estilos.gradeBlocos}>
              {MESES_CURTOS.map((nome, indice) => {
                const atual =
                  indice === mesExibido.getMonth() ||
                  (!!selecionada &&
                    selecionada.getMonth() === indice &&
                    selecionada.getFullYear() === mesExibido.getFullYear());

                return (
                  <Pressable
                    key={nome}
                    onPress={() => {
                      setMesExibido(new Date(mesExibido.getFullYear(), indice, 1));
                      setModo('dias');
                    }}
                    style={({ pressed }) => [
                      estilos.bloco,
                      atual && estilos.blocoAtivo,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={[estilos.blocoTexto, atual && estilos.blocoTextoAtivo]}>
                      {nome}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {modo === 'anos' && (
            <View style={estilos.gradeBlocos}>
              {anosDaPagina.map((ano) => {
                const atual = ano === mesExibido.getFullYear();
                const indisponivel = bloquearFuturo && ano > hoje.getFullYear();

                return (
                  <Pressable
                    key={ano}
                    disabled={indisponivel}
                    onPress={() => {
                      setMesExibido(new Date(ano, mesExibido.getMonth(), 1));
                      setModo('meses');
                    }}
                    style={({ pressed }) => [
                      estilos.bloco,
                      atual && estilos.blocoAtivo,
                      pressed && !indisponivel && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        estilos.blocoTexto,
                        atual && estilos.blocoTextoAtivo,
                        indisponivel && estilos.diaTextoIndisponivel,
                      ]}
                    >
                      {ano}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {modo === 'dias' && (
          <View style={estilos.semana}>
            {DIAS_SEMANA.map((letra, i) => (
              <Text key={`${letra}-${i}`} style={estilos.diaSemana}>
                {letra}
              </Text>
            ))}
          </View>
          )}

          {modo === 'dias' && (
          <View style={estilos.grade}>
            {dias.map((dia, indice) => {
              if (dia === null) {
                return <View key={`vazio-${indice}`} style={estilos.celula} />;
              }

              const indisponivel = estaNoFuturo(dia);
              const selecionado = ehSelecionada(dia);

              return (
                <Pressable
                  key={dia}
                  disabled={indisponivel}
                  onPress={() => escolher(dia)}
                  style={({ pressed }) => [
                    estilos.celula,
                    selecionado && estilos.celulaSelecionada,
                    !selecionado && ehHoje(dia) && estilos.celulaHoje,
                    pressed && !indisponivel && { opacity: 0.6 },
                  ]}
                >
                  <Text
                    style={[
                      estilos.diaTexto,
                      selecionado && estilos.diaTextoSelecionado,
                      indisponivel && estilos.diaTextoIndisponivel,
                    ]}
                  >
                    {dia}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          )}

          <View style={estilos.rodape}>
            <Pressable onPress={onFechar} hitSlop={8}>
              <Text style={estilos.acaoSecundaria}>Cancelar</Text>
            </Pressable>

            {atalhoHoje && (
              <Pressable
                onPress={() => {
                  const agora = new Date();
                  escolher(agora.getDate(), agora.getMonth(), agora.getFullYear());
                }}
                hitSlop={8}
              >
                <Text style={estilos.acaoPrincipal}>Hoje</Text>
              </Pressable>
            )}
          </View>
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
    padding: espacamentos.lg,
  },
  painel: {
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    maxWidth: 340,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamentos.sm,
  },
  seta: {
    width: 34,
    height: 34,
    borderRadius: raios.pill,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloArea: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  mesAno: { ...tipografia.subtitulo, color: cores.textoPrincipal, fontSize: 15 },
  gradeBlocos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: espacamentos.xs,
  },
  bloco: {
    width: `${100 / 3}%`,
    paddingVertical: espacamentos.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
  },
  blocoAtivo: { backgroundColor: cores.primariaSuave },
  blocoTexto: { color: cores.textoPrincipal, fontSize: 14, fontWeight: '600' },
  blocoTextoAtivo: { color: cores.primaria, fontWeight: '800' },
  semana: { flexDirection: 'row', marginBottom: 4 },
  diaSemana: {
    flex: 1,
    textAlign: 'center',
    color: cores.textoSuave,
    fontSize: 11,
    fontWeight: '700',
  },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.pill,
  },
  celulaSelecionada: { backgroundColor: cores.primaria },
  celulaHoje: { borderWidth: 1, borderColor: cores.primariaSuave },
  diaTexto: { color: cores.textoPrincipal, fontSize: 14 },
  diaTextoSelecionado: { color: '#04261C', fontWeight: '800' },
  diaTextoIndisponivel: { color: cores.textoSuave, opacity: 0.4 },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: espacamentos.sm,
    paddingTop: espacamentos.sm,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  acaoSecundaria: { color: cores.textoSecundario, fontSize: 14, fontWeight: '600' },
  acaoPrincipal: { color: cores.primaria, fontSize: 14, fontWeight: '700' },
});
