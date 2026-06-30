import db from '../db'

interface BackupData {
  version: number;
  exportedAt: number;
  cards: any[];
  categories: any[];
  recyclebin: any[];
}

export async function importData(): Promise<boolean> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(false); return }

      try {
        const text = await file.text()
        const data: BackupData = JSON.parse(text)

        // Validate
        if (!data.cards || !data.categories) {
          alert('无效的备份文件格式')
          resolve(false)
          return
        }

        // Clear existing data and import
        await db.transaction('rw', [db.cards, db.categories, db.recyclebin], async () => {
          await db.cards.clear()
          await db.categories.clear()
          await db.recyclebin.clear()

          if (data.cards.length) await db.cards.bulkAdd(data.cards)
          if (data.categories.length) await db.categories.bulkAdd(data.categories)
          if (data.recyclebin?.length) await db.recyclebin.bulkAdd(data.recyclebin)
        })

        resolve(true)
      } catch (e) {
        alert('导入失败：文件格式错误')
        resolve(false)
      }
    }

    input.click()
  })
}
