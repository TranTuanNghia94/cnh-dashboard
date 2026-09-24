import * as XLSX from 'xlsx'

export type DocumentCell = string | number

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function downloadExcel(fileName: string, rows: DocumentCell[][]) {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Chung tu')
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`)
}

function isNumericCell(value: DocumentCell, index: number) {
  if (index === 0) return false
  if (typeof value === 'number') return true
  return /^-?[\d.,]+%?$/.test(String(value).trim())
}

export function printDocument(
  title: string,
  sections: Array<{ label: string; value: string }>,
  headers: string[],
  rows: DocumentCell[][],
  totals?: DocumentCell[],
) {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.position = 'fixed'
  frame.style.right = '0'
  frame.style.bottom = '0'
  frame.style.width = '0'
  frame.style.height = '0'
  frame.style.border = '0'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  if (!doc) {
    frame.remove()
    return
  }
  const printedAt = new Date().toLocaleString('vi-VN')
  const meta = sections
    .map((item) => `<div class="field"><div class="label">${escapeHtml(item.label)}</div><div class="value">${escapeHtml(item.value || '—')}</div></div>`)
    .join('')
  const head = headers
    .map((header, index) => `<th class="${index === 0 ? 'center' : ''}">${escapeHtml(header)}</th>`)
    .join('')
  const body = rows.length
    ? rows.map((row) => `<tr>${row.map((cell, index) => {
        const numeric = isNumericCell(cell ?? '', index)
        const align = index === 0 ? 'center' : numeric ? 'right' : ''
        return `<td class="${align}">${escapeHtml(String(cell ?? ''))}</td>`
      }).join('')}</tr>`).join('')
    : `<tr><td class="empty" colspan="${headers.length}">Chưa có dòng hàng</td></tr>`
  const totalRow = totals?.length
    ? `<tr class="total">${totals.map((cell) => {
        const text = String(cell ?? '')
        const align = text && !/[A-Za-zÀ-ỹ]/.test(text.replace(/₫/g, '')) ? 'right' : ''
        return `<td class="${align}">${escapeHtml(text)}</td>`
      }).join('')}</tr>`
    : ''
  doc.open()
  doc.write(`<!doctype html>
<html>
  <head>
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: A4 landscape; margin: 12mm 10mm; }
      * { box-sizing: border-box; }
      body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11px; color: #1f2937; margin: 0; }
      .banner {
        display: flex; justify-content: space-between; align-items: flex-end; gap: 16px;
        padding-bottom: 10px; border-bottom: 3px solid #1d4ed8; margin-bottom: 12px;
      }
      .eyebrow { margin: 0; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #1d4ed8; font-weight: 700; }
      h1 { margin: 2px 0 0; font-size: 20px; letter-spacing: -0.02em; color: #0f172a; }
      .stamp { text-align: right; }
      .stamp .when { margin: 0; color: #6b7280; font-size: 10px; }
      .fields {
        display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-bottom: 14px;
      }
      .field { border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 8px; background: #f8fafc; }
      .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
      .value { margin-top: 2px; font-weight: 600; color: #111827; word-break: break-word; }
      .section { margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #0f172a; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #e5e7eb; padding: 5px 6px; vertical-align: top; }
      th { background: #1e3a8a; color: #fff; font-size: 10px; font-weight: 600; text-align: left; }
      tr:nth-child(even) td { background: #f8fafc; }
      td.right, th.right { text-align: right; font-variant-numeric: tabular-nums; }
      td.center, th.center { text-align: center; }
      td.empty { text-align: center; color: #6b7280; padding: 16px; }
      tr.total td { background: #eff6ff; font-weight: 700; color: #1e3a8a; border-top: 2px solid #1e3a8a; }
      .foot { margin-top: 10px; display: flex; justify-content: space-between; color: #6b7280; font-size: 10px; }
    </style>
  </head>
  <body>
    <header class="banner">
      <div>
        <p class="eyebrow">Cung Nhu Hoc</p>
        <h1>${escapeHtml(title)}</h1>
      </div>
      <div class="stamp">
        <p class="when">In lúc ${escapeHtml(printedAt)}</p>
      </div>
    </header>
    <section class="fields">${meta}</section>
    <p class="section">Dòng hàng (${rows.length})</p>
    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}${totalRow}</tbody>
    </table>
    <div class="foot"><span>Tài liệu nội bộ</span><span>${escapeHtml(title)}</span></div>
  </body>
</html>`)
  doc.close()
  const win = frame.contentWindow
  const print = () => {
    win?.focus()
    win?.print()
    window.setTimeout(() => frame.remove(), 1000)
  }
  if (doc.readyState === 'complete') print()
  else frame.onload = print
}
