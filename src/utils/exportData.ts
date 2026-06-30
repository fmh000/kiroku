import db from '../db'

export async function exportData() {
  const [cards, categories, recyclebin] = await Promise.all([
    db.cards.toArray(),
    db.categories.toArray(),
    db.recyclebin.toArray(),
  ])

  const data = {
    version: 1,
    exportedAt: Date.now(),
    cards,
    categories,
    recyclebin,
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const a = document.createElement('a')
  a.href = url
  a.download = `kiroku-backup-${dateStr}.json`
  a.click()
  URL.revokeObjectURL(url)
}
