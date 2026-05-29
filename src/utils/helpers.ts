export interface StockItem {
  id: string
  codigo: string
  lote: string
  quantidade: number
  local: string
  dataHora: string
}

/**
 * Parse QR code data in format: COD=789123456;LOTE=ABC123
 * Also accepts plain text as just the product code.
 */
export function parseQRData(raw: string): { codigo: string; lote: string } {
  const trimmed = raw.trim()

  // Try structured format: COD=xxx;LOTE=yyy
  const codMatch = trimmed.match(/COD=([^;]+)/i)
  const loteMatch = trimmed.match(/LOTE=([^;]+)/i)

  if (codMatch) {
    return {
      codigo: codMatch[1].trim(),
      lote: loteMatch ? loteMatch[1].trim() : '',
    }
  }

  // Fallback: treat entire string as product code
  return {
    codigo: trimmed,
    lote: '',
  }
}

/**
 * Generate a unique ID for each item.
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

/**
 * Format current date/time as dd/MM/yyyy HH:mm:ss
 */
export function formatDateTime(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}
