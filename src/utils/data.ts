/**
 * Conversões entre o formato usado pela API (AAAA-MM-DD) e o formato
 * brasileiro exibido ao usuário (DD/MM/AAAA).
 */

/** ISO (2017-03-14) para brasileiro (14/03/2017). */
export function isoParaBr(iso: string | null | undefined): string {
  if (!iso) return '';
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  if (!ano || !mes || !dia) return '';
  return `${dia}/${mes}/${ano}`;
}

/** Brasileiro (14/03/2017) para ISO (2017-03-14). Vazio quando incompleto. */
export function brParaIso(br: string | null | undefined): string {
  if (!br) return '';
  const [dia, mes, ano] = br.split('/');
  if (!dia || !mes || !ano || ano.length !== 4) return '';
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

/** Aplica a máscara DD/MM/AAAA conforme o usuário digita. */
export function mascaraData(texto: string): string {
  const numeros = texto.replace(/\D/g, '').slice(0, 8);

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

/** Verifica se a data brasileira informada existe de fato no calendário. */
export function dataBrValida(br: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(br)) return false;

  const [dia, mes, ano] = br.split('/').map(Number);
  const data = new Date(ano, mes - 1, dia);

  return (
    data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
  );
}
