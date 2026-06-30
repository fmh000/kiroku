<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import SearchBar from './components/SearchBar.vue'
import TabBar from './components/TabBar.vue'
import EmptyState from './components/EmptyState.vue'
import FAB from './components/FAB.vue'
import CardItem from './components/CardItem.vue'
import SwipeActions from './components/SwipeActions.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import Sidebar from './panels/Sidebar.vue'
import RecycleBinPage from './pages/RecycleBinPage.vue'
import CardEditor from './pages/CardEditor.vue'
import MovePanel from './panels/MovePanel.vue'
import { useAppStore } from './stores/app'
import { useCardsStore } from './stores/cards'
import { useSearch } from './composables/useSearch'
import { useLongPress } from './composables/useLongPress'
import { exportData } from './utils/exportData'
import { importData } from './utils/importData'
import type { Card } from './db'

const appStore = useAppStore()
const cardsStore = useCardsStore()
const searchText = ref('')

// Navigation
const showRecycleBin = ref(false)

// Card editor
const showEditor = ref(false)
const editingCard = ref<Card | null>(null)

// Delete confirm
const showDeleteConfirm = ref(false)
const pendingDeleteId = ref<string | null>(null)

// Move panel
const showMovePanel = ref(false)
const moveCardIds = ref<string[]>([])

// Batch selection
const selectionMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())

// Long press helpers
function cardLongPressHandlers(id: string) {
  const { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel } = useLongPress(() => handleLongPress(id))
  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel }
}

function catLongPressHandlers(id: string) {
  const { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel } = useLongPress(() => startRenameCategory(id))
  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel }
}

// Category rename
const renamingCategoryId = ref<string | null>(null)
const renamingName = ref('')

// Search
const { results: searchResults } = useSearch(
  () => searchText.value,
  () => cardsStore.cards
)

// Load data on mount
onMounted(() => {
  cardsStore.loadAll()
})

// Tab counts
const counts = computed(() => ({
  next: cardsStore.getCardsByColumn('next').length,
  sparks: cardsStore.getCardsByColumn('sparks').length,
  hold: cardsStore.getCardsByColumn('hold').length,
}))

// Current tab cards (sorted: pinned first, then priority desc, then createdAt desc)
const currentTabCards = computed(() => {
  const cards = cardsStore.getCardsByColumn(appStore.currentTab)
  return [...cards].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (a.priority !== b.priority) return b.priority - a.priority
    return b.createdAt - a.createdAt
  })
})

// Categories for current tab
const rootCategories = computed(() =>
  cardsStore.categories
    .filter(c => c.column === appStore.currentTab && c.parentId === null)
    .sort((a, b) => a.createdAt - b.createdAt)
)

function getSubCategories(parentId: string) {
  return cardsStore.categories
    .filter(c => c.parentId === parentId)
    .sort((a, b) => a.createdAt - b.createdAt)
}

function getDirectCards(categoryId: string) {
  return currentTabCards.value.filter(c => c.categoryId === categoryId)
}

// Category rename
function startRenameCategory(id: string) {
  const cat = cardsStore.categories.find(c => c.id === id)
  if (!cat) return
  renamingCategoryId.value = id
  renamingName.value = cat.name
}

function confirmRenameCategory() {
  if (renamingCategoryId.value && renamingName.value.trim()) {
    cardsStore.renameCategory(renamingCategoryId.value, renamingName.value.trim())
  }
  renamingCategoryId.value = null
}

function cancelRenameCategory() {
  renamingCategoryId.value = null
}

// Delete category
const showDeleteCategoryConfirm = ref(false)
const pendingDeleteCategoryId = ref<string | null>(null)

function handleDeleteCategory(id: string) {
  pendingDeleteCategoryId.value = id
  showDeleteCategoryConfirm.value = true
}

function confirmDeleteCategory() {
  if (pendingDeleteCategoryId.value) {
    cardsStore.deleteCategory(pendingDeleteCategoryId.value)
  }
  showDeleteCategoryConfirm.value = false
  pendingDeleteCategoryId.value = null
}

const uncategorizedCards = computed(() =>
  currentTabCards.value.filter(c => c.categoryId === null)
)

