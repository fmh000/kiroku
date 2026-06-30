<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useCardsStore } from '../stores/cards'

const props = defineProps<{
  open: boolean;
  column: 'next' | 'sparks' | 'hold';
  parentId?: string | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  created: [category: { id: string; name: string; column: string; parentId: string | null }];
}>();

const cardsStore = useCardsStore()
const nameInput = ref<HTMLInputElement>()
const newName = ref('')
const selectedParentId = ref<string | null>(props.parentId ?? null)

const rootCategories = computed(() =>
  cardsStore.categories.filter(c => c.column === props.column && c.parentId === null)
)

const isDuplicate = computed(() => {
  if (!newName.value.trim()) return false
  return cardsStore.categories.some(
    c => c.column === props.column && c.parentId === (selectedParentId.value ?? null) && c.name === newName.value.trim()
  )
})

const canSubmit = computed(() => newName.value.trim() && !isDuplicate.value)

async function handleOpen() {
  newName.value = ''
  selectedParentId.value = props.parentId ?? null
  await nextTick()
  nameInput.value?.focus()
}

function handleCreate() {
  if (!canSubmit.value) return
  cardsStore.addCategory({
    name: newName.value.trim(),
    column: props.column,
    parentId: selectedParentId.value ?? null,
  }).then(cat => {
    emit('created', cat)
    emit('update:open', false)
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="panel" @after-enter="handleOpen">
      <div v-if="open" class="fixed inset-0 z-[90]">
        <!-- Overlay -->
        <div class="absolute inset-0" style="background: rgba(0,0,0,0.4)" @click="emit('update:open', false)" />

        <!-- Panel -->
        <div class="absolute bottom-0 left-0 right-0 bg-card rounded-t-[20px] z-10">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-divider">
            <span class="text-[17px] font-semibold">新建分类</span>
            <button type="button" class="w-8 h-8 flex items-center justify-center active:opacity-60" @click="emit('update:open', false)">
              <span class="text-text-secondary text-lg">×</span>
            </button>
          </div>

          <!-- Form -->
          <div class="px-5 py-4 space-y-4">
            <div>
              <input
                ref="nameInput"
                v-model="newName"
                type="text"
                placeholder="分类名称"
                class="w-full h-11 px-3 rounded-[10px] bg-divider text-[15px] text-text placeholder:text-text-secondary outline-none"
              />
              <p v-if="isDuplicate" class="mt-1 text-xs text-danger">同级已存在同名分类</p>
            </div>

            <!-- Parent select -->
            <div>
              <label class="text-sm text-text-secondary">父级分类</label>
              <select
                v-model="selectedParentId"
                class="mt-1 w-full h-11 px-3 rounded-[10px] bg-divider text-[15px] text-text outline-none appearance-none"
              >
                <option :value="null">无（一级分类）</option>
                <option v-for="cat in rootCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 px-5 py-4 border-t border-divider">
            <button
              type="button"
              class="flex-1 h-11 rounded-[10px] bg-divider text-[15px] font-medium text-text active:opacity-70"
              @click="emit('update:open', false)"
            >
              取消
            </button>
            <button
              type="button"
              class="flex-1 h-11 rounded-[10px] bg-text text-card text-[15px] font-medium active:opacity-70 disabled:opacity-40"
              :disabled="!canSubmit"
              @click="handleCreate"
            >
              创建
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
