import { computed } from 'vue'
import type { Card } from '../db'

export function useSearch(query: () => string, allCards: () => Card[]) {
  const results = computed(() => {
    const q = query().trim().toLowerCase()
    if (!q) return []

    const cards = allCards()

    // Score and filter
    const scored = cards
      .map(card => {
        const title = card.title.toLowerCase()
        let score = 0
        if (title === q) score = 100
        else if (title.startsWith(q)) score = 80
        else if (title.includes(q)) score = 60
        return { card, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)

    return scored.map(item => item.card)
  })

  return { results }
}
