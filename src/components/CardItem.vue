<script setup lang="ts">
import { ref } from 'vue'
import { PhPushPinSimple } from '@phosphor-icons/vue'
import type { Card } from '../db'
import PriorityDots from './PriorityDots.vue'
import LinkTag from './LinkTag.vue'
import ImageLightbox from './ImageLightbox.vue'

const props = defineProps<{
  card: Card;
}>();

const imagesExpanded = ref(false);
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function toggleImages() {
  if (props.card.images.length > 0) {
    imagesExpanded.value = !imagesExpanded.value;
  }
}

function openLightbox(index: number, e: Event) {
  e.stopPropagation();
  lightboxIndex.value = index;
  lightboxOpen.value = true;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
</script>

<template>
  <div
    class="rounded-card bg-card p-3 shadow-sm"
    style="box-shadow: 0 1px 3px rgba(0,0,0,0.06);"
  >
    <!-- Title + Priority -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-start gap-1 min-w-0 flex-1">
        <PhPushPinSimple
          v-if="card.pinned"
          :size="10"
          weight="light"
          class="text-text mt-1 shrink-0"
        />
        <p class="text-[15px] text-text leading-snug line-clamp-3">
          {{ card.title }}
        </p>
      </div>
      <PriorityDots :value="card.priority" class="shrink-0 mt-0.5" />
    </div>

    <!-- Image thumbnails (collapsed) -->
    <div
      v-if="card.images.length > 0 && !imagesExpanded"
      class="mt-2 flex items-center gap-1 cursor-pointer"
      @click="toggleImages"
    >
      <div
        v-for="(img, i) in card.images.slice(0, 3)"
        :key="i"
        class="w-12 h-12 rounded-md bg-divider overflow-hidden"
      >
        <img :src="img" class="w-full h-full object-cover" alt="" />
      </div>
      <span
        v-if="card.images.length > 3"
        class="text-xs text-text-secondary ml-1"
      >
        +{{ card.images.length - 3 }}
      </span>
    </div>

    <!-- Image grid (expanded) -->
    <div
      v-if="card.images.length > 0 && imagesExpanded"
      class="mt-2 grid grid-cols-2 gap-1"
    >
      <div
        v-for="(img, i) in card.images"
        :key="i"
        class="aspect-square rounded-md bg-divider overflow-hidden cursor-pointer"
        @click="openLightbox(i, $event)"
        @click.self="toggleImages"
      >
        <img :src="img" class="w-full h-full object-cover" alt="" />
      </div>
    </div>

    <!-- Links -->
    <div v-if="card.links.length > 0" class="mt-2 flex flex-wrap gap-1">
      <LinkTag
        v-for="(link, i) in card.links"
        :key="i"
        :url="link.url"
        :title="link.title"
      />
    </div>

    <!-- Created time -->
    <p class="mt-2 text-xs text-text-secondary">
      {{ formatDate(card.createdAt) }}
    </p>

    <!-- Image Lightbox -->
    <ImageLightbox
      :images="card.images"
      :initial-index="lightboxIndex"
      :open="lightboxOpen"
      @update:open="lightboxOpen = $event"
    />
  </div>
</template>
