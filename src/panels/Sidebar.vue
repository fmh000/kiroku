<script setup lang="ts">
import { PhTrash, PhDownloadSimple, PhUploadSimple } from '@phosphor-icons/vue'

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  navigateRecycleBin: [];
  exportData: [];
  importData: [];
}>();
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay">
      <div
        v-if="open"
        class="fixed inset-0 z-[60]"
        style="background: rgba(0,0,0,0.3)"
        @click="emit('update:open', false)"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition name="sidebar">
      <div
        v-if="open"
        class="fixed top-0 left-0 z-[70] flex flex-col bg-card h-full overflow-y-auto"
        :style="{
          width: 'min(70vw, 320px)',
          minWidth: '260px',
          borderTopRightRadius: '20px',
          borderBottomRightRadius: '20px',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }"
      >
        <!-- Title -->
        <div class="px-5 pt-6 pb-4">
          <h1 class="text-[28px] font-bold text-text">Kiroku</h1>
        </div>

        <!-- Divider -->
        <div class="h-px bg-divider mx-4" />

        <!-- Menu items -->
        <nav class="py-2">
          <button
            type="button"
            class="flex items-center gap-3 w-full px-5 h-12 text-[15px] text-text active:bg-divider transition-colors"
            @click="emit('navigateRecycleBin')"
          >
            <PhTrash :size="16" weight="light" />
            <span>回收站</span>
          </button>
        </nav>

        <!-- Dashed divider -->
        <div class="mx-4 border-t border-dashed border-divider" />

        <!-- Secondary items -->
        <nav class="py-2">
          <!-- Settings (disabled) -->
          <div
            class="flex items-center gap-3 w-full px-5 h-12 text-[15px] text-text-secondary opacity-40 cursor-not-allowed"
          >
            <span>设置</span>
          </div>

          <button
            type="button"
            class="flex items-center gap-3 w-full px-5 h-12 text-[15px] text-text active:bg-divider transition-colors"
            @click="emit('exportData')"
          >
            <PhDownloadSimple :size="16" weight="light" />
            <span>导出数据</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-3 w-full px-5 h-12 text-[15px] text-text active:bg-divider transition-colors"
            @click="emit('importData')"
          >
            <PhUploadSimple :size="16" weight="light" />
            <span>导入数据</span>
          </button>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 250ms ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 250ms ease-out;
}
.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}
</style>
