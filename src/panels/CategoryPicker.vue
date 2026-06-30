<script setup lang="ts">
import { computed } from 'vue'
import { PhX, PhFolderOpen, PhPlus } from '@phosphor-icons/vue'
import { useCardsStore } from '../stores/cards'

const props = defineProps<{
  open: boolean;
  column: 'next' | 'sparks' | 'hold';
  selectedCategoryId: string | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  select: [categoryId: string | null];
  create: [];
}>();

const cardsStore = useCardsStore()

const rootCategories = computed(() =>
  cardsStore.categories.filter(c => c.column === props.column && c.parentId === null)
)

function getSubCategories(parentId: string) {
  return cardsStore.categories.filter(c => c.parentId === parentId)
}

function handleSelect(id: string | null) {
  emit('select', id)
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="open" class="fixed inset-0 z-[80]">
        <!-- Overlay -->
        <div class="absolute inset-0" style="background: rgba(0,0,0,0.4)" @click="emit('update:open', false)" />

        <!-- Panel -->
        <div class="absolute bottom-0 left-0 right-0 bg-card rounded-t-[20px] max-h-[80vh] flex flex-col z-10">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-divider">
            <span class="text-[17px] font-semibold">选择分类</span>
            <button type="button" class="w-8 h-8 flex items-center justify-center active:opacity-60" @click="emit('update:open', false)">
              <PhX :size="20" weight="light" class="text-text-secondary" />
            </button>
          </div>

          <!-- Category list -->
          <div class="flex-1 overflow-y-auto px-5 py-3">
            <template v-for="cat in rootCategories" :key="cat.id">
              <!-- Root category -->
              <button
                type="button"
                class="flex items-center gap-2 w-full h-11 px-2 rounded-lg text-[14px] font-semibold text-text active:bg-divider transition-colors"
                @click="handleSelect(cat.id)"
              >
                <PhFolderOpen :size="16" weight="light" />
                <span>{{ cat.name }}</span>
                <span v-if="selectedCategoryId === cat.id" class="ml-auto text-text text-xs">✓</span>
              </button>

              <!-- Sub categories -->
              <button
                v-for="sub in getSubCategories(cat.id)"
                :key="sub.id"
                type="button"
                class="flex items-center gap-2 w-full h-11 px-6 rounded-lg text-[14px] font-semibold text-text active:bg-divider transition-colors"
                @click="handleSelect(sub.id)"
              >
                <PhFolderOpen :size="16" weight="light" />
                <span>{{ sub.name }}</span>
                <span v-if="selectedCategoryId === sub.id" class="ml-auto text-text text-xs">✓</span>
              </button>
            </template>

            <!-- No category option -->
            <div class="border-t border-dashed border-divider mt-2 pt-2">
              <button
                type="button"
                class="flex items-center gap-2 w-full h-11 px-2 rounded-lg text-[14px] text-text-secondary active:bg-divider transition-colors"
                @click="handleSelect(null)"
              >
                <span>不使用分类</span>
                <span v-if="selectedCategoryId === null" class="ml-auto text-text text-xs">✓</span>
              </button>
            </div>
          </div>

          <!-- Create button -->
          <div class="px-5 py-3 border-t border-divider">
            <button
              type="button"
              class="flex items-center justify-center gap-1 w-full h-11 rounded-[10px] bg-text text-card text-[15px] font-medium active:opacity-70 transition-opacity"
              @click="emit('create')"
            >
              <PhPlus :size="16" weight="light" />
              <span>新建分类</span>
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
