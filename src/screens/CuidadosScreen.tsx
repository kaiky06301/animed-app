import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { useAnimed } from '../state/AnimedContext';
import { cores, espacamentos, raios } from '../theme/cores';
import { PONTOS, type AcaoPontuavel } from '../utils/nivel';

interface AcaoCuidado {
  acao: AcaoPontuavel;
  titulo: string;
  descricao: string;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
}

const ACOES: AcaoCuidado[] = [
  { acao: 'registrarVacina', titulo: 'Vacina aplicada', descricao: 'Registre a vacinação do seu pet', icone: 'medical', cor: cores.primaria },
  { acao: 'registrarMedicacao', titulo: 'Medicação dada', descricao: 'Mantenha o controle de doses', icone: 'flask', cor: cores.laranja },
  { acao: 'registrarConsulta', titulo: 'Consulta no veterinário', descricao: 'Anote consultas realizadas', icone: 'people', cor: cores.dourado },
  { acao: 'checkupRealizado', titulo: 'Check-up preventivo', descricao: 'Cuidado proativo dá mais pontos', icone: 'fitness', cor: cores.primaria },
  { acao: 'atualizarPeso', titulo: 'Pesagem registrada', descricao: 'Atualize o peso regularmente', icone: 'speedometer', cor: cores.laranja },
  { acao: 'agendamento', titulo: 'Agendou consulta', descricao: 'Planejou cuidado futuro', icone: 'calendar', cor: cores.dourado },
];

export function CuidadosScreen() {
  const { registrarAcao, pet } = useAnimed();
  const [ultimo, setUltimo] = useState<{ titulo: string; pontos: number } | null>(null);

  function disparar(item: AcaoCuidado) {
    const ganho = registrarAcao(item.acao);
    setUltimo({ titulo: item.titulo, pontos: ganho });
  }

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Cuidados</Text>
      <Text style={estilos.subtitulo}>
        Cada ação de cuidado vira pontos. Registre o que aconteceu com{' '}
        <Text style={{ color: cores.primaria, fontWeight: '700' }}>
          {pet?.nome ?? 'seu pet'}
        </Text>
        .
      </Text>

      {ultimo && (
        <Cartao realce>
          <Text style={{ color: cores.primaria, fontWeight: '700' }}>
            +{ultimo.pontos} pts · {ultimo.titulo}
          </Text>
          <Text style={{ color: cores.textoSecundario, marginTop: 4, fontSize: 12 }}>
            Registrado agora · veja no Histórico.
          </Text>
        </Cartao>
      )}

      <View style={{ gap: espacamentos.md }}>
        {ACOES.map((item) => (
          <Cartao key={item.acao}>
            <View style={estilos.linha}>
              <View style={[estilos.icone, { backgroundColor: item.cor + '22' }]}>
                <Ionicons name={item.icone} size={22} color={item.cor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={estilos.linhaTitulo}>
                  <Text style={estilos.tituloAcao}>{item.titulo}</Text>
                  <Text style={estilos.tag}>+{PONTOS[item.acao]} pts</Text>
                </View>
                <Text style={estilos.descAcao}>{item.descricao}</Text>
              </View>
            </View>
            <Botao
              titulo="Registrar"
              variante="sutil"
              onPress={() => disparar(item)}
              estilo={{ marginTop: espacamentos.md }}
            />
          </Cartao>
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.lg, paddingBottom: espacamentos.xxl, gap: espacamentos.md },
  titulo: { color: cores.textoPrincipal, fontSize: 24, fontWeight: '700' },
  subtitulo: { color: cores.textoSecundario, fontSize: 13 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.md },
  linhaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icone: {
    width: 44,
    height: 44,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloAcao: { color: cores.textoPrincipal, fontSize: 15, fontWeight: '700', flex: 1 },
  descAcao: { color: cores.textoSecundario, fontSize: 12, marginTop: 2 },
  tag: {
    color: cores.primaria,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: cores.primariaSuave,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: raios.pill,
    overflow: 'hidden',
  },
});
