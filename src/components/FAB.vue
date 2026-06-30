<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue';

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    class="fixed z-50 flex items-center justify-center rounded-full bg-text text-card shadow-lg active:scale-90 transition-transform duration-100"
    :style="{
      bottom: '24px',
      right: '20px',
      width: '56px',
      height: '56px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }"
    @click="$emit('click')"
  >
    <PhPlus :size="24" weight="light" />
  </button>
</template>
