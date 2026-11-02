export const FILE_CATEGORIES = [
  { value: 'images', label: 'Images' },
  { value: 'quotations', label: 'Quotations' },
  { value: 'documents', label: 'Documents' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'bot_images', label: 'Bot images', limit: 10 },
  { value: 'bot_documents', label: 'Bot documents', limit: 10 },
  { value: 'sales_articles', label: 'Sales articles', limit: 10 },
  { value: 'service_articles', label: 'Service articles', limit: 10 },
] as const;

export type FileCategory = (typeof FILE_CATEGORIES)[number]['value'];

export interface StoredFileDto {
  id: number;
  name: string;
  size: number;
  mime_type: string;
  category: FileCategory;
  owner_id: number | null;
  url: string | null;
  uploaded_at: string;
}

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  ownerId: string | null;
  url: string | null;
  uploadedAt: string;
}
