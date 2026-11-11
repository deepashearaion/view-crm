import {
  Download,
  FileText,
  FolderOpen,
  Image,
  MoreHorizontal,
  Trash2,
  Unlink,
  Upload,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserLookup } from '@/features/auth';
import { formatDateTime } from '@/lib/format';
import { errorMessage } from '@/services';

import { formatBytes, MAX_UPLOAD_BYTES } from '../file-cabinet/api/files';
import {
  useDeleteFile,
  useFiles,
  useSetFileContact,
  useUploadFiles,
} from '../file-cabinet/hooks/use-files';
import { FILE_CATEGORIES, type FileCategory, type StoredFile } from '../file-cabinet/types';
import type { ContactRef } from '../types';

/** Folders that make sense for a customer's files (the bot/article folders are org-wide). */
const CONTACT_FOLDERS = FILE_CATEGORIES.filter((category) => !('limit' in category));

const folderLabel = (value: FileCategory) =>
  FILE_CATEGORIES.find((category) => category.value === value)?.label ?? value;

/** A contact's files: upload straight to the contact, download, unlink or delete. */
export function ContactFilesPanel({ contact, canEdit }: { contact: ContactRef; canEdit: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: allFiles = [], isPending, error } = useFiles();
  const users = useUserLookup();
  const upload = useUploadFiles();
  const setContact = useSetFileContact();
  const deleteFile = useDeleteFile();
  const [folder, setFolder] = useState<FileCategory>('documents');
  const [pendingDelete, setPendingDelete] = useState<StoredFile | null>(null);

  const files = useMemo(
    () =>
      allFiles
        .filter((file) => file.contactId === contact.id)
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    [allFiles, contact.id],
  );

  const handleFiles = (list: FileList | null) => {
    const selected = Array.from(list ?? []);
    if (selected.length === 0) return;
    const tooBig = selected.filter((file) => file.size > MAX_UPLOAD_BYTES);
    if (tooBig.length) {
      toast.error(`${tooBig.map((file) => file.name).join(', ')} exceed the 25 MB limit.`);
      return;
    }
    upload.mutate(
      { files: selected, category: folder, contactId: contact.id },
      {
        onSuccess: ({ uploaded, failed }) => {
          if (uploaded.length) {
            toast.success(
              `Added ${String(uploaded.length)} file${uploaded.length === 1 ? '' : 's'} to ${contact.fullName || 'this contact'}.`,
            );
          }
          if (failed.length) toast.error(`Couldn’t upload ${failed.join(', ')}.`);
        },
      },
    );
  };

  const unlink = (file: StoredFile) => {
    setContact.mutate(
      { id: file.id, contactId: null },
      {
        onSuccess: () => {
          toast.success(`“${file.name}” removed from this contact. It stays in the File cabinet.`);
        },
        onError: (err) => toast.error(errorMessage(err, 'Couldn’t update the file.')),
      },
    );
  };

  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={folder}
            onValueChange={(value) => {
              setFolder(value as FileCategory);
            }}
          >
            <SelectTrigger className="h-8 w-36" aria-label="Folder for new files">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_FOLDERS.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <Button size="sm" disabled={upload.isPending} onClick={() => inputRef.current?.click()}>
            <Upload aria-hidden />
            {upload.isPending ? 'Uploading…' : 'Upload files'}
          </Button>
        </div>
      )}

      {Boolean(error) && <InlineAlert>{errorMessage(error, 'Couldn’t load files.')}</InlineAlert>}

      {isPending ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading files">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <FolderOpen aria-hidden className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">No files for this contact yet</p>
          <p className="text-xs text-muted-foreground">
            Upload quotations, IDs or documents here, or link existing ones from the File cabinet.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {files.map((file) => {
            const Icon = file.mimeType.startsWith('image/') ? Image : FileText;
            const uploader = file.ownerId ? users.get(file.ownerId)?.name : undefined;
            return (
              <li key={file.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon aria-hidden className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium [overflow-wrap:anywhere]" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {folderLabel(file.category)} · {formatBytes(file.size)} ·{' '}
                    {formatDateTime(file.uploadedAt)}
                    {uploader && ` · ${uploader}`}
                  </p>
                </div>
                {file.url && (
                  <Button variant="ghost" size="icon-sm" asChild>
                    <a href={file.url} download={file.name} aria-label={`Download ${file.name}`}>
                      <Download aria-hidden />
                    </a>
                  </Button>
                )}
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${file.name}`}
                      >
                        <MoreHorizontal aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          unlink(file);
                        }}
                      >
                        <Unlink aria-hidden />
                        Remove from contact
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          setPendingDelete(file);
                        }}
                      >
                        <Trash2 aria-hidden />
                        Delete file
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this file?"
        description={`“${pendingDelete?.name ?? ''}” will be deleted from the File cabinet for everyone.`}
        confirmLabel="Delete"
        destructive
        pending={deleteFile.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteFile.mutate(pendingDelete.id, {
            onSuccess: () => {
              toast.success('File deleted.');
              setPendingDelete(null);
            },
            onError: () => {
              toast.error('Couldn’t delete the file.');
            },
          });
        }}
      />
    </div>
  );
}
