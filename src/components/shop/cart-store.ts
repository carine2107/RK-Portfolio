'use client'

import { useSyncExternalStore } from 'react'

import { MAX_LINES, MAX_QUANTITY, type CartLine } from '@/lib/shop-pricing'

/**
 * Cart kept in the visitor's browser (localStorage): book ids and quantities
 * only. Prices are never stored here — the server computes them.
 */
const KEY = 'rk-cart'
const EMPTY: CartLine[] = []
const listeners = new Set<() => void>()

let cachedRaw: string | null = null
let cachedLines: CartLine[] = EMPTY

function read(): CartLine[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEY)
  } catch {
    return EMPTY
  }
  if (raw === cachedRaw) return cachedLines
  cachedRaw = raw
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    cachedLines = Array.isArray(parsed)
      ? parsed
          .filter(
            (line): line is CartLine =>
              Boolean(line) && typeof line.bookId === 'string' && Number.isInteger(line.quantity),
          )
          .slice(0, MAX_LINES)
      : EMPTY
  } catch {
    cachedLines = EMPTY
  }
  return cachedLines
}

function write(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines))
  } catch {
    /* storage unavailable (private mode): the cart simply does not persist */
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function addToCart(bookId: string, quantity = 1): void {
  const lines = read()
  const existing = lines.find((line) => line.bookId === bookId)
  write(
    existing
      ? lines.map((line) =>
          line.bookId === bookId
            ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
            : line,
        )
      : [...lines, { bookId, quantity: Math.min(MAX_QUANTITY, quantity) }].slice(0, MAX_LINES),
  )
}

export function setCartQuantity(bookId: string, quantity: number): void {
  write(
    read().map((line) =>
      line.bookId === bookId
        ? { ...line, quantity: Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity))) }
        : line,
    ),
  )
}

export function removeFromCart(bookIds: string[]): void {
  write(read().filter((line) => !bookIds.includes(line.bookId)))
}

export function clearCart(): void {
  write([])
}
