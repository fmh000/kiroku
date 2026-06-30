import { ref } from 'vue'

export function useLongPress(callback: () => void, delay = 500) {
  const timer = ref<ReturnType<typeof setTimeout> | null>(null)
  const moved = ref(false)

  function onStart() {
    moved.value = false
    timer.value = setTimeout(() => {
      if (!moved.value) {
        callback()
        if (navigator.vibrate) navigator.vibrate(10)
      }
    }, delay)
  }

  function onMove() {
    moved.value = true
    clear()
  }

  function clear() {
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
  }

  return {
    onTouchStart: onStart,
    onTouchMove: onMove,
    onTouchEnd: clear,
    onTouchCancel: clear,
  }
}
