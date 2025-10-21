// --- START OF FILE src/lib/db.ts ---

import Dexie, { Table } from 'dexie';
import { Product, Sale } from '@/types/inventory';

export class InventoryDB extends Dexie {
  products!: Table<Product, string>; // El segundo tipo es el de la clave primaria (string for UUID)
  sales!: Table<Sale, string>;

  constructor() {
    super('gestorDeInventarioDB');
    this.version(1).stores({
      // Define tus tablas y sus índices.
      // 'id' es la clave primaria. No se necesita '++' porque usamos crypto.randomUUID().
      products: 'id, name',
      sales: 'id, productId, date',
    });
  }
}

// La línea clave es esta. Asegúrate de que estás exportando una constante llamada 'db'.
export const db = new InventoryDB();
// --- END OF FILE src/lib/db.ts ---