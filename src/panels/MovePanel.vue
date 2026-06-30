<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PhX, PhFolderOpen } from '@phosphor-icons/vue'
import { useCardsStore } from '../stores/cards'

const props = defineProps<{
  open: boolean;
  currentColumn: string;
  cardIds: string[];
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  move: [target: { column: string; categoryId: string | null }];
}>();

const cardsStore = useCardsStore()
const targetColumn = ref(props.currentColumn)
const targetCategoryId = ref<string | null>(null)

watch(() => props.open, (val) => {
  if (val) {
    targetColumn.value = props.currentColumn
    targetCategoryId.value = null
  }
})

const targetCategories = computed(() =>
  cardsStore.categories.filter(c => c.column === targetColumn.value && c.parentId === null)
)

function getSubCategories(parentId: string) {
  return cardsStore.categories.filter(c => c.parentId === parentId)
}

function handleMove() {
  emit('move', { column: targetColumn.value, categoryId: targetCategoryId.value })
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="open" class="fixed inset-0 z-[80]">
        <div class="absolute inset-0" style="background: rgba(0,0,0,0.4)" @click="emit('update:open', false)" />

        <div class="absolute bottom-0 left-0 right-0 bg-card rounded-t-[20px] max-h-[70vh] flex flex-col z-10">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-divider">
            <span class="text-[17px] font-semibold">移动到</span>
            <button type="button" class="w-8 h-8 flex items-center justify-center active:opacity-60" @click="emit('update:open', false)">
              <PhX :size="20" weight="light" class="text-text-secondary" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-3">
            <!-- Column selector -->
            <div class="flex gap-2 mb-4">
              <button
                v-for="col in [{ key: 'next', label: 'Next' }, { key: 'sparks', label: 'Sparks' }, { key: 'hold', label: 'Hold' }]"
                :key="col.key"
                type="button"
                class="px-4 py-2 rounded-full text-[13px] font-medium transition-colors"
                :class="targetColumn === col.key ? 'bg-text text-card' : 'bg-divider text-text-secondary'"
                @click="targetColumn = col.key; targetCategoryId = null"
              >
                {{ col.label }}
              </button>
            </div>

            <!-- Category list -->
            <template v-for="cat in targetCategories" :key="cat.id">
              <button
                type="button"
                class="flex items-center gap-2 w-full h-11 px-2 rounded-lg text-[14px] font-semibold text-text active:bg-divider transition-colors"
                @click="targetCategoryId = cat.id"
              >
                <PhFolderOpen :size="16" weight="light" />
                <span>{{ cat.name }}</span>
                <span v-if="targetCategoryId === cat.id" class="ml-auto text-text text-xs">✓</span>
              </button>
              <button
                v-for="sub in getSubCategories(cat.id)"
                :key="sub.id"
                type="button"
                class="flex items-center gap-2 w-full h-11 px-6 rounded-lg text-[14px] font-semibold text-text active:bg-divider transition-colors"
                @click="targetCategoryId = sub.id"
              >
                <PhFolderOpen :size="16" weight="light" />
                <span>{{ sub.name }}</span>
                <span v-if="targetCategoryId === sub.id" class="ml-auto text-text text-xs">✓</span>
              </button>
            </template>

            <!-- No category -->
            <div class="border-t border-dashed border-divider mt-2 pt-2">
              <button
                type="button"
                class="flex items-center gap-2 w-full h-11 px-2 rounded-lg text-[14px] text-text-secondary active:bg-divider transition-colors"
                @click="targetCategoryId = null"
              >
                <span>不指定分类</span>
                <span v-if="targetCategoryId === null" class="ml-auto text-text text-xs">✓</span>
              </button>
            </div>
          </div>

          <!-- Move button -->
          <div class="px-5 py-4 border-t border-divider">
            <button
              type="button"
              class="w-full h-11 rounded-[10px] bg-text text-[15px] font-medium text-card active:opacity-70"
              @click="handleMove"
            >
              移动
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition: transform 250ms ease-out;
}
.panel-enter-from,
.panel-leave-to {
  transform: translateY(100%);
}
</style>
