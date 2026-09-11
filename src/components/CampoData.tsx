import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { brParaIso, dataBrValida, isoParaBr, mascaraData } from '../utils/data';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

interface Props {
  rotulo: string;
  /** Valor em ISO (AAAA-MM-DD), como a API espera. */
  valor: string;
  onChange: (iso: string) => void;
  erro?: string | null;
  iconeRotulo?: keyof typeof Ionicons.glyphMap;
  icone?: keyof typeof Ionicons.glyphMap;
  /** Impede escolher datas futuras (ex.: nascimento). */
  bloquearFuturo?: boolean;
}

/**
 * Campo de data no formato brasileiro, com digitação assistida e
 * calendário. No navegador usa o seletor nativo do próprio browser;
 * no celular, o calendário do sistema.
 */
export function CampoData({
  rotulo,
  valor,
  onChange,
  erro,
  iconeRotulo = 'calendar-outline',
  icone,
  bloquearFuturo = false,
}: Props) {
  const [texto, setTexto] = useState(isoParaBr(valor));
  const [calendarioAberto, setCalendarioAberto] = useState(false);

  // Mantém o texto sincronizado quando o valor muda por fora (ex.: calendário)
  React.useEffect(() => {
    setTexto(isoParaBr(valor));
  }, [valor]);

  function aoDigitar(entrada: string) {
    const mascarado = mascaraData(entrada);
    setTexto(mascarado);

    if (mascarado.length === 10 && dataBrValida(mascarado)) {
      onChange(brParaIso(mascarado));
    } else if (mascarado.length === 0) {
      onChange('');
    }
  }

  function abrirCalendario() {
    setCalendarioAberto(true);
  }

  /**
   * No navegador, o seletor nativo é um campo de data transparente
   * sobreposto ao ícone — assim o calendário abre ancorado nele, e não
   * no canto da janela.
   */
  const seletorWeb =
    Platform.OS === 'web'
      ? React.createElement('input', {
          type: 'date',
          value: valor || '',
          max: bloquearFuturo ? new Date().toISOString().slice(0, 10) : undefined,
          onChange: (e: { target: { value: string } }) => {
            if (e.target.value) onChange(e.target.value);
          },
          style: {
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
            border: 'none',
            padding: 0,
          },
        })
      : null;

  const dataSelecionada = valor ? new Date(`${valor}T12:00:00`) : new Date();

  return (
    <View style={estilos.container}>
      <View style={estilos.linhaRotulo}>
        <Ionicons name={iconeRotulo} size={14} color={cores.textoSuave} />
        <Text style={estilos.rotulo}>{rotulo}</Text>
      </View>

      <View style={[estilos.campo, !!erro && estilos.campoComErro]}>
        {!!icone && <Ionicons name={icone} size={17} color={cores.textoSuave} />}

        <TextInput
          value={texto}
          onChangeText={aoDigitar}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={cores.textoSuave}
          keyboardType="number-pad"
          maxLength={10}
          style={estilos.entrada}
        />

        <View style={estilos.areaCalendario}>
          <Pressable
            onPress={Platform.OS === 'web' ? undefined : abrirCalendario}
            hitSlop={10}
          >
            <Ionicons name="calendar" size={19} color={cores.primaria} />
          </Pressable>
          {seletorWeb}
        </View>
      </View>

      {!!erro && <Text style={estilos.erro}>{erro}</Text>}

      {calendarioAberto && Platform.OS !== 'web' && (
        <DateTimePicker
          value={dataSelecionada}
          mode="date"
          display="spinner"
          maximumDate={bloquearFuturo ? new Date() : undefined}
          onChange={(_evento, data) => {
            setCalendarioAberto(false);
            if (data) onChange(data.toISOString().slice(0, 10));
          }}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { marginBottom: espacamentos.md },
  linhaRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: espacamentos.xs,
  },
  rotulo: { ...tipografia.legenda, color: cores.textoSecundario },
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
  campoComErro: { borderColor: cores.erro },
  entrada: { flex: 1, color: cores.textoPrincipal, fontSize: 15, padding: 0 },
  areaCalendario: { position: 'relative', justifyContent: 'center' },
  erro: { ...tipografia.legenda, color: cores.erro, marginTop: espacamentos.xs },
});
