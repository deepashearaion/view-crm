import type { FileCategory, StoredFileDto } from '@/features/extras';

import { db, newId } from '../db';
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

mock('GET', '/api/files', () => ({ files: db.files }));

/** Keeps the file in memory as an object URL so it can be downloaded this session. */
mock('POST', '/api/files', ({ body }) => {
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
    owner_id: 7,
    url: URL.createObjectURL(file),
    uploaded_at: new Date().toISOString(),
  };
  db.files.unshift(stored);
  return { file: stored };
});

mock('DELETE', '/api/files/:id', ({ params }) => {
  const file = db.files.find((item) => String(item.id) === params.id);
  if (!file) mockError(404, 'File not found');
  if (file.url?.startsWith('blob:')) URL.revokeObjectURL(file.url);
  db.files = db.files.filter((item) => item !== file);
  return { message: 'File deleted' };
});
