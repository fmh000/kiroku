<script setup lang="ts">
const props = defineProps<{
  value: number;
  interactive?: boolean;
}>();

const emit = defineEmits<{
  'update:value': [value: number];
}>();

function handleClick(index: number) {
  if (!props.interactive) return;
  // Clicking the same index again resets to 0
  emit('update:value', props.value === index ? 0 : index);
}
</script>

<template>
  <div class="flex items-center" style="gap: 4px">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      class="w-2 h-2 rounded-full transition-colors duration-150"
      :class="[
        i <= value ? 'bg-text' : 'bg-divider',
        interactive ? 'cursor-pointer active:scale-110' : 'cursor-default',
      ]"
      @click="handleClick(i)"
    />
  </div>
</template>
