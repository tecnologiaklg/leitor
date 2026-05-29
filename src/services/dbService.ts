import { supabase } from './supabase';
import type { StockItem } from '../utils/helpers';

export const saveRelatorio = async (items: StockItem[]) => {
  if (!items || items.length === 0) return null;

  try {
    // 1. Criar o relatório principal
    const { data: relatorioData, error: relatorioError } = await supabase
      .from('relatorios')
      .insert([
        { 
          data_criacao: new Date().toISOString(),
          quantidade_itens: items.length
        }
      ])
      .select()
      .single();

    if (relatorioError) throw relatorioError;

    // 2. Inserir os itens vinculados ao relatório
    const itemsToInsert = items.map(item => ({
      relatorio_id: relatorioData.id,
      codigo_item: item.codigo,
      lote: item.lote,
      quantidade: item.quantidade,
      hora: item.dataHora,
      local_guardado: item.local
    }));

    const { error: itemsError } = await supabase
      .from('itens_relatorio')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return true;
  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error);
    throw error;
  }
};

export const getRelatorios = async () => {
  try {
    const { data, error } = await supabase
      .from('relatorios')
      .select('*')
      .order('data_criacao', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    throw error;
  }
};

export const getRelatorioItens = async (relatorioId: string) => {
  try {
    const { data, error } = await supabase
      .from('itens_relatorio')
      .select('*')
      .eq('relatorio_id', relatorioId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar itens do relatório:', error);
    throw error;
  }
};
