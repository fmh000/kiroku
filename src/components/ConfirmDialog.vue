<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center px-8">
        <!-- Overlay -->
        <div class="absolute inset-0" style="background: rgba(0,0,0,0.4)" />

        <!-- Dialog -->
        <div class="relative w-full max-w-sm bg-card rounded-2xl p-5 shadow-lg z-10">
          <h3 class="text-[17px] font-semibold text-text text-center">{{ title }}</h3>
          <p class="mt-2 text-sm text-text-secondary text-center leading-relaxed">{{ message }}</p>

          <div class="flex gap-3 mt-5">
            <button
              type="button"
              class="flex-1 h-11 rounded-[10px] bg-divider text-[15px] font-medium text-text active:opacity-70 transition-opacity"
              @click="emit('cancel')"
            >
              {{ cancelText ?? '取消' }}
            </button>
            <button
              type="button"
              class="flex-1 h-11 rounded-[10px] text-[15px] font-medium text-white active:opacity-70 transition-opacity"
              :class="danger ? 'bg-danger' : 'bg-text'"
              @click="emit('confirm')"
            >
              {{ confirmText ?? '确认' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 200ms ease-out;
}
.dialog-enter-active .relative,
.dialog-leave-active .relative {
  transition: transform 200ms ease-out;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from .relative {
  transform: scale(0.9);
}
.dialog-leave-to .relative {
  transform: scale(0.9);
}
</style>
