import React, { useRef, useCallback, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { scanFeedback } from '../utils/feedback'

interface ScannerProps {
  onScan: (result: string) => void
  label: string
  buttonIcon: string
  buttonClass?: string
  scanning: boolean
  setScanning: (v: boolean) => void
}

const SCANNER_ELEMENT_ID = 'scanner-region'

const Scanner: React.FC<ScannerProps> = ({
  onScan,
  label,
  buttonIcon,
  buttonClass = 'btn--primary',
  scanning,
  setScanning,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string>('')

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        if (state === 2) { // SCANNING
          await scannerRef.current.stop()
        }
      } catch {
        // ignore
      }
      try {
        scannerRef.current.clear()
      } catch {
        // ignore
      }
      scannerRef.current = null
    }
    setScanning(false)
  }, [setScanning])

  const startScanner = useCallback(async () => {
    setError('')

    // Ensure previous scanner is fully stopped
    await stopScanner()

    // Small delay to ensure DOM element is ready
    await new Promise((r) => setTimeout(r, 100))

    const element = document.getElementById(SCANNER_ELEMENT_ID)
    if (!element) {
      setError('Elemento do scanner não encontrado')
      return
    }

    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
      scannerRef.current = scanner

      setScanning(true)

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 300, height: 120 },
        },
        (decodedText) => {
          scanFeedback()
          onScan(decodedText)
          stopScanner()
        },
        () => {
          // Scan error (no code found yet) - do nothing
        }
      )
    } catch (err: unknown) {
      setScanning(false)
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowed')) {
        setError('Permissão da câmera negada. Habilite nas configurações do navegador.')
      } else {
        setError(`Erro ao abrir câmera: ${errorMessage}`)
      }
    }
  }, [onScan, stopScanner, setScanning])

  const handleToggle = () => {
    if (scanning) {
      stopScanner()
    } else {
      startScanner()
    }
  }

  return (
    <div>
      {scanning && (
        <div className="scanning-indicator">
          <div className="scanning-dot" />
          <span className="scanning-text">Escaneando…</span>
        </div>
      )}

      <div
        className="scanner-area"
        style={{ display: scanning ? 'block' : 'none' }}
      >
        <div id={SCANNER_ELEMENT_ID} />
      </div>

      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
          {error}
        </p>
      )}

      <button
        className={`btn ${scanning ? 'btn--danger' : buttonClass}`}
        onClick={handleToggle}
      >
        <span>{scanning ? '⏹' : buttonIcon}</span>
        {scanning ? 'Parar Scanner' : label}
      </button>
    </div>
  )
}

export default Scanner