// Expand state for categories
const expandedCategories = ref<Set<string>>(new Set())

function toggleCategory(id: string) {
  if (expandedCategories.value.has(id)) {
    expandedCategories.value.delete(id)
  } else {
    expandedCategories.value.add(id)
  }
}

// Card actions
function openEditor(card: Card | null = null) {
  editingCard.value = card
  showEditor.value = true
}

function handleSaveCard(data: Partial<Card> & { title: string }) {
  if (data.id) {
    cardsStore.updateCard(data.id, data)
  } else {
    cardsStore.addCard({
      title: data.title,
      column: (data.column as Card['column']) || appStore.currentTab,
      priority: data.priority || 0,
      pinned: false,
      categoryId: data.categoryId ?? null,
      images: data.images || [],
      links: data.links || [],
    })
  }
}

function handleDeleteCard(id: string) {
  pendingDeleteId.value = id
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (pendingDeleteId.value) {
    cardsStore.deleteCard(pendingDeleteId.value)
  }
  showDeleteConfirm.value = false
  pendingDeleteId.value = null
}

function handlePin(id: string) {
  cardsStore.togglePin(id)
}

function handleSetPriority(id: string, value: number) {
  cardsStore.setPriority(id, value)
}

// Batch selection
function handleLongPress(id: string) {
  selectionMode.value = true
  selectedIds.value.add(id)
}

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  if (selectedIds.value.size === 0) {
    selectionMode.value = false
  }
}

function cancelSelection() {
  selectionMode.value = false
  selectedIds.value.clear()
}

function handleBatchDelete() {
  if (selectedIds.value.size === 0) return
  moveCardIds.value = Array.from(selectedIds.value)
  // TODO: confirm and delete
  for (const id of moveCardIds.value) {
    cardsStore.deleteCard(id)
  }
  cancelSelection()
}

function handleBatchMove() {
  if (selectedIds.value.size === 0) return
  moveCardIds.value = Array.from(selectedIds.value)
  showMovePanel.value = true
}

function handleMove(target: { column: 'next' | 'sparks' | 'hold'; categoryId: string | null }) {
  cardsStore.moveCards(moveCardIds.value, target.column, target.categoryId)
  showMovePanel.value = false
  cancelSelection()
}

// Sidebar
function handleNavigateRecycleBin() {
  appStore.toggleSidebar()
  showRecycleBin.value = true
}

async function handleExportData() {
  appStore.toggleSidebar()
  await exportData()
}

async function handleImportData() {
  appStore.toggleSidebar()
  const ok = await importData()
  if (ok) await cardsStore.loadAll()
}
</script>

