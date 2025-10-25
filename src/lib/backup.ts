import { db } from "@/lib/db";

const SNAPSHOT_KEY = "app.backup.snapshot.v1";
const RESTORE_MARK_KEY = "app.backup.restore.last";

type SnapshotV1 = {
  version: 1;
  createdAt: string; // ISO
  items: unknown[];
  sales: unknown[];
};

async function exportSnapshot(): Promise<void> {
  try {
    const [items, sales] = await Promise.all([
      db.items.toArray(),
      db.sales.toArray(),
    ]);
    const snap: SnapshotV1 = {
      version: 1,
      createdAt: new Date().toISOString(),
      items,
      sales,
    };
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap));
  } catch (e) {
    // swallow — backup is best-effort
    console.warn("Backup export failed", e);
  }
}

async function isDatabaseEmpty(): Promise<boolean> {
  const [ic, sc] = await Promise.all([
    db.items.count(),
    db.sales.count(),
  ]);
  return (ic === 0 && sc === 0);
}

async function importSnapshotIfEmpty(): Promise<boolean> {
  try {
    const empty = await isDatabaseEmpty();
    if (!empty) return false;
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return false;
    const snap = JSON.parse(raw) as SnapshotV1;
    if (!snap || snap.version !== 1) return false;
    // simple restore strategy: clear (already empty) and bulkPut
    await db.transaction('rw', db.items, db.sales, async () => {
      if (snap.items?.length) await db.items.bulkPut(snap.items as any[]);
      if (snap.sales?.length) await db.sales.bulkPut(snap.sales as any[]);
    });
    localStorage.setItem(RESTORE_MARK_KEY, new Date().toISOString());
    return true;
  } catch (e) {
    console.warn("Backup restore failed", e);
    return false;
  }
}

export function initBackupSync() {
  // On load: attempt restore if empty DB and snapshot exists
  void importSnapshotIfEmpty();

  // Save on tab hide or before unload
  const save = () => { void exportSnapshot(); };
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });
  window.addEventListener('beforeunload', save);

  // Optional: periodic save every 60s (best-effort)
  const id = window.setInterval(save, 60_000);

  return () => {
    window.clearInterval(id);
    window.removeEventListener('beforeunload', save);
  };
}

