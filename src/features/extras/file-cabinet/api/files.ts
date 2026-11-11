import { http } from '@/services';

import type { FileCategory, StoredFile, StoredFileDto } from '../types';

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function toStoredFile(dto: StoredFileDto): StoredFile {
  return {
    id: String(dto.id),
    name: dto.name,
    size: dto.size,
    mimeType: dto.mime_type,
    category: dto.category,
    ownerId: dto.owner_id === null ? null : String(dto.owner_id),
    contactId:
      dto.contact_id === null || dto.contact_id === undefined ? null : String(dto.contact_id),
    url: dto.url,
    uploadedAt: dto.uploaded_at,
  };
}

export async function fetchFiles(signal?: AbortSignal): Promise<StoredFile[]> {
  const response = await http.get<{ files: StoredFileDto[] }>('/api/files', { signal });
  return response.files.map(toStoredFile);
}

export async function uploadFile(
  file: File,
  category: FileCategory,
  contactId: string | null = null,
): Promise<StoredFile> {
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  if (contactId) form.append('contact_id', contactId);
  const response = await http.upload<{ file: StoredFileDto }>('/api/files', form);
  return toStoredFile(response.file);
}

/** Links a file to a contact, or unlinks it with null. */
export async function setFileContact(id: string, contactId: string | null): Promise<StoredFile> {
  const response = await http.patch<{ file: StoredFileDto }>(
    `/api/files/${encodeURIComponent(id)}`,
    { contact_id: contactId === null ? null : Number(contactId) },
  );
  return toStoredFile(response.file);
}

export async function deleteFile(id: string): Promise<void> {
  await http.delete(`/api/files/${encodeURIComponent(id)}`);
}

const units = ['B', 'KB', 'MB', 'GB'] as const;

/** 1536 → "1.5 KB". */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit] ?? 'B'}`;
}
