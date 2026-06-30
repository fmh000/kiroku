<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>

<template>
  <div class="flex items-center justify-center h-full py-20">
    <span class="text-[32px] font-light text-text-secondary">
      {{ text ?? '無' }}
    </span>
  </div>
</template>
