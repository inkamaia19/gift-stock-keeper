// --- START OF FILE src/lib/db.ts ---

import Dexie, { Table } from 'dexie';
import { Item, Sale } from '@/types/inventory';

export class BusinessDB extends Dexie {
  items!: Table<Item, string>;
  sales!: Table<Sale, string>;

  constructor() {
    super('gestorDeNegocioDB');
    this.version(1).stores({
      items: 'id, name, type',
      sales: 'id, itemId, date',
    });

    // ===== CAMBIO CLAVE AQUÍ: Migración a la versión 2 =====
    this.version(2).stores({
      // No necesitamos re-declarar 'items' si no cambia
      sales: 'id, itemId, date, bundleId', // Añadimos el nuevo índice
    });
  }
}

export const db = new BusinessDB();
// --- END OF FILE src/lib/db.ts ---