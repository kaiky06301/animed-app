import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacamentos, raios, tipografia } from '../theme/cores';

interface Props {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  /** Texto do botão que confirma. Diga o que vai acontecer, não "OK". */
  rotuloConfirmar?: string;
  /** Ação sem volta pinta o botão de vermelho. */
  destrutiva?: boolean;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Confirmação de uma ação, no visual do aplicativo.
 *
 * O `Alert` do React Native vira `window.confirm` na web, e o navegador
 * desenha uma caixa cinza com o endereço do site no título — que destoa do
 * restante e entrega que aquilo não é um aplicativo. Esta janela tem o mesmo
 * comportamento e a aparência do Animed em qualquer plataforma.
 */
export function ConfirmarAcao({
  visivel,
  titulo,
  mensagem,
  rotuloConfirmar = 'Confirmar',
  destrutiva = false,
  carregando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <Pressable style={estilos.fundo} onPress={onCancelar}>
        <Pressable style={estilos.painel} onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              estilos.selo,
              { backgroundColor: destrutiva ? 'rgba(255,107,107,0.14)' : cores.primariaSuave },
            ]}
          >
            <Ionicons
              name={destrutiva ? 'trash' : 'help-circle'}
              size={22}
              color={destrutiva ? cores.erro : cores.primaria}
            />
          </View>

          <Text style={estilos.titulo}>{titulo}</Text>
          <Text style={estilos.mensagem}>{mensagem}</Text>

          <View style={estilos.acoes}>
            <Pressable
              onPress={onCancelar}
              style={({ pressed }) => [estilos.botao, estilos.cancelar, pressed && estilos.tocado]}
            >
              <Text style={estilos.cancelarTexto}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={onConfirmar}
              disabled={carregando}
              style={({ pressed }) => [
                estilos.botao,
                destrutiva ? estilos.destrutiva : estilos.confirmar,
                pressed && estilos.tocado,
              ]}
            >
              <Text style={destrutiva ? estilos.destrutivaTexto : estilos.confirmarTexto}>
                {carregando ? 'Aguarde…' : rotuloConfirmar}
              </Text>
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
    padding: espacamentos.md,
  },
  painel: {
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.lg,
    maxWidth: 380,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },

  selo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamentos.sm,
  },
  titulo: {
    ...tipografia.subtitulo,
    color: cores.textoPrincipal,
    textAlign: 'center',
  },
  mensagem: {
    fontSize: 13,
    color: cores.textoSecundario,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 4,
  },

  acoes: {
    flexDirection: 'row',
    gap: espacamentos.xs,
    marginTop: espacamentos.lg,
    width: '100%',
  },
  botao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: raios.md,
    alignItems: 'center',
  },
  tocado: { opacity: 0.85 },

  cancelar: { borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.superficie },
  cancelarTexto: { fontSize: 14, fontWeight: '700', color: cores.textoSecundario },

  confirmar: { backgroundColor: cores.primaria },
  confirmarTexto: { fontSize: 14, fontWeight: '800', color: '#06281F' },

  destrutiva: { backgroundColor: cores.erro },
  destrutivaTexto: { fontSize: 14, fontWeight: '800', color: '#3B0A0A' },
});
