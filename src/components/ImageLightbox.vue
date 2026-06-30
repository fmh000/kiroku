<script setup lang="ts">
import { ref, watch } from 'vue'
import { PhX } from '@phosphor-icons/vue'

const props = defineProps<{
  images: string[];
  initialIndex: number;
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const currentIndex = ref(props.initialIndex);

watch(() => props.open, (val) => {
  if (val) currentIndex.value = props.initialIndex;
});

function next() {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('update:open', false);
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="open"
        class="fixed inset-0 z-[90] bg-black flex flex-col items-center justify-center"
        tabindex="0"
        @keydown="handleKeydown"
      >
        <!-- Close button -->
        <button
          type="button"
          class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center"
          @click="emit('update:open', false)"
        >
          <PhX :size="24" weight="light" class="text-white" />
        </button>

        <!-- Image -->
        <div class="flex-1 flex items-center justify-center px-4 pb-8">
          <img
            :src="images[currentIndex]"
            class="max-w-full max-h-full object-contain"
            alt=""
          />
        </div>

        <!-- Counter -->
        <p v-if="images.length > 1" class="text-white text-sm pb-8">
          {{ currentIndex + 1 }} / {{ images.length }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 200ms ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
