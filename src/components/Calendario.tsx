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
}

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

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
}: Props) {
  const selecionada = valor ? new Date(`${valor}T12:00:00`) : null;
  const hoje = new Date();

  const [mesExibido, setMesExibido] = useState(
    () => new Date((selecionada ?? hoje).getFullYear(), (selecionada ?? hoje).getMonth(), 1),
  );

  // Reposiciona no mês da data sempre que o calendário é reaberto
  React.useEffect(() => {
    if (visivel) {
      const base = valor ? new Date(`${valor}T12:00:00`) : new Date();
      setMesExibido(new Date(base.getFullYear(), base.getMonth(), 1));
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

  function mudarMes(passo: number) {
    setMesExibido((atual) => new Date(atual.getFullYear(), atual.getMonth() + passo, 1));
  }

  function escolher(dia: number) {
    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();
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
            <Pressable onPress={() => mudarMes(-1)} hitSlop={10} style={estilos.seta}>
              <Ionicons name="chevron-back" size={20} color={cores.primaria} />
            </Pressable>

            <Text style={estilos.mesAno}>
              {MESES[mesExibido.getMonth()]} de {mesExibido.getFullYear()}
            </Text>

            <Pressable onPress={() => mudarMes(1)} hitSlop={10} style={estilos.seta}>
              <Ionicons name="chevron-forward" size={20} color={cores.primaria} />
            </Pressable>
          </View>

          <View style={estilos.semana}>
            {DIAS_SEMANA.map((letra, i) => (
              <Text key={`${letra}-${i}`} style={estilos.diaSemana}>
                {letra}
              </Text>
            ))}
          </View>

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

          <View style={estilos.rodape}>
            <Pressable onPress={onFechar} hitSlop={8}>
              <Text style={estilos.acaoSecundaria}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                const agora = new Date();
                escolher(agora.getDate());
                setMesExibido(new Date(agora.getFullYear(), agora.getMonth(), 1));
              }}
              hitSlop={8}
            >
              <Text style={estilos.acaoPrincipal}>Hoje</Text>
            </Pressable>
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
  mesAno: { ...tipografia.subtitulo, color: cores.textoPrincipal, fontSize: 15 },
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
    marginTop: espacamentos.sm,
    paddingTop: espacamentos.sm,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  acaoSecundaria: { color: cores.textoSecundario, fontSize: 14, fontWeight: '600' },
  acaoPrincipal: { color: cores.primaria, fontSize: 14, fontWeight: '700' },
});
