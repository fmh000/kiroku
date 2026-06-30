<script setup lang="ts">
import { computed } from 'vue'
import { PhArrowLeft, PhArrowUUpLeft, PhTrash, PhTrashSimple } from '@phosphor-icons/vue'
import { useCardsStore } from '../stores/cards'
import EmptyState from '../components/EmptyState.vue'

const emit = defineEmits<{
  back: [];
}>();

const cardsStore = useCardsStore()

const recycleItems = computed(() => cardsStore.recycleBin)

function getSourceLabel(item: { column: string; categoryId?: string | null }): string {
  const colMap: Record<string, string> = { next: 'Next', sparks: 'Sparks', hold: 'Hold' }
  let label = colMap[item.column] || item.column
  if (item.categoryId) {
    const cat = cardsStore.categories.find(c => c.id === item.categoryId)
    if (cat) label += ` > ${cat.name}`
  }
  return label
}

function handleRestore(id: string) {
  cardsStore.restoreCard(id)
}

function handlePermanentDelete(id: string) {
  if (confirm('确定要永久删除这张卡片吗？此操作不可恢复。')) {
    cardsStore.permanentDelete(id)
  }
}

function handleEmptyAll() {
  if (confirm('确定要清空回收站吗？所有卡片将被永久删除。')) {
    cardsStore.emptyRecycleBin()
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text font-sans">
    <!-- Top bar -->
    <header class="flex items-center gap-2 px-4 h-14 border-b border-divider">
      <button
        type="button"
        class="flex items-center justify-center w-10 h-10 active:opacity-60"
        @click="emit('back')"
      >
        <PhArrowLeft :size="20" weight="light" class="text-text" />
      </button>
      <span class="text-[17px] font-semibold">回收站</span>
    </header>

    <!-- Content -->
    <div class="px-4 py-4 pb-20">
      <EmptyState v-if="recycleItems.length === 0" text="無" />

      <div v-else class="space-y-3">
        <div
          v-for="item in recycleItems"
          :key="item.id"
          class="rounded-card bg-card p-3 shadow-sm"
          style="box-shadow: 0 1px 3px rgba(0,0,0,0.06)"
        >
          <p class="text-[15px] text-text line-clamp-2">{{ item.title || '(无标题)' }}</p>
          <p class="text-xs text-text-secondary mt-1">来自：{{ getSourceLabel(item) }}</p>

          <div class="flex items-center gap-3 mt-2">
            <button
              type="button"
              class="flex items-center gap-1 text-xs text-text active:opacity-60"
              @click="handleRestore(item.id)"
            >
              <PhArrowUUpLeft :size="14" weight="light" />
              <span>恢复</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1 text-xs text-danger active:opacity-60"
              @click="handlePermanentDelete(item.id)"
            >
              <PhTrash :size="14" weight="light" />
              <span>永久删除</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty all button -->
      <div v-if="recycleItems.length > 0" class="mt-8 flex justify-center">
        <button
          type="button"
          class="flex items-center gap-1 text-sm text-danger active:opacity-60"
          @click="handleEmptyAll"
        >
          <PhTrashSimple :size="14" weight="light" />
          <span>清空回收站</span>
        </button>
      </div>
    </div>
  </div>
</template>
