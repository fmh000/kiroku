<script setup lang="ts">
import { ref, watch } from 'vue'
import { PhPlus, PhImage } from '@phosphor-icons/vue'
import type { Card } from '../db'
import PriorityDots from '../components/PriorityDots.vue'
import LinkTag from '../components/LinkTag.vue'
import { useCardsStore } from '../stores/cards'
import { compressImage } from '../utils/compressImage'
import CategoryPicker from '../panels/CategoryPicker.vue'
import CategoryCreator from '../panels/CategoryCreator.vue'

const props = defineProps<{
  open: boolean;
  card: Card | null;
  column: string;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  save: [card: Partial<Card> & { title: string }];
}>();

const cardsStore = useCardsStore()

const title = ref('')
const selectedColumn = ref<'next' | 'sparks' | 'hold'>(props.column as 'next' | 'sparks' | 'hold')
const categoryId = ref<string | null>(null)
const priority = ref(0)
const images = ref<string[]>([])
const links = ref<Array<{ url: string; title?: string }>>([])

const showCategoryPicker = ref(false)
const showCategoryCreator = ref(false)
const showLinkInput = ref(false)
const linkUrl = ref('')
const linkTitle = ref('')
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)

async function handleImagePick(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files) return

  uploading.value = true
  for (const file of Array.from(files)) {
    if (images.value.length >= 9) break
    try {
      const dataUrl = await compressImage(file)
      images.value.push(dataUrl)
    } catch {
      // skip failed images
    }
  }
  uploading.value = false
  input.value = ''
}

const columnOptions = [
  { key: 'next', label: 'Next' },
  { key: 'sparks', label: 'Sparks' },
  { key: 'hold', label: 'Hold' },
] as const;

const categoryName = ref('')

watch(() => props.open, (val) => {
  if (val) {
    selectedColumn.value = props.column as 'next' | 'sparks' | 'hold'
    if (props.card) {
      title.value = props.card.title
      categoryId.value = props.card.categoryId
      priority.value = props.card.priority
      images.value = [...props.card.images]
      links.value = [...props.card.links]
    } else {
      title.value = ''
      categoryId.value = null
      priority.value = 0
      images.value = []
      links.value = []
    }
    updateCategoryName()
  }
})

function updateCategoryName() {
  if (categoryId.value) {
    const cat = cardsStore.categories.find(c => c.id === categoryId.value)
    categoryName.value = cat?.name ?? '未分类'
  } else {
    categoryName.value = '未分类'
  }
}

function handleCategorySelect(id: string | null) {
  categoryId.value = id
  updateCategoryName()
}

function handleCategoryCreated(cat: { id: string; name: string }) {
  categoryId.value = cat.id
  categoryName.value = cat.name
}

function addLink() {
  if (!linkUrl.value.startsWith('http://') && !linkUrl.value.startsWith('https://')) return
  if (links.value.length >= 9) return
  links.value.push({ url: linkUrl.value, title: linkTitle.value || undefined })
  linkUrl.value = ''
  linkTitle.value = ''
  showLinkInput.value = false
}

function removeLink(index: number) {
  links.value.splice(index, 1)
}

