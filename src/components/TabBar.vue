<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  activeTab: string;
  counts: { next: number; sparks: number; hold: number };
}>();

const emit = defineEmits<{
  'update:activeTab': [tab: string];
}>();

const tabs = [
  { key: 'next', label: 'Next' },
  { key: 'sparks', label: 'Sparks' },
  { key: 'hold', label: 'Hold' },
] as const;

const activeIndex = computed(() => tabs.findIndex(t => t.key === props.activeTab));
</script>

<template>
  <div
    class="fixed left-0 right-0 z-30 flex border-b border-divider"
    :style="{
      top: '100px',
      height: '40px',
      paddingTop: 'env(safe-area-inset-top)',
      background: 'rgba(242, 242, 247, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }"
  >
    <!-- Sliding pill indicator -->
    <div
      class="absolute top-1 bottom-0.5 w-1/3 rounded-full bg-divider transition-all duration-200 ease-out"
      :style="{ transform: `translateX(${activeIndex * 100}%)` }"
    />

    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="relative z-10 flex-1 flex items-center justify-center text-[15px] font-medium transition-colors duration-200"
      :class="activeTab === tab.key ? 'text-text' : 'text-text-secondary'"
      @click="emit('update:activeTab', tab.key)"
    >
      {{ tab.label }}({{ counts[tab.key] }})
    </button>
  </div>
</template>
