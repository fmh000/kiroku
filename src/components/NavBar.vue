<script setup lang="ts">
defineEmits<{
  toggleSidebar: [];
}>();
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-40 flex items-center border-b border-divider px-4"
    :style="{
      height: '56px',
      paddingTop: 'env(safe-area-inset-top)',
      background: 'rgba(242, 242, 247, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }"
  >
    <button
      type="button"
      class="text-[28px] font-bold text-text active:opacity-60"
      @click="$emit('toggleSidebar')"
    >
      Kiroku
    </button>
  </header>
</template>
