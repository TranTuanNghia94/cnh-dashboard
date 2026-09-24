const DOCUMENT_CODE_FIELDS = ['quote', 'invoice', 'billOfLadding', 'receiptWarehouse', 'trackId'] as const

const DOCUMENT_LABELS: Record<(typeof DOCUMENT_CODE_FIELDS)[number], string> = {
  quote: 'Quote',
  invoice: 'Invoice',
  billOfLadding: 'Bill of lading',
  receiptWarehouse: 'Receipt warehouse',
  trackId: 'Track ID',
}

type DocumentLine = Partial<Record<(typeof DOCUMENT_CODE_FIELDS)[number], string | null>>

function codeForType(line: DocumentLine, type: string) {
  if (!DOCUMENT_CODE_FIELDS.includes(type as (typeof DOCUMENT_CODE_FIELDS)[number])) return ''
  return String(line[type as (typeof DOCUMENT_CODE_FIELDS)[number]] ?? '').trim()
}

export function documentCodes(line: DocumentLine, types?: string[]) {
  const selected = (types ?? []).filter((type) =>
    DOCUMENT_CODE_FIELDS.includes(type as (typeof DOCUMENT_CODE_FIELDS)[number]),
  )
  const fields = selected.length
    ? DOCUMENT_CODE_FIELDS.filter((field) => selected.includes(field))
    : DOCUMENT_CODE_FIELDS
  return fields
    .map((field) => {
      const code = codeForType(line, field)
      return code ? `${code} - ${DOCUMENT_LABELS[field]}` : ''
    })
    .filter(Boolean)
}

export function splitDocumentLabel(label?: string) {
  return String(label ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function formatDocumentCodes(lines: Array<{ line: DocumentLine; types?: string[]; documentLabel?: string }>) {
  return [...new Set(lines.flatMap((item) => {
    const saved = splitDocumentLabel(item.documentLabel)
    return saved.length ? saved : documentCodes(item.line, item.types)
  }))]
}
