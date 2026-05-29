import * as XLSX from 'xlsx'
import type { StockItem } from '../utils/helpers'

/**
 * Export items as CSV file and trigger download.
 */
export function exportCSV(items: StockItem[]): void {
  const header = 'codigo,lote,local,dataHora'
  const rows = items.map(
    (item) =>
      `"${item.codigo}","${item.lote}","${item.local}","${item.dataHora}"`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `estoque_${getFileTimestamp()}.csv`)
}

/**
 * Export items as formatted Excel file and trigger download.
 */
export function exportExcel(items: StockItem[]): void {
  const data = items.map((item) => ({
    Código: item.codigo,
    Lote: item.lote,
    Local: item.local,
    'Data/Hora': item.dataHora,
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Auto-fit column widths
  const colWidths = [
    { wch: 20 }, // Código
    { wch: 15 }, // Lote
    { wch: 20 }, // Local
    { wch: 22 }, // Data/Hora
  ]
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Estoque')

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  downloadBlob(blob, `estoque_${getFileTimestamp()}.xlsx`)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function getFileTimestamp(): string {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`
}
