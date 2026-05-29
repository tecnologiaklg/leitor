import React, { useState, useCallback } from 'react'
import Scanner from './components/Scanner'
import ItemList from './components/ItemList'
import Toast, { showToast } from './components/Toast'
import ConfirmDialog from './components/ConfirmDialog'
import { generateId, formatDateTime } from './utils/helpers'
import type { StockItem } from './utils/helpers'
import { exportCSV, exportExcel } from './services/exportService'
import Login from './components/Login'
import { saveRelatorio } from './services/dbService'
import ReportHistory from './components/ReportHistory'

interface PendingProduct {
  id: string
  codigo: string
  lote: string
  quantidade: number
}

const App: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // Listen for PWA installation prompt
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('Obrigado por instalar o app!', 'success', '📲');
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // View state
  const [view, setView] = useState<'scanner' | 'history'>('scanner')

  // Step 1: Product code
  const [codigo, setCodigo] = useState('')

  // Step 2: Lot
  const [lote, setLote] = useState('')

  // Step 3: Quantidade
  const [quantidade, setQuantidade] = useState<number | ''>('')

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
    if (!quantidade || quantidade <= 0) {
      showToast('Digite uma quantidade válida', 'error')
      return
    }

    const newPending: PendingProduct = {
      id: generateId(),
      codigo,
      lote,
      quantidade: Number(quantidade)
    }

    setPendingProducts((prev) => [newPending, ...prev])
    showToast(`Produto adicionado: ${codigo}`, 'success', '✅')

    // Reset fields for next scan
    setCodigo('')
    setLote('')
    setQuantidade('')
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
      quantidade: p.quantidade,
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
    setQuantidade('')
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

  const handleSaveToDB = async () => {
    if (items.length === 0) {
      showToast('Nenhum item para salvar', 'error')
      return
    }
    setIsSaving(true)
    try {
      await saveRelatorio(items)
      showToast(`Salvo no banco com sucesso (${items.length} itens)`, 'success', '💾')
      handleClearAll()
    } catch (error) {
      showToast('Erro ao salvar no banco. Verifique sua conexão e credenciais.', 'error', '❌')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  const productReady = Boolean(codigo)
  const loteReady = Boolean(lote)
  const quantidadeReady = Boolean(quantidade && quantidade > 0)
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

      {/* PWA Install Banner */}
      {isInstallable && (
        <div className="card card--active" style={{ marginBottom: 'var(--space-4)', border: '2px dashed var(--color-success)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '2rem' }}>📲</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>Instalar no Celular / PC</h3>
              <p className="text-muted" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Acesse como um aplicativo nativo, direto da sua tela inicial!</p>
            </div>
            <button className="btn btn--success btn--sm" onClick={handleInstallApp}>
              Baixar App
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="btn-group mb-4" style={{ display: 'flex', width: '100%', gap: 'var(--space-2)' }}>
        <button 
          className={`btn ${view === 'scanner' ? 'btn--primary' : 'btn--outline'}`} 
          style={{ flex: 1 }}
          onClick={() => setView('scanner')}
        >
          📷 Nova Leitura
        </button>
        <button 
          className={`btn ${view === 'history' ? 'btn--primary' : 'btn--outline'}`} 
          style={{ flex: 1 }}
          onClick={() => setView('history')}
        >
          📂 Histórico
        </button>
      </div>

      {view === 'history' ? (
        <ReportHistory />
      ) : (
        <>
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

      {/* ============ STEP 3: Quantidade ============ */}
      <section className={`card ${quantidadeReady ? 'card--success' : ''}`}>
        <div className="card__header">
          <span className={`card__step ${quantidadeReady ? 'card__step--done' : ''}`}>
            {quantidadeReady ? '✓' : '3'}
          </span>
          <h2 className="card__title">Quantidade</h2>
        </div>

        <div className="mt-3">
          <input
            type="number"
            className="input"
            placeholder="Digite a quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value ? Number(e.target.value) : '')}
            min="1"
          />
        </div>

        {quantidadeReady && (
          <div className="data-display mt-3">
            <span className="data-display__label">Qtd</span>
            <span className="data-display__value">{quantidade}</span>
          </div>
        )}
      </section>

      {/* ============ ADD TO PENDING ============ */}
      <button
        className="btn btn--success"
        onClick={handleAddPending}
        disabled={!productReady || !quantidadeReady}
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
              <div className="item-card__row">
                <span className="item-card__icon">🔢</span>
                <span className="item-card__label">Qtd</span>
                <span className="item-card__value">{p.quantidade}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ============ STEP 4: Location (only shows when there are pending products) ============ */}
      {hasPending && (
        <>
          <section className={`card ${localReady ? 'card--success' : ''}`}>
            <div className="card__header">
              <span className={`card__step ${localReady ? 'card__step--done' : ''}`}>
                {localReady ? '✓' : '4'}
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
            <button 
              className="btn btn--primary btn--sm" 
              onClick={handleSaveToDB}
              disabled={isSaving}
            >
              <span>{isSaving ? '⏳' : '💾'}</span> {isSaving ? 'Salvando...' : 'Salvar no Banco'}
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
        </>
      )}
    </div>
  )
}

export default App
