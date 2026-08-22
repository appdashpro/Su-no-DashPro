import { supabase } from './supabase';

/**
 * Gera o próximo ID sequencial no padrão UUID padronizado:
 * 00000000-0000-0000-0000-000000000001
 * 00000000-0000-0000-0000-000000000002
 * ...
 * 00000000-0000-0000-0000-000000000004
 */
export async function generateNextEmpresaId(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('id');

    if (error || !data || data.length === 0) {
      return '00000000-0000-0000-0000-000000000001';
    }

    let maxSeq = 0;
    const pattern = /^00000000-0000-0000-0000-(\d{12})$/;

    for (const row of data) {
      if (typeof row.id === 'string') {
        const match = row.id.match(pattern);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    }

    const nextSeq = maxSeq + 1;
    const padded = String(nextSeq).padStart(12, '0');
    return `00000000-0000-0000-0000-${padded}`;
  } catch (err) {
    console.warn('Erro ao gerar ID sequencial de empresa, gerando fallback:', err);
    return '00000000-0000-0000-0000-000000000099';
  }
}
