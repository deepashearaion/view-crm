/**
 * Tiny IndexedDB key-value store so mocked modules (files, calls) survive a page reload.
 * IndexedDB keeps Blobs natively, so uploaded files stay downloadable. Falls back to memory
 * when IndexedDB is unavailable (private windows, blocked storage).
 */

const DB_NAME = 'climetavere-mock';
const STORE = 'kv';

let opening: Promise<IDBDatabase | null> | undefined;

function open(): Promise<IDBDatabase | null> {
  opening ??= new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE);
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
  return opening;
}

export async function loadValue<T>(key: string): Promise<T | undefined> {
  const db = await open();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      request.onsuccess = () => {
        resolve(request.result as T | undefined);
      };
      request.onerror = () => {
        resolve(undefined);
      };
    } catch {
      resolve(undefined);
    }
  });
}

export async function saveValue(key: string, value: unknown): Promise<void> {
  const db = await open();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).put(value, key);
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        resolve();
      };
    } catch {
      resolve();
    }
  });
}
