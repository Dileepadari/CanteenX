// Simple client-side inventory store using localStorage.
// This avoids backend schema changes while enabling vendor inventory management in the UI.

const STORAGE_KEY = 'canteenx_inventory_v1';

type StockMap = Record<string, number>;

function readStore(): StockMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StockMap;
  } catch (e) {
    console.error('Failed to read inventory from localStorage', e);
    return {};
  }
}

function writeStore(store: StockMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to write inventory to localStorage', e);
  }
}

export function getStock(itemId: string | number): number | null {
  const store = readStore();
  const key = String(itemId);
  if (Object.prototype.hasOwnProperty.call(store, key)) return store[key];
  return null;
}

export function setStock(itemId: string | number, count: number) {
  const store = readStore();
  store[String(itemId)] = Math.max(0, Math.floor(count));
  writeStore(store);
}

export function removeStock(itemId: string | number) {
  const store = readStore();
  delete store[String(itemId)];
  writeStore(store);
}

export function getAllStocks(): StockMap {
  return readStore();
}

export default {
  getStock,
  setStock,
  removeStock,
  getAllStocks,
};
