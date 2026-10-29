const { execSync } = require('child_process');

/**
 * Commit de onde o app foi gerado, exibido na tela "Sobre o App".
 *
 * No servidor do EAS Build a variável EAS_BUILD_GIT_COMMIT_HASH já vem
 * preenchida; na máquina local o hash é lido direto do git.
 */
function commitAtual() {
  if (process.env.EAS_BUILD_GIT_COMMIT_HASH) return process.env.EAS_BUILD_GIT_COMMIT_HASH;
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch {
    return 'desconhecido';
  }
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    commit: commitAtual(),
  },
});
