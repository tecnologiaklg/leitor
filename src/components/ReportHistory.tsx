import React, { useEffect, useState } from 'react';
import { getRelatorios, getRelatorioItens } from '../services/dbService';
import { showToast } from './Toast';

interface Relatorio {
  id: string;
  data_criacao: string;
  quantidade_itens: number;
}

interface ItemRelatorio {
  id: string;
  codigo_item: string;
  lote: string;
  quantidade: number;
  hora: string;
  local_guardado: string;
}

const ReportHistory: React.FC = () => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<string, ItemRelatorio[]>>({});
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    setLoading(true);
    try {
      const data = await getRelatorios();
      setRelatorios(data || []);
    } catch (error: any) {
      const errorMsg = error?.message || JSON.stringify(error) || 'Erro desconhecido';
      showToast(`Erro ao carregar: ${errorMsg}`, 'error', '❌');
      console.error("Detalhes do erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null); // Fecha se clicar novamente
      return;
    }
    
    setExpandedId(id);
    
    // Se já temos os itens salvos no cache, não busca de novo
    if (itemsMap[id]) return;

    setLoadingItems(prev => ({ ...prev, [id]: true }));
    try {
      const items = await getRelatorioItens(id);
      setItemsMap(prev => ({ ...prev, [id]: items || [] }));
    } catch (error) {
      showToast('Erro ao carregar itens deste relatório.', 'error', '❌');
    } finally {
      setLoadingItems(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="card text-center" style={{ padding: 'var(--space-6)' }}>
        <p>⏳ Carregando relatórios...</p>
      </div>
    );
  }

  if (relatorios.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📂</div>
        <p className="empty-state__text">Nenhum relatório salvo no banco ainda.</p>
      </div>
    );
  }

  return (
    <div className="items-section">
      <div className="items-header">
        <h2 className="items-title">📂 Histórico de Relatórios</h2>
        <span className="items-count">{relatorios.length}</span>
      </div>

      {relatorios.map((rel) => {
        const dateObj = new Date(rel.data_criacao);
        const formattedDate = dateObj.toLocaleDateString('pt-BR');
        const formattedTime = dateObj.toLocaleTimeString('pt-BR');
        const isExpanded = expandedId === rel.id;
        const items = itemsMap[rel.id] || [];
        const isLoadingItems = loadingItems[rel.id];

        return (
          <div key={rel.id} className={`card ${isExpanded ? 'card--active' : ''}`} style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)' }}>
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleExpand(rel.id)}
            >
              <div>
                <strong style={{ display: 'block', fontSize: 'var(--font-size-lg)' }}>📅 {formattedDate} às {formattedTime}</strong>
                <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>ID: {rel.id}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="items-count" style={{ display: 'inline-block', marginBottom: 'var(--space-1)' }}>
                  {rel.quantidade_itens} itens
                </span>
                <div style={{ color: 'var(--color-primary)' }}>
                  {isExpanded ? '▲ Ocultar' : '▼ Ver itens'}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                {isLoadingItems ? (
                  <p className="text-center text-muted">Carregando itens...</p>
                ) : items.length === 0 ? (
                  <p className="text-center text-muted">Nenhum item encontrado.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {items.map(item => (
                      <div key={item.id} className="item-card" style={{ marginBottom: 0 }}>
                        <div className="item-card__row">
                          <span className="item-card__icon">📦</span>
                          <span className="item-card__label">Cód</span>
                          <span className="item-card__value">{item.codigo_item}</span>
                        </div>
                        <div className="item-card__row">
                          <span className="item-card__icon">🏷️</span>
                          <span className="item-card__label">Lote</span>
                          <span className="item-card__value">{item.lote || '—'}</span>
                        </div>
                        <div className="item-card__row">
                          <span className="item-card__icon">🔢</span>
                          <span className="item-card__label">Qtd</span>
                          <span className="item-card__value">{item.quantidade}</span>
                        </div>
                        <div className="item-card__row">
                          <span className="item-card__icon">📍</span>
                          <span className="item-card__label">Local</span>
                          <span className="item-card__value">{item.local_guardado}</span>
                        </div>
                        <div className="item-card__row">
                          <span className="item-card__icon">🕐</span>
                          <span className="item-card__label">Data</span>
                          <span className="item-card__value" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            {item.hora}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReportHistory;
