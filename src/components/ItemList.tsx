import React, { useState } from 'react'
import type { StockItem } from '../utils/helpers'

interface ItemListProps {
  items: StockItem[]
  onRemoveItem: (id: string) => void
}

const ItemList: React.FC<ItemListProps> = ({ items, onRemoveItem }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      item.codigo.toLowerCase().includes(q) ||
      item.lote.toLowerCase().includes(q) ||
      item.local.toLowerCase().includes(q)
    )
  })

  return (
    <div className="items-section">
      <div className="items-header">
        <h2 className="items-title">📋 Itens Registrados</h2>
        <span className="items-count">{items.length}</span>
      </div>

      {items.length > 0 && (
        <div className="search-bar">
          <input
            type="text"
            className="input"
            placeholder="🔍 Buscar código, lote ou local…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <p className="empty-state__text">
            Nenhum item registrado ainda.
            <br />
            Escaneie um produto para começar!
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <p className="empty-state__text">
            Nenhum resultado para "{searchQuery}"
          </p>
        </div>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="item-card">
            <button
              className="item-card__delete"
              onClick={() => onRemoveItem(item.id)}
              title="Remover item"
            >
              ✕
            </button>

            <div className="item-card__row">
              <span className="item-card__icon">📦</span>
              <span className="item-card__label">Cód</span>
              <span className="item-card__value">{item.codigo}</span>
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
              <span className="item-card__value">{item.local}</span>
            </div>

            <div className="item-card__row">
              <span className="item-card__icon">🕐</span>
              <span className="item-card__label">Data</span>
              <span className="item-card__value" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {item.dataHora}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default ItemList