function handleSave() {
  const text = title.value.trim()
  if (!text && images.value.length === 0 && links.value.length === 0) return
  emit('save', {
    ...(props.card ? { id: props.card.id } : {}),
    title: text,
    column: selectedColumn.value as Card['column'],
    categoryId: categoryId.value,
    priority: priority.value,
    images: images.value,
    links: links.value,
  } as Partial<Card> & { title: string })
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="editor">
      <div v-if="open" class="fixed inset-0 z-[80] bg-card flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 h-14 border-b border-divider shrink-0">
          <button type="button" class="text-[15px] text-text active:opacity-60" @click="emit('update:open', false)">
            取消
          </button>
          <span class="text-[17px] font-semibold">{{ card ? '编辑卡片' : '新建卡片' }}</span>
          <button type="button" class="text-[15px] text-text font-medium active:opacity-60" @click="handleSave">
            保存
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <!-- Column selector -->
          <div class="flex gap-2">
            <button
              v-for="col in columnOptions"
              :key="col.key"
              type="button"
              class="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors"
              :class="selectedColumn === col.key ? 'bg-text text-card' : 'bg-divider text-text-secondary'"
              @click="selectedColumn = col.key"
            >
              {{ col.label }}
            </button>
          </div>

          <!-- Category selector -->
          <button
            type="button"
            class="flex items-center gap-2 text-[15px] text-text-secondary active:opacity-60"
            @click="showCategoryPicker = true"
          >
            <span>分类：</span>
            <span class="text-text">{{ categoryName }}</span>
          </button>

          <!-- Title input -->
          <textarea
            v-model="title"
            placeholder="输入文字..."
            rows="4"
            class="w-full resize-none rounded-[10px] bg-divider p-3 text-[15px] text-text placeholder:text-text-secondary outline-none"
          />

          <!-- Priority -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-text-secondary">重要度</span>
            <PriorityDots v-model:value="priority" :interactive="true" />
          </div>

          <!-- Images -->
          <div>
            <p class="text-sm text-text-secondary mb-2">图片</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(img, i) in images"
                :key="i"
                class="relative w-16 h-16 rounded-md bg-divider overflow-hidden"
              >
                <img :src="img" class="w-full h-full object-cover" alt="" />
                <button
                  type="button"
                  class="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-danger text-white text-xs flex items-center justify-center"
                  @click="images.splice(i, 1)"
                >×</button>
              </div>
              <button
                v-if="images.length < 9"
                type="button"
                class="w-16 h-16 rounded-md border-2 border-dashed border-divider flex items-center justify-center text-text-secondary active:opacity-60"
                :class="uploading ? 'opacity-40' : ''"
                :disabled="uploading"
                @click="fileInput?.click()"
              >
                <PhImage :size="20" weight="light" />
              </button>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleImagePick"
            />
          </div>

          <!-- Links -->
          <div>
            <p class="text-sm text-text-secondary mb-2">链接</p>
            <div class="flex flex-wrap gap-1">
              <div v-for="(link, i) in links" :key="i" class="relative">
                <LinkTag :url="link.url" :title="link.title" />
                <button
                  type="button"
                  class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-danger text-white text-[10px] flex items-center justify-center"
                  @click="removeLink(i)"
                >×</button>
              </div>
              <button
                v-if="links.length < 9 && !showLinkInput"
                type="button"
                class="w-8 h-8 rounded-full bg-divider flex items-center justify-center text-text-secondary active:opacity-60"
                @click="showLinkInput = true"
              >
                <PhPlus :size="16" weight="light" />
              </button>
            </div>

            <!-- Link input -->
            <div v-if="showLinkInput" class="mt-2 space-y-2">
              <input
                v-model="linkUrl"
                type="url"
                placeholder="https://..."
                class="w-full h-9 px-3 rounded-[10px] bg-divider text-[13px] text-text placeholder:text-text-secondary outline-none"
              />
              <input
                v-model="linkTitle"
                type="text"
                placeholder="标题（可选）"
                class="w-full h-9 px-3 rounded-[10px] bg-divider text-[13px] text-text placeholder:text-text-secondary outline-none"
              />
              <div class="flex gap-2">
                <button type="button" class="px-3 h-8 rounded-[10px] bg-divider text-[13px] text-text" @click="showLinkInput = false">取消</button>
                <button type="button" class="px-3 h-8 rounded-[10px] bg-text text-[13px] text-card" @click="addLink">添加</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <CategoryPicker
    :open="showCategoryPicker"
    :column="selectedColumn"
    :selected-category-id="categoryId"
    @update:open="showCategoryPicker = $event"
    @select="handleCategorySelect"
    @create="showCategoryPicker = false; showCategoryCreator = true"
  />

  <CategoryCreator
    :open="showCategoryCreator"
    :column="selectedColumn"
    @update:open="showCategoryCreator = $event"
    @created="handleCategoryCreated"
  />
</template>

<style scoped>
.editor-enter-active,
.editor-leave-active {
  transition: transform 250ms ease-out;
}
.editor-enter-from,
.editor-leave-to {
  transform: translateY(100%);
}
</style>
