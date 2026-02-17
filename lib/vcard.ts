/**
 * Generate a vCard string for "Add to contacts". Only includes fields we have.
 */
export function buildVCard(params: {
  displayName: string | null
  phone?: string
  email?: string
  url?: string
}): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']
  const name = (params.displayName || 'Contact').trim()
  if (name) {
    lines.push(`FN:${escapeVCard(name)}`)
    lines.push(`N:${escapeVCard(name)};;;`)
  }
  if (params.phone) {
    lines.push(`TEL;TYPE=CELL:${params.phone.replace(/\s/g, '')}`)
  }
  if (params.email) {
    lines.push(`EMAIL:${params.email.trim()}`)
  }
  if (params.url) {
    lines.push(`URL:${params.url.startsWith('http') ? params.url : `https://${params.url}`}`)
  }
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

function escapeVCard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/\n/g, '\\n').replace(/\r/g, '')
}
