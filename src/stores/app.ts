import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const currentTab = ref<'next' | 'sparks' | 'hold'>('next');
  const sidebarOpen = ref(false);
  const searchQuery = ref('');

  function setTab(tab: 'next' | 'sparks' | 'hold') {
    currentTab.value = tab;
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  return {
    currentTab,
    sidebarOpen,
    searchQuery,
    setTab,
    toggleSidebar,
    setSearchQuery,
  };
});
