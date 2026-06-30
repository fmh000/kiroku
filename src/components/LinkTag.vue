<script setup lang="ts">
import { PhLink } from '@phosphor-icons/vue';

const props = defineProps<{
  url: string;
  title?: string;
}>();

function displayText(): string {
  const label = props.title || props.url;
  return label.length > 20 ? label.slice(0, 20) + '…' : label;
}

function openUrl() {
  window.open(props.url, '_blank', 'noopener');
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1 rounded-pill bg-bg px-3 py-1 text-xs font-medium text-text active:opacity-70"
    @click="openUrl"
  >
    <PhLink :size="12" weight="light" class="text-text" />
    <span class="max-w-[140px] truncate">{{ displayText() }}</span>
  </button>
</template>
