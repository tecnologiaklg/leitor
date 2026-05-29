import React, { useState, useCallback } from 'react'
import Scanner from './components/Scanner'
import ItemList from './components/ItemList'
import Toast, { showToast } from './components/Toast'
import ConfirmDialog from './components/ConfirmDialog'
import { parseQRData, generateId, formatDateTime } from './utils/helpers'
import type { StockItem } from './utils/helpers'
import { exportCSV, exportExcel } from './services/exportService'

const App: React.FC = () => {
  // Step 1: Product data
  const [codigo, setCodigo] = useState('')
  const [lote, setLote] = useState('')

  // Step 2: Location
  const [local, setLocal] = useState('')
  const [lastLocal, setLastLocal] = useState('')

  // Items list
  const [items, setItems] = useState<StockItem[]>([])

  // Scanner states (only one scanner at a time)
  const [scanningProduct, setScanningProduct] = useState(false)
  const [scanningLocal, setScanningLocal] = useState(false)

  // Dialog
  const [showClearDialog, setShowClearDialog] = useState(false)

  // Handle product scan
  const handleProductScan = useCallback((result: string) => {
    const parsed = parseQRData(result)
    setCodigo(parsed.codigo)
    if (parsed.lote) {
      setLote(parsed.lote)
    }
    showToast(`Produto lido: ${parsed.codigo}`, 'success', '📦')
  }, [])

  // Handle location scan
  const handleLocalScan = useCallback((result: string) => {
    setLocal(result.trim())
    showToast(`Local lido: ${result.trim()}`, 'success', '📍')
  }, [])

  // Use last location shortcut
  const handleRepeatLocal = () => {
    if (lastLocal) {
      setLocal(lastLocal)
      showToast(`Local repetido: ${lastLocal}`, 'info', '🔁')
    }
  }

  // Add item
  const handleAddItem = () => {
    if (!codigo) {
      showToast('Escaneie ou digite o código do produto', 'error')
      return
    }
    if (!local) {
      showToast('Escaneie ou digite o local de armazenamento', 'error')
      return
    }

    const newItem: StockItem = {
      id: generateId(),
      codigo,
      lote,
      local,
      dataHora: formatDateTime(),
    }

    setItems((prev) => [newItem, ...prev])
    setLastLocal(local)

    showToast('Item adicionado com sucesso!', 'success', '✅')

    // Reset fields (keep local for convenience)
    setCodigo('')
    setLote('')
  }

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    showToast('Item removido', 'info', '🗑️')
  }

  // Clear all
  const handleClearAll = () => {
    setItems([])
    setCodigo('')
    setLote('')
    setLocal('')
    setShowClearDialog(false)
    showToast('Lista limpa', 'info', '🧹')
  }

  // Export handlers
  const handleExportCSV = () => {
    if (items.length === 0) {
      showToast('Nenhum item para exportar', 'error')
      return
    }
    exportCSV(items)
    showToast(`CSV exportado (${items.length} itens)`, 'success', '📄')
  }

  const handleExportExcel = () => {
    if (items.length === 0) {
      showToast('Nenhum item para exportar', 'error')
      return
    }
    exportExcel(items)
    showToast(`Excel exportado (${items.length} itens)`, 'success', '📊')
  }

  const productReady = Boolean(codigo)
  const localReady = Boolean(local)

  return (
    <div className="app">
      <Toast />
      <ConfirmDialog
        open={showClearDialog}
        icon="🗑️"
        title="Limpar Lista"
        message={`Tem certeza que deseja remover todos os ${items.length} itens? Esta ação não pode ser desfeita.`}
        confirmText="Limpar Tudo"
        cancelText="Cancelar"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearDialog(false)}
      />

      {/* Header */}
      <header className="header">
        <div className="header__icon">📦</div>
        <h1 className="header__title">Leitor Estoque</h1>
        <p className="header__subtitle">Controle de Almoxarifado</p>
      </header>

      {/* Step 1: Product */}
      <section className={`card ${productReady ? 'card--success' : ''}`}>
        <div className="card__header">
          <span className={`card__step ${productReady ? 'card__step--done' : ''}`}>
            {productReady ? '✓' : '1'}
          </span>
          <h2 className="card__title">Produto</h2>
        </div>

        <Scanner
          onScan={handleProductScan}
          label="Escanear Produto"
          buttonIcon="📷"
          buttonClass="btn--primary"
          scanning={scanningProduct}
          setScanning={(v) => {
            setScanningProduct(v)
            if (v) setScanningLocal(false)
          }}
        />

        <div className="mt-3">
          <div className="input-group">
            <input
              type="text"
              className="input"
              placeholder="Código do produto"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              className="input"
              placeholder="Lote (opcional)"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
            />
          </div>
        </div>

        {productReady && (
          <div>
            <div className="data-display">
              <span className="data-display__label">Cód</span>
              <span className="data-display__value">{codigo}</span>
            </div>
            {lote && (
              <div className="data-display">
                <span className="data-display__label">Lote</span>
                <span className="data-display__value">{lote}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Step 2: Location */}
      <section className={`card ${localReady ? 'card--success' : ''}`}>
        <div className="card__header">
          <span className={`card__step ${localReady ? 'card__step--done' : ''}`}>
            {localReady ? '✓' : '2'}
          </span>
          <h2 className="card__title">Localização</h2>
        </div>

        <Scanner
          onScan={handleLocalScan}
          label="Escanear Local"
          buttonIcon="📍"
          buttonClass="btn--info"
          scanning={scanningLocal}
          setScanning={(v) => {
            setScanningLocal(v)
            if (v) setScanningProduct(false)
          }}
        />

        <div className="mt-3">
          <div className="input-group">
            <input
              type="text"
              className="input"
              placeholder="Rua / Local do almoxarifado"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>
        </div>

        {lastLocal && !local && (
          <button className="repeat-local" onClick={handleRepeatLocal}>
            <span>🔁</span>
            <span className="repeat-local__label">Repetir último:</span>
            <span className="repeat-local__value">{lastLocal}</span>
          </button>
        )}

        {localReady && (
          <div className="data-display">
            <span className="data-display__label">Local</span>
            <span className="data-display__value">{local}</span>
          </div>
        )}
      </section>

      {/* Step 3: Add */}
      <button
        className="btn btn--success"
        onClick={handleAddItem}
        disabled={!productReady || !localReady}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <span>➕</span>
        Adicionar Item
      </button>

      {/* Items List */}
      <ItemList items={items} onRemoveItem={handleRemoveItem} />

      {/* Export Section */}
      {items.length > 0 && (
        <div className="export-section">
          <div className="btn-group mb-3">
            <button className="btn btn--warning btn--sm" onClick={handleExportCSV}>
              <span>📄</span> CSV
            </button>
            <button className="btn btn--success btn--sm" onClick={handleExportExcel}>
              <span>📊</span> Excel
            </button>
          </div>

          <button
            className="btn btn--outline btn--sm"
            onClick={() => setShowClearDialog(true)}
            style={{ color: 'var(--color-danger)' }}
          >
            <span>🗑️</span> Limpar Lista ({items.length} itens)
          </button>
        </div>
      )}
    </div>
  )
}

export default App
