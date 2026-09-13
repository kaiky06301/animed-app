import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { mensagemDoErro } from '../../api/cliente';
import { CadastrarPessoa } from '../../components/CadastrarPessoa';
import { CampoTexto } from '../../components/CampoTexto';
import { useMudarAcesso, useUsuarios } from '../../hooks/useUsuarios';
import type { UsuarioDaClinica } from '../../services/usuarioService';
import { cores, espacamentos, raios, tipografia } from '../../theme/cores';

/** Nulo significa sem recorte: a lista mostra todo mundo. */
type Filtro = 'DOUTOR' | 'TUTOR' | null;

const FILTROS: {
  chave: Exclude<Filtro, null>;
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
}[] = [
  { chave: 'DOUTOR', rotulo: 'Veterinários', icone: 'medkit' },
  { chave: 'TUTOR', rotulo: 'Tutores', icone: 'person' },
];

/**
 * Quem tem acesso ao sistema da clínica.
 *
 * A tela mostra o que interessa no dia a dia — quem entra e o que cada um pode
 * fazer — e deixa o cadastro atrás de um botão: a maior parte das visitas aqui
 * é para conferir ou suspender um acesso, não para criar conta nova.
 */
export function CadastrarPessoaScreen() {
  const { data: usuarios, isLoading } = useUsuarios();
  const mudarAcesso = useMudarAcesso();

  const [cadastrando, setCadastrando] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const ativos = (usuarios ?? []).filter((u) => u.ativo).length;

  const encontrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return (usuarios ?? []).filter((usuario) => {
      if (filtro && usuario.role !== filtro) return false;
      if (!termo) return true;

      return (
        usuario.nome.toLowerCase().includes(termo)
        || usuario.email.toLowerCase().includes(termo)
      );
    });
  }, [usuarios, busca, filtro]);

  const veterinarios = encontrados.filter((u) => u.role === 'DOUTOR');
  const tutores = encontrados.filter((u) => u.role === 'TUTOR');

  /**
   * Liga ou desliga o acesso de alguém.
   *
   * A conta não é apagada: o histórico clínico que a pessoa produziu continua
   * com autoria. Regras como "não desativar a si mesmo" vivem na API.
   */
  async function alternarAcesso(usuario: UsuarioDaClinica, ligado: boolean) {
    setErro(null);
    setAviso(null);

    try {
      await mudarAcesso.mutateAsync({ id: usuario.id, ativo: ligado });
      setAviso(`Acesso de ${usuario.nome} ${ligado ? 'liberado' : 'desligado'}.`);
    } catch (e) {
      setErro(mensagemDoErro(e, 'Não foi possível alterar o acesso'));
    }
  }

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cabecalho}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.subtitulo}>Área do veterinário</Text>
          <Text style={estilos.titulo}>Acessos</Text>
          <Text style={estilos.contagem}>
            {ativos} de {usuarios?.length ?? 0} contas ativas
          </Text>
        </View>

        <Pressable
          onPress={() => setCadastrando(true)}
          style={({ pressed }) => [estilos.botaoCadastrar, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="person-add" size={16} color="#06281F" />
          <Text style={estilos.botaoCadastrarTexto}>Cadastrar</Text>
        </Pressable>
      </View>

      <CampoTexto
        rotulo=""
        icone="search"
        placeholder="Buscar por nome ou e-mail"
        value={busca}
        onChangeText={setBusca}
        autoCapitalize="none"
      />

      {/* Recortes da lista: o filtro sem ninguém não vira botão morto */}
      <View style={estilos.filtros}>
        {FILTROS.map((opcao) => {
          const total = (usuarios ?? []).filter((u) => u.role === opcao.chave).length;
          if (total === 0) return null;

          const ativo = filtro === opcao.chave;

          return (
            <Pressable
              key={opcao.chave}
              onPress={() => setFiltro(ativo ? null : opcao.chave)}
              style={({ pressed }) => [
                estilos.filtro,
                ativo && estilos.filtroAtivo,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons
                name={opcao.icone}
                size={14}
                color={ativo ? cores.primaria : cores.textoSecundario}
              />
              <Text style={[estilos.filtroTexto, ativo && estilos.filtroTextoAtivo]}>
                {opcao.rotulo}
              </Text>
              <View style={[estilos.filtroSelo, ativo && estilos.filtroSeloAtivo]}>
                <Text style={[estilos.filtroNumero, ativo && estilos.filtroTextoAtivo]}>
                  {total}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {!!aviso && (
        <View style={estilos.avisoOk}>
          <Ionicons name="checkmark-circle" size={17} color={cores.primaria} />
          <Text style={estilos.avisoOkTexto}>{aviso}</Text>
        </View>
      )}

      {!!erro && (
        <View style={estilos.avisoErro}>
          <Ionicons name="alert-circle" size={17} color={cores.erro} />
          <Text style={estilos.avisoErroTexto}>{erro}</Text>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator color={cores.primaria} style={{ marginTop: espacamentos.xl }} />
      ) : (
        <>
          {veterinarios.length > 0 && (
            <>
              <Secao titulo="Corpo clínico" quantidade={veterinarios.length} />
              {veterinarios.map((usuario) => (
                <Pessoa
                  key={usuario.id}
                  usuario={usuario}
                  ocupado={mudarAcesso.isPending}
                  onAlternar={alternarAcesso}
                />
              ))}
            </>
          )}

          {tutores.length > 0 && (
            <>
              <Secao titulo="Tutores" quantidade={tutores.length} />
              {tutores.map((usuario) => (
                <Pessoa
                  key={usuario.id}
                  usuario={usuario}
                  ocupado={mudarAcesso.isPending}
                  onAlternar={alternarAcesso}
                />
              ))}
            </>
          )}

          {encontrados.length === 0 && (
            <View style={estilos.vazio}>
              <Ionicons name="search" size={30} color={cores.textoSuave} />
              <Text style={estilos.vazioTexto}>
                Nenhuma conta encontrada para esta busca.
              </Text>
            </View>
          )}
        </>
      )}

      <CadastrarPessoa
        visivel={cadastrando}
        onFechar={() => setCadastrando(false)}
        onCadastrado={(mensagem) => {
          setAviso(mensagem);
          setErro(null);
        }}
      />
    </ScrollView>
  );
}

function Secao({ titulo, quantidade }: { titulo: string; quantidade: number }) {
  return (
    <View style={estilos.secao}>
      <Text style={estilos.secaoTitulo}>{titulo}</Text>
      <Text style={estilos.secaoQuantidade}>{quantidade}</Text>
    </View>
  );
}

function Pessoa({
  usuario,
  ocupado,
  onAlternar,
}: {
  usuario: UsuarioDaClinica;
  ocupado: boolean;
  onAlternar: (usuario: UsuarioDaClinica, ligado: boolean) => void;
}) {
  const ehVeterinario = usuario.role === 'DOUTOR';

  return (
    <View style={[estilos.pessoa, !usuario.ativo && estilos.pessoaInativa]}>
      <View
        style={[
          estilos.selo,
          { backgroundColor: ehVeterinario ? cores.primariaSuave : cores.superficieAlt },
        ]}
      >
        <Ionicons
          name={ehVeterinario ? 'medkit' : 'person'}
          size={17}
          color={ehVeterinario ? cores.primaria : cores.textoSecundario}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={estilos.pessoaNome}>{usuario.nome}</Text>
        <Text style={estilos.pessoaEmail}>{usuario.email}</Text>

        <Text style={estilos.pessoaDetalhe}>
          {!ehVeterinario && `${usuario.pets} ${usuario.pets === 1 ? 'pet' : 'pets'}`}
          {!ehVeterinario && !usuario.ativo && ' · '}
          {!usuario.ativo && 'acesso desligado'}
        </Text>
      </View>

      <Switch
        value={usuario.ativo}
        onValueChange={(ligado) => onAlternar(usuario, ligado)}
        disabled={ocupado}
        trackColor={{ false: cores.superficieAlt, true: cores.primariaSuave }}
        thumbColor={usuario.ativo ? cores.primaria : cores.textoSuave}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamentos.md, paddingBottom: espacamentos.xxl },

  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.sm },
  subtitulo: { color: cores.primaria, fontSize: 12, fontWeight: '700' },
  titulo: { ...tipografia.titulo, color: cores.textoPrincipal },
  contagem: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },

  botaoCadastrar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: 10,
    borderRadius: raios.md,
    backgroundColor: cores.primaria,
    marginTop: 4,
  },
  botaoCadastrarTexto: { fontSize: 13, fontWeight: '800', color: '#06281F' },

  avisoOk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.xs,
    backgroundColor: cores.primariaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginTop: espacamentos.md,
  },
  avisoOkTexto: { flex: 1, fontSize: 13, color: cores.primaria, lineHeight: 18 },

  avisoErro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.xs,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderRadius: raios.md,
    padding: espacamentos.sm + 2,
    marginTop: espacamentos.md,
  },
  avisoErroTexto: { flex: 1, fontSize: 13, color: cores.erro, lineHeight: 18 },

  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: espacamentos.xs,
  },
  filtro: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: 8,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  filtroAtivo: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  filtroTexto: { fontSize: 12, fontWeight: '700', color: cores.textoSecundario },
  filtroTextoAtivo: { color: cores.primaria },
  filtroSelo: {
    minWidth: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
  },
  filtroSeloAtivo: { backgroundColor: 'transparent' },
  filtroNumero: { fontSize: 11, fontWeight: '800', color: cores.textoSuave },

  vazio: { alignItems: 'center', gap: espacamentos.sm, paddingVertical: espacamentos.xl },
  vazioTexto: { fontSize: 13, color: cores.textoSecundario, textAlign: 'center' },

  secao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.xs,
    marginTop: espacamentos.lg,
    marginBottom: espacamentos.sm,
  },
  secaoTitulo: { fontSize: 13, fontWeight: '700', color: cores.textoSecundario, flex: 1 },
  secaoQuantidade: { fontSize: 12, color: cores.textoSuave },

  pessoa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    backgroundColor: cores.fundoElevado,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.sm + 2,
    marginBottom: espacamentos.xs,
  },
  // Conta desligada continua na lista, apagada: some do sistema, não do histórico
  pessoaInativa: { opacity: 0.55 },
  selo: {
    width: 36,
    height: 36,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pessoaNome: { fontSize: 14, fontWeight: '700', color: cores.textoPrincipal },
  pessoaEmail: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
  pessoaDetalhe: { fontSize: 11, color: cores.textoSuave, marginTop: 2 },
});