<template>
  <!-- RecycleBin page -->
  <RecycleBinPage v-if="showRecycleBin" @back="showRecycleBin = false" />

  <!-- Main app -->
  <div v-else class="min-h-screen text-text font-sans" style="background-color: #F2F2F7">
    <!-- Batch selection bar -->
    <div
      v-if="selectionMode"
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-12 bg-card border-b border-divider"
      style="padding-top: env(safe-area-inset-top)"
    >
      <span class="text-[15px] font-medium">已选择 {{ selectedIds.size }} 项</span>
      <button type="button" class="text-[15px] text-text font-medium" @click="cancelSelection">取消</button>
    </div>

    <NavBar v-if="!selectionMode" @toggle-sidebar="appStore.toggleSidebar()" />

    <!-- SearchBar -->
    <div
      v-if="!selectionMode"
      class="fixed left-0 right-0 z-30 px-4"
      :style="{ top: '56px' }"
    >
      <div class="py-2">
        <SearchBar v-model="searchText" />
      </div>
    </div>

    <TabBar
      v-if="!selectionMode"
      :active-tab="appStore.currentTab"
      :counts="counts"
      @update:active-tab="appStore.setTab"
    />

    <!-- Content -->
    <main
      class="px-4 pb-20"
      :class="selectionMode ? 'pt-14' : 'pt-[152px]'"
    >
      <!-- Search results -->
      <template v-if="searchText.trim()">
        <EmptyState v-if="searchResults.length === 0" />
        <div v-else class="space-y-2">
          <div v-for="card in searchResults" :key="card.id">
            <SwipeActions
              @pin="handlePin(card.id)"
              @delete="handleDeleteCard(card.id)"
              @edit="openEditor(card)"
              @set-priority="(v) => handleSetPriority(card.id, v)"
            >
              <div
                @click="selectionMode ? toggleSelect(card.id) : undefined"
                v-on="!selectionMode ? cardLongPressHandlers(card.id) : {}"
              >
                <CardItem :card="card" />
              </div>
            </SwipeActions>
          </div>
        </div>
      </template>

      <!-- Normal tab content -->
      <template v-else>
        <!-- Categories -->
        <div v-for="cat in rootCategories" :key="cat.id" class="mb-2">
          <!-- Category row -->
          <div
            v-if="renamingCategoryId !== cat.id"
            class="flex items-center gap-2 w-full h-11 px-2 rounded-lg text-[14px] font-semibold text-text active:bg-divider transition-colors cursor-pointer"
            :style="{ paddingLeft: '16px' }"
            @click="toggleCategory(cat.id)"
            v-on="catLongPressHandlers(cat.id)"
          >
            <span class="text-text-secondary text-xs">{{ expandedCategories.has(cat.id) ? '▾' : '▸' }}</span>
            <span>📂</span>
            <span>{{ cat.name }}</span>
            <span class="ml-auto text-xs text-text-secondary font-normal">({{ cardsStore.getCategoryCount(cat.id) }})</span>
          </div>
          <div v-else class="flex items-center gap-2 h-11 px-2" :style="{ paddingLeft: '16px' }">
            <input
              v-model="renamingName"
              class="flex-1 h-8 px-2 rounded-[6px] bg-divider text-[14px] font-semibold text-text outline-none"
              @keyup.enter="confirmRenameCategory"
              @keyup.esc="cancelRenameCategory"
              @blur="confirmRenameCategory"
              autofocus
            />
            <button type="button" class="text-xs text-danger shrink-0 px-1" @mousedown.prevent="handleDeleteCategory(cat.id)">删除</button>
          </div>

          <!-- Expanded content -->
          <div v-if="expandedCategories.has(cat.id)" class="ml-8">
            <!-- Sub categories -->
            <div v-for="sub in getSubCategories(cat.id)" :key="sub.id">
              <div
                v-if="renamingCategoryId !== sub.id"
                class="flex items-center gap-2 w-full h-11 px-2 rounded-lg text-[14px] font-semibold text-text active:bg-divider transition-colors cursor-pointer"
                style="padding-left: 16px"
                @click="toggleCategory(sub.id)"
                v-on="catLongPressHandlers(sub.id)"
              >
                <span class="text-text-secondary text-xs">{{ expandedCategories.has(sub.id) ? '▾' : '▸' }}</span>
                <span>📂</span>
                <span>{{ sub.name }}</span>
                <span class="ml-auto text-xs text-text-secondary font-normal">({{ cardsStore.getCategoryCount(sub.id) }})</span>
              </div>
              <div v-else class="flex items-center gap-2 h-11 px-2" style="padding-left: 16px">
                <input
                  v-model="renamingName"
                  class="flex-1 h-8 px-2 rounded-[6px] bg-divider text-[14px] font-semibold text-text outline-none"
                  @keyup.enter="confirmRenameCategory"
                  @keyup.esc="cancelRenameCategory"
                  @blur="confirmRenameCategory"
                  autofocus
                />
                <button type="button" class="text-xs text-danger shrink-0 px-1" @mousedown.prevent="handleDeleteCategory(sub.id)">删除</button>
              </div>

              <!-- Sub category cards -->
              <div v-if="expandedCategories.has(sub.id)" class="ml-6 space-y-2 py-1">
                <div v-for="card in getDirectCards(sub.id)" :key="card.id">
                  <SwipeActions
                    @pin="handlePin(card.id)"
                    @delete="handleDeleteCard(card.id)"
                    @edit="openEditor(card)"
                    @set-priority="(v) => handleSetPriority(card.id, v)"
                  >
                    <div
                      @click="selectionMode ? toggleSelect(card.id) : undefined"
                      v-on="!selectionMode ? cardLongPressHandlers(card.id) : {}"
                    >
                      <CardItem :card="card" />
                    </div>
                  </SwipeActions>
                </div>
              </div>
            </div>

            <!-- Direct cards in root category -->
            <div class="space-y-2 py-1">
              <div v-for="card in getDirectCards(cat.id)" :key="card.id">
                <SwipeActions
                  @pin="handlePin(card.id)"
                  @delete="handleDeleteCard(card.id)"
                  @edit="openEditor(card)"
                  @set-priority="(v) => handleSetPriority(card.id, v)"
                >
                  <div
                    @click="selectionMode ? toggleSelect(card.id) : undefined"
                    v-on="!selectionMode ? cardLongPressHandlers(card.id) : {}"
                  >
                    <CardItem :card="card" />
                  </div>
                </SwipeActions>
              </div>
            </div>
          </div>
        </div>

        <!-- Uncategorized -->
        <template v-if="uncategorizedCards.length > 0 || rootCategories.length > 0">
          <div v-if="rootCategories.length > 0" class="border-t border-dashed border-divider my-3" />
          <p class="text-[14px] font-semibold text-text-secondary px-2 mb-2">未分类</p>
        </template>
        <div class="space-y-2">
          <div v-for="card in uncategorizedCards" :key="card.id">
            <SwipeActions
              @pin="handlePin(card.id)"
              @delete="handleDeleteCard(card.id)"
              @edit="openEditor(card)"
              @set-priority="(v) => handleSetPriority(card.id, v)"
            >
              <div
                @click="selectionMode ? toggleSelect(card.id) : undefined"
                v-on="!selectionMode ? cardLongPressHandlers(card.id) : {}"
              >
                <CardItem :card="card" />
              </div>
            </SwipeActions>
          </div>
        </div>

        <!-- Empty state (only if no cards at all in this tab) -->
        <EmptyState v-if="currentTabCards.length === 0 && !searchText.trim()" />
      </template>
    </main>

    <!-- Batch action bar -->
    <div
      v-if="selectionMode"
      class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-4 h-14 bg-card border-t border-divider"
      style="padding-bottom: env(safe-area-inset-bottom)"
    >
      <button
        type="button"
        class="flex items-center gap-1 text-[15px] font-medium"
        :class="selectedIds.size > 0 ? 'text-text' : 'text-text-secondary opacity-40'"
        :disabled="selectedIds.size === 0"
        @click="handleBatchMove"
      >
        移动
      </button>
      <button
        type="button"
        class="flex items-center gap-1 text-[15px] font-medium"
        :class="selectedIds.size > 0 ? 'text-danger' : 'text-text-secondary opacity-40'"
        :disabled="selectedIds.size === 0"
        @click="handleBatchDelete"
      >
        删除
      </button>
    </div>

    <!-- FAB -->
    <FAB v-if="!selectionMode" @click="openEditor()" />

    <!-- Sidebar -->
    <Sidebar
      :open="appStore.sidebarOpen"
      @update:open="appStore.sidebarOpen = $event"
      @navigate-recycle-bin="handleNavigateRecycleBin"
      @export-data="handleExportData"
      @import-data="handleImportData"
    />

    <!-- Card Editor -->
    <CardEditor
      :open="showEditor"
      :card="editingCard"
      :column="appStore.currentTab"
      @update:open="showEditor = $event"
      @save="handleSaveCard"
    />

    <!-- Delete Confirm -->
    <ConfirmDialog
      :open="showDeleteConfirm"
      title="删除卡片"
      message="确定要删除这张卡片吗？卡片将移入回收站，可在侧边栏恢复。"
      confirm-text="删除"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />

    <!-- Delete Category Confirm -->
    <ConfirmDialog
      :open="showDeleteCategoryConfirm"
      title="删除分类"
      message="确定要删除这个分类吗？该分类下的所有卡片也将被删除（移入回收站）。"
      confirm-text="删除"
      :danger="true"
      @confirm="confirmDeleteCategory"
      @cancel="showDeleteCategoryConfirm = false"
    />

    <!-- Move Panel -->
    <MovePanel
      :open="showMovePanel"
      :current-column="appStore.currentTab"
      :card-ids="moveCardIds"
      @update:open="showMovePanel = $event"
      @move="handleMove"
    />
  </div>
</template>
