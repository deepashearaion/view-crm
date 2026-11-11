import type { FileCategory, StoredFileDto } from '@/features/extras';

import { currentUserId, db, newId, reserveIds } from '../db';
import { loadValue, saveValue } from '../persist';
import { mock, mockError } from '../router';

const categories: FileCategory[] = [
  'images',
  'quotations',
  'documents',
  'invoices',
  'bot_images',
  'bot_documents',
  'sales_articles',
  'service_articles',
];

/** Persisted form: metadata plus the file's bytes (object URLs don't survive a reload). */
interface PersistedFile {
  dto: Omit<StoredFileDto, 'url'>;
  blob: Blob | null;
}

const STORAGE_KEY = 'files';
const blobs = new Map<number, Blob>();

const ready: Promise<void> = (async () => {
  const saved = await loadValue<PersistedFile[]>(STORAGE_KEY);
  if (!saved) return;
  reserveIds(saved.map(({ dto }) => dto.id));
  db.files = saved.map(({ dto, blob }) => {
    if (blob) blobs.set(dto.id, blob);
    return {
      ...dto,
      contact_id: dto.contact_id ?? null,
      url: blob ? URL.createObjectURL(blob) : null,
    };
  });
})();

function persist(): Promise<void> {
  return saveValue(
    STORAGE_KEY,
    db.files.map((file): PersistedFile => {
      // Object URLs die with the page; the blob is stored instead.
      const dto: PersistedFile['dto'] & { url?: unknown } = { ...file };
      delete dto.url;
      return { dto, blob: blobs.get(file.id) ?? null };
    }),
  );
}

function contactIdFrom(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) mockError(422, 'contact_id must be a contact id');
  return id;
}

mock('GET', '/api/files', async () => {
  await ready;
  return { files: db.files };
});

/** Keeps the bytes in IndexedDB so the file stays downloadable after a reload. */
mock('POST', '/api/files', async ({ body }) => {
  await ready;
  if (!(body instanceof FormData)) mockError(400, 'Expected multipart form data');
  const file = body.get('file');
  const category = body.get('category');
  if (!(file instanceof File)) mockError(400, 'file is required');
  if (typeof category !== 'string' || !categories.includes(category as FileCategory)) {
    mockError(400, 'Unknown category');
  }
  const stored: StoredFileDto = {
    id: newId(),
    name: file.name,
    size: file.size,
    mime_type: file.type || 'application/octet-stream',
    category: category as FileCategory,
    owner_id: currentUserId(),
    contact_id: contactIdFrom(body.get('contact_id')),
    url: URL.createObjectURL(file),
    uploaded_at: new Date().toISOString(),
  };
  blobs.set(stored.id, file);
  db.files.unshift(stored);
  await persist();
  return { file: stored };
});

/** Body: { contact_id: number | null } to link or unlink a contact. */
mock('PATCH', '/api/files/:id', async ({ params, body }) => {
  await ready;
  const file = db.files.find((item) => String(item.id) === params.id);
  if (!file) mockError(404, 'File not found');
  if (typeof body !== 'object' || body === null || !('contact_id' in body)) {
    mockError(422, 'contact_id is required');
  }
  file.contact_id = contactIdFrom(body.contact_id);
  await persist();
  return { file };
});

mock('DELETE', '/api/files/:id', async ({ params }) => {
  await ready;
  const file = db.files.find((item) => String(item.id) === params.id);
  if (!file) mockError(404, 'File not found');
  if (file.url?.startsWith('blob:')) URL.revokeObjectURL(file.url);
  blobs.delete(file.id);
  db.files = db.files.filter((item) => item !== file);
  await persist();
  return { message: 'File deleted' };
});
