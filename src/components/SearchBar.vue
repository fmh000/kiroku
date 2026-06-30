<script setup lang="ts">
import { PhMagnifyingGlass } from '@phosphor-icons/vue';

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="relative w-full">
    <PhMagnifyingGlass
      :size="16"
      weight="light"
      class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
    />
    <input
      type="text"
      :value="modelValue"
      placeholder="搜索所有卡片..."
      class="w-full h-9 rounded-full bg-divider pl-9 pr-3 text-[15px] text-text placeholder:text-text-secondary outline-none"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
