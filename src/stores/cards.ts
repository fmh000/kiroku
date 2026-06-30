import { defineStore } from 'pinia';
import { ref } from 'vue';
import db, { type Card, type Category, type RecycleBinItem } from '../db';

export const useCardsStore = defineStore('cards', () => {
  const cards = ref<Card[]>([]);
  const categories = ref<Category[]>([]);
  const recycleBin = ref<RecycleBinItem[]>([]);

  // ── Load ──

  async function loadAll() {
    cards.value = await db.cards.toArray();
    categories.value = await db.categories.toArray();
    recycleBin.value = await db.recyclebin.toArray();
  }

  // ── Card CRUD ──

  async function addCard(
    card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    const now = Date.now();
    const newCard: Card = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await db.cards.add(newCard);
    cards.value.push(newCard);
    return newCard;
  }

  async function updateCard(id: string, updates: Partial<Card>) {
    const patch = { ...updates, updatedAt: Date.now() };
    await db.cards.update(id, patch);
    const idx = cards.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      cards.value[idx] = { ...cards.value[idx], ...patch };
    }
  }

  async function deleteCard(id: string) {
    const card = cards.value.find((c) => c.id === id);
    if (!card) return;
    const recycleItem: RecycleBinItem = { ...card, deletedAt: Date.now() };
    await db.recyclebin.add(recycleItem);
    await db.cards.delete(id);
    recycleBin.value.push(recycleItem);
    cards.value = cards.value.filter((c) => c.id !== id);
  }

  async function restoreCard(id: string) {
    const item = recycleBin.value.find((r) => r.id === id);
    if (!item) return;
    const { deletedAt, ...cardData } = item;
    await db.recyclebin.delete(id);
    await db.cards.add(cardData);
    recycleBin.value = recycleBin.value.filter((r) => r.id !== id);
    cards.value.push(cardData);
  }

  async function permanentDelete(id: string) {
    await db.recyclebin.delete(id);
    recycleBin.value = recycleBin.value.filter((r) => r.id !== id);
  }

  async function emptyRecycleBin() {
    await db.recyclebin.clear();
    recycleBin.value = [];
  }

  // ── Category CRUD ──

  async function addCategory(
    category: Omit<Category, 'id' | 'createdAt'>
  ) {
    const newCat: Category = {
      ...category,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    await db.categories.add(newCat);
    categories.value.push(newCat);
    return newCat;
  }

  async function deleteCategory(id: string) {
    // Collect all descendant category IDs
    const descendantIds = getDescendantIds(id);
    const allIds = [id, ...descendantIds];

    // Move all cards in these categories to recyclebin
    const affectedCards = cards.value.filter(
      (c) => c.categoryId !== null && allIds.includes(c.categoryId)
    );
    const now = Date.now();
    for (const card of affectedCards) {
      await db.recyclebin.add({ ...card, deletedAt: now });
      await db.cards.delete(card.id);
      recycleBin.value.push({ ...card, deletedAt: now });
    }
    cards.value = cards.value.filter(
      (c) => c.categoryId === null || !allIds.includes(c.categoryId)
    );

    // Delete categories from DB and state
    await db.categories.bulkDelete(allIds);
    categories.value = categories.value.filter(
      (c) => !allIds.includes(c.id)
    );
  }

  async function renameCategory(id: string, newName: string) {
    const cat = categories.value.find((c) => c.id === id);
    if (!cat) return;
    // Validate no duplicate name at the same level
    const siblings = categories.value.filter(
      (c) => c.parentId === cat.parentId && c.id !== id
    );
    if (siblings.some((c) => c.name === newName)) return;
    await db.categories.update(id, { name: newName });
    cat.name = newName;
  }

  // ── Batch Operations ──

  async function moveCards(
    cardIds: string[],
    targetColumn: 'next' | 'sparks' | 'hold',
    targetCategoryId: string | null
  ) {
    const patch = {
      column: targetColumn,
      categoryId: targetCategoryId,
      updatedAt: Date.now(),
    };
    await db.cards.bulkUpdate(cardIds.map((id) => ({ key: id, changes: patch })));
    for (const id of cardIds) {
      const card = cards.value.find((c) => c.id === id);
      if (card) {
        card.column = targetColumn;
        card.categoryId = targetCategoryId;
        card.updatedAt = patch.updatedAt;
      }
    }
  }

  // ── Queries ──

  function getCardsByColumn(column: string) {
    return cards.value.filter((c) => c.column === column);
  }

  function getCardsByCategory(categoryId: string) {
    const descendantIds = getDescendantIds(categoryId);
    const allIds = [categoryId, ...descendantIds];
    return cards.value.filter(
      (c) => c.categoryId !== null && allIds.includes(c.categoryId)
    );
  }

  function getUncategorized(column: string) {
    return cards.value.filter(
      (c) => c.column === column && c.categoryId === null
    );
  }

  function getCategoriesByColumn(column: string) {
    return categories.value.filter((c) => c.column === column);
  }

  function getSubCategories(parentId: string) {
    return categories.value.filter((c) => c.parentId === parentId);
  }

  function getCategoryCount(categoryId: string) {
    const descendantIds = getDescendantIds(categoryId);
    const allIds = [categoryId, ...descendantIds];
    return cards.value.filter(
      (c) => c.categoryId !== null && allIds.includes(c.categoryId)
    ).length;
  }

  // ── Quick Actions ──

  async function togglePin(id: string) {
    const card = cards.value.find((c) => c.id === id);
    if (!card) return;
    const newVal = !card.pinned;
    await db.cards.update(id, { pinned: newVal, updatedAt: Date.now() });
    card.pinned = newVal;
    card.updatedAt = Date.now();
  }

  async function setPriority(id: string, priority: number) {
    const card = cards.value.find((c) => c.id === id);
    if (!card) return;
    await db.cards.update(id, { priority, updatedAt: Date.now() });
    card.priority = priority;
    card.updatedAt = Date.now();
  }

  // ── Helpers ──

  function getDescendantIds(parentId: string): string[] {
    const result: string[] = [];
    const children = categories.value.filter((c) => c.parentId === parentId);
    for (const child of children) {
      result.push(child.id);
      result.push(...getDescendantIds(child.id));
    }
    return result;
  }

  return {
    cards,
    categories,
    recycleBin,
    loadAll,
    addCard,
    updateCard,
    deleteCard,
    restoreCard,
    permanentDelete,
    emptyRecycleBin,
    addCategory,
    deleteCategory,
    renameCategory,
    moveCards,
    getCardsByColumn,
    getCardsByCategory,
    getUncategorized,
    getCategoriesByColumn,
    getSubCategories,
    getCategoryCount,
    togglePin,
    setPriority,
  };
});
