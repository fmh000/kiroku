import Dexie, { type EntityTable } from 'dexie';

export interface Card {
  id: string;
  title: string;
  column: 'next' | 'sparks' | 'hold';
  priority: number; // 0-5
  pinned: boolean;
  categoryId: string | null;
  images: string[];
  links: Array<{ url: string; title?: string }>;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  column: 'next' | 'sparks' | 'hold';
  parentId: string | null;
  createdAt: number;
}

export interface RecycleBinItem extends Card {
  deletedAt: number;
}

const db = new Dexie('KirokuDB') as Dexie & {
  cards: EntityTable<Card, 'id'>;
  categories: EntityTable<Category, 'id'>;
  recyclebin: EntityTable<RecycleBinItem, 'id'>;
};

db.version(1).stores({
  cards: 'id, column, priority, categoryId, createdAt',
  categories: 'id, column, parentId',
  recyclebin: 'id, column, deletedAt',
});

export default db;
