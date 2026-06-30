<script setup lang="ts">
import { ref, computed } from 'vue'
import { PhPushPin, PhTrash, PhPencilSimple } from '@phosphor-icons/vue'

const emit = defineEmits<{
  pin: [];
  delete: [];
  edit: [];
  setPriority: [value: number];
}>();

const offsetX = ref(0);
const startX = ref(0);
const swiping = ref(false);

const THRESHOLD = 80;
const REVEAL_LEFT = 150;  // left swipe reveals right side (pin/delete/edit)
const REVEAL_RIGHT = 120; // right swipe reveals left side (priority dots)

const translateX = computed(() => {
  if (!swiping.value && Math.abs(offsetX.value) < 1) return '0px';
  return `${offsetX.value}px`;
});

const transition = computed(() => swiping.value ? 'none' : 'transform 200ms ease');

function onTouchStart(e: TouchEvent) {
  startX.value = e.touches[0].clientX;
  swiping.value = true;
}

function onTouchMove(e: TouchEvent) {
  if (!swiping.value) return;
  const diff = e.touches[0].clientX - startX.value;

  // Clamp: left swipe max -REVEAL_LEFT, right swipe max REVEAL_RIGHT
  offsetX.value = Math.max(-REVEAL_LEFT, Math.min(REVEAL_RIGHT, diff));
}

function onTouchEnd() {
  swiping.value = false;
  const diff = offsetX.value;

  if (diff > THRESHOLD) {
    // Right swipe - snap open to reveal priority dots
    offsetX.value = REVEAL_RIGHT;
    if (navigator.vibrate) navigator.vibrate(5);
  } else if (diff < -THRESHOLD) {
    // Left swipe - snap open to reveal action buttons
    offsetX.value = -REVEAL_LEFT;
    if (navigator.vibrate) navigator.vibrate(5);
  } else {
    // Snap back
    offsetX.value = 0;
  }
}

function close() {
  offsetX.value = 0;
}

function handlePriority(value: number) {
  emit('setPriority', value);
  close();
}

function handleAction(action: 'pin' | 'delete' | 'edit') {
  if (action === 'pin') emit('pin');
  else if (action === 'delete') emit('delete');
  else emit('edit');
  close();
}
</script>

<template>
  <div class="relative overflow-hidden rounded-card">
    <!-- Right reveal: priority dots (shown when swiping right) -->
    <div
      class="absolute inset-y-0 left-0 flex items-center justify-center bg-divider rounded-l-card"
      :style="{ width: `${REVEAL_RIGHT}px`, transition }"
    >
      <div class="flex items-center" style="gap: 8px">
        <button
          v-for="i in 5"
          :key="i"
          type="button"
          class="w-5 h-5 rounded-full border-2 transition-colors duration-100"
          :class="i <= 0 ? 'bg-text border-text' : 'bg-card border-divider'"
          @click="handlePriority(i)"
        />
      </div>
    </div>

    <!-- Left reveal: action buttons (shown when swiping left) -->
    <div
      class="absolute inset-y-0 right-0 flex items-center bg-divider rounded-r-card"
      :style="{ width: `${REVEAL_LEFT}px`, transition }"
    >
      <div class="flex items-center w-full">
        <button
          type="button"
          class="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 active:opacity-60"
          @click="handleAction('pin')"
        >
          <PhPushPin :size="16" weight="light" class="text-text" />
          <span class="text-[10px] text-text">置顶</span>
        </button>
        <button
          type="button"
          class="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 active:opacity-60"
          @click="handleAction('delete')"
        >
          <PhTrash :size="16" weight="light" class="text-danger" />
          <span class="text-[10px] text-danger">删除</span>
        </button>
        <button
          type="button"
          class="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 active:opacity-60"
          @click="handleAction('edit')"
        >
          <PhPencilSimple :size="16" weight="light" class="text-text" />
          <span class="text-[10px] text-text">编辑</span>
        </button>
      </div>
    </div>

    <!-- Card content (swipeable) -->
    <div
      class="relative bg-card rounded-card"
      :style="{ transform: `translateX(${translateX}px)`, transition }"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <slot />
    </div>
  </div>
</template>
