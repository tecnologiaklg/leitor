import React, { useState, useCallback } from 'react'
import Scanner from './components/Scanner'
import ItemList from './components/ItemList'
import Toast, { showToast } from './components/Toast'
import ConfirmDialog from './components/ConfirmDialog'
import { generateId, formatDateTime } from './utils/helpers'
import type { StockItem } from './utils/helpers'
import { exportCSV, exportExcel } from './services/exportService'

interface PendingProduct {
  id: string
  codigo: string
  lote: string
}

const App: React.FC = () => {
  // Step 1: Product code
  const [codigo, setCodigo] = useState('')

  // Step 2: Lot
  const [lote, setLote] = useState('')

  // Pending products (before assigning location)
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([])

  // Step 3: Location
  const [local, setLocal] = useState('')
  const [lastLocal, setLastLocal] = useState('')

  // Final items list
  const [items, setItems] = useState<StockItem[]>([])

  // Scanner states
  const [scanningProduct, setScanningProduct] = useState(false)
  const [scanningLote, setScanningLote] = useState(false)
  const [scanningLocal, setScanningLocal] = useState(false)

  // Dialog
  const [showClearDialog, setShowClearDialog] = useState(false)

  // Stop all other scanners when one starts
  const stopAllScanners = () => {
    setScanningProduct(false)
    setScanningLote(false)
    setScanningLocal(false)
  }

  // Handle product code scan
  const handleProductScan = useCallback((result: string) => {
    setCodigo(result.trim())
    showToast(`Código lido: ${result.trim()}`, 'success', '📦')
  }, [])

  // Handle lot scan
  const handleLoteScan = useCallback((result: string) => {
    setLote(result.trim())
    showToast(`Lote lido: ${result.trim()}`, 'success', '🏷️')
  }, [])

  // Handle location scan
  const handleLocalScan = useCallback((result: string) => {
    setLocal(result.trim())
    showToast(`Local lido: ${result.trim()}`, 'success', '📍')
  }, [])

  // Add product+lot to pending list
  const handleAddPending = () => {
    if (!codigo) {
      showToast('Escaneie ou digite o código do produto', 'error')
      return
    }

    const newPending: PendingProduct = {
      id: generateId(),
      codigo,
      lote,
    }

    setPendingProducts((prev) => [newPending, ...prev])
    showToast(`Produto adicionado: ${codigo}`, 'success', '✅')

    // Reset product/lot fields for next scan
    setCodigo('')
    setLote('')
  }

  // Remove item from pending list
  const handleRemovePending = (id: string) => {
    setPendingProducts((prev) => prev.filter((p) => p.id !== id))
    showToast('Produto removido da lista', 'info', '🗑️')
  }

  // Use last location shortcut
  const handleRepeatLocal = () => {
    if (lastLocal) {
      setLocal(lastLocal)
      showToast(`Local repetido: ${lastLocal}`, 'info', '🔁')
    }
  }

  // Confirm location: assign location to all pending products
  const handleConfirmLocation = () => {
    if (pendingProducts.length === 0) {
      showToast('Nenhum produto pendente', 'error')
      return
    }
    if (!local) {
      showToast('Escaneie ou digite a localização', 'error')
      return
    }

    const now = formatDateTime()
    const newItems: StockItem[] = pendingProducts.map((p) => ({
      id: generateId(),
      codigo: p.codigo,
      lote: p.lote,
      local,
      dataHora: now,
    }))

    setItems((prev) => [...newItems, ...prev])
    setLastLocal(local)

    showToast(
      `${pendingProducts.length} produto(s) vinculado(s) ao local ${local}`,
      'success',
      '🎉'
    )

    // Clear pending list and location
    setPendingProducts([])
    setLocal('')
  }

  // Remove single final item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    showToast('Item removido', 'info', '🗑️')
  }

  // Clear all
  const handleClearAll = () => {
    setItems([])
    setPendingProducts([])
    setCodigo('')
    setLote('')
    setLocal('')
    setShowClearDialog(false)
    showToast('Tudo limpo', 'info', '🧹')
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
  const loteReady = Boolean(lote)
  const hasPending = pendingProducts.length > 0
  const localReady = Boolean(local)

  return (
    <div className="app">
      <Toast />
      <ConfirmDialog
        open={showClearDialog}
        icon="🗑️"
        title="Limpar Tudo"
        message={`Remover ${items.length} item(ns) registrado(s) e ${pendingProducts.length} pendente(s)? Esta ação não pode ser desfeita.`}
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

      {/* ============ STEP 1: Product Code ============ */}
      <section className={`card ${productReady ? 'card--success' : ''}`}>
        <div className="card__header">
          <span className={`card__step ${productReady ? 'card__step--done' : ''}`}>
            {productReady ? '✓' : '1'}
          </span>
          <h2 className="card__title">Código do Produto</h2>
        </div>

        <Scanner
          id="scanner-product"
          onScan={handleProductScan}
          label="Escanear Código"
          buttonIcon="📷"
          buttonClass="btn--primary"
          scanning={scanningProduct}
          setScanning={(v) => {
            if (v) stopAllScanners()
            setScanningProduct(v)
          }}
        />

        <div className="mt-3">
          <input
            type="text"
            className="input"
            placeholder="Ou digite o código manualmente"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>

        {productReady && (
          <div className="data-display mt-3">
            <span className="data-display__label">Cód</span>
            <span className="data-display__value">{codigo}</span>
          </div>
        )}
      </section>

      {/* ============ STEP 2: Lot ============ */}
      <section className={`card ${loteReady ? 'card--success' : ''}`}>
        <div className="card__header">
          <span className={`card__step ${loteReady ? 'card__step--done' : ''}`}>
            {loteReady ? '✓' : '2'}
          </span>
          <h2 className="card__title">Lote</h2>
        </div>

        <Scanner
          id="scanner-lote"
          onScan={handleLoteScan}
          label="Escanear Lote"
          buttonIcon="🏷️"
          buttonClass="btn--warning"
          scanning={scanningLote}
          setScanning={(v) => {
            if (v) stopAllScanners()
            setScanningLote(v)
          }}
        />

        <div className="mt-3">
          <input
            type="text"
            className="input"
            placeholder="Ou digite o lote manualmente"
            value={lote}
            onChange={(e) => setLote(e.target.value)}
          />
        </div>

        {loteReady && (
          <div className="data-display mt-3">
            <span className="data-display__label">Lote</span>
            <span className="data-display__value">{lote}</span>
          </div>
        )}
      </section>

      {/* ============ ADD TO PENDING ============ */}
      <button
        className="btn btn--success"
        onClick={handleAddPending}
        disabled={!productReady}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <span>➕</span>
        Adicionar Produto à Lista
      </button>

      {/* ============ PENDING PRODUCTS ============ */}
      {hasPending && (
        <section className="card card--active">
          <div className="card__header">
            <span className="items-count">{pendingProducts.length}</span>
            <h2 className="card__title">Produtos Pendentes</h2>
          </div>

          <p className="text-sm text-muted mb-3">
            Escaneie a localização para vincular todos os produtos abaixo.
          </p>

          {pendingProducts.map((p) => (
            <div key={p.id} className="item-card">
              <button
                className="item-card__delete"
                onClick={() => handleRemovePending(p.id)}
                title="Remover"
              >
                ✕
              </button>
              <div className="item-card__row">
                <span className="item-card__icon">📦</span>
                <span className="item-card__label">Cód</span>
                <span className="item-card__value">{p.codigo}</span>
              </div>
              <div className="item-card__row">
                <span className="item-card__icon">🏷️</span>
                <span className="item-card__label">Lote</span>
                <span className="item-card__value">{p.lote || '—'}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ============ STEP 3: Location (only shows when there are pending products) ============ */}
      {hasPending && (
        <>
          <section className={`card ${localReady ? 'card--success' : ''}`}>
            <div className="card__header">
              <span className={`card__step ${localReady ? 'card__step--done' : ''}`}>
                {localReady ? '✓' : '3'}
              </span>
              <h2 className="card__title">Localização</h2>
            </div>

            <Scanner
              id="scanner-local"
              onScan={handleLocalScan}
              label="Escanear Local"
              buttonIcon="📍"
              buttonClass="btn--info"
              scanning={scanningLocal}
              setScanning={(v) => {
                if (v) stopAllScanners()
                setScanningLocal(v)
              }}
            />

            <div className="mt-3">
              <input
                type="text"
                className="input"
                placeholder="Ou digite o local manualmente"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
            </div>

            {lastLocal && !local && (
              <button className="repeat-local mt-3" onClick={handleRepeatLocal}>
                <span>🔁</span>
                <span className="repeat-local__label">Repetir último:</span>
                <span className="repeat-local__value">{lastLocal}</span>
              </button>
            )}

            {localReady && (
              <div className="data-display mt-3">
                <span className="data-display__label">Local</span>
                <span className="data-display__value">{local}</span>
              </div>
            )}
          </section>

          {/* Confirm: assign location to all pending */}
          <button
            className="btn btn--success"
            onClick={handleConfirmLocation}
            disabled={!localReady}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <span>✅</span>
            Vincular {pendingProducts.length} produto(s) ao local
          </button>
        </>
      )}

      {/* ============ FINAL ITEMS LIST ============ */}
      <ItemList items={items} onRemoveItem={handleRemoveItem} />

      {/* ============ EXPORT ============ */}
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
            <span>🗑️</span> Limpar Tudo ({items.length} itens)
          </button>
        </div>
      )}
    </div>
  )
}

export default App
