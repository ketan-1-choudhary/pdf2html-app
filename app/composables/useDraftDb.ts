// IndexedDB-backed draft outbox: one row per pageId, holding only pending
// (not-yet-pushed) local edits. A row is deleted once its Mongo push succeeds,
// so the mere presence of a row means "unsynced local work".

const DB_NAME = 'pdf-converter-drafts'
const DB_VERSION = 1
const STORE = 'drafts'

export interface DraftRecord {
  pageId: string
  html: string
  css: string
  updatedAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'pageId' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx(db: IDBDatabase, mode: IDBTransactionMode) {
  return db.transaction(STORE, mode).objectStore(STORE)
}

function wrap<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function useDraftDb() {
  async function saveDraft(pageId: string, html: string, css: string) {
    const db = await openDb()
    const record: DraftRecord = { pageId, html, css, updatedAt: Date.now() }
    await wrap(tx(db, 'readwrite').put(record))
    return record
  }

  async function getDraft(pageId: string): Promise<DraftRecord | undefined> {
    const db = await openDb()
    return wrap(tx(db, 'readonly').get(pageId))
  }

  async function deleteDraft(pageId: string) {
    const db = await openDb()
    await wrap(tx(db, 'readwrite').delete(pageId))
  }

  async function getAllDrafts(): Promise<DraftRecord[]> {
    const db = await openDb()
    return wrap<DraftRecord[]>(tx(db, 'readonly').getAll())
  }

  async function countDrafts(): Promise<number> {
    const db = await openDb()
    return wrap(tx(db, 'readonly').count())
  }

  return { saveDraft, getDraft, deleteDraft, getAllDrafts, countDrafts }
}
