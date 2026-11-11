import type { ColumnDef } from '@tanstack/react-table';
import {
  Download,
  FileText,
  FolderOpen,
  Image,
  Link2,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
  facetFilterFn,
} from '@/components/data/data-table';
import { PageHeader } from '@/components/data/page-header';
import { SearchInput } from '@/components/data/search-input';
import { UserChip } from '@/components/data/user-chip';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserLookup, type User } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { ContactPickerDialog } from '../../components/contact-picker-dialog';

import { formatBytes, MAX_UPLOAD_BYTES } from '../api/files';
import { useDeleteFile, useFiles, useSetFileContact, useUploadFiles } from '../hooks/use-files';
import { FILE_CATEGORIES, type FileCategory, type StoredFile } from '../types';

const ALL = 'all';

function categoryLabel(value: FileCategory) {
  return FILE_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

function getColumns(
  users: Map<string, User>,
  contactName: (id: string) => string,
  onLinkContact: (file: StoredFile) => void,
  onDelete: (file: StoredFile) => void,
): ColumnDef<StoredFile>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      meta: { label: 'Name', className: 'max-w-96' },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const Icon = row.original.mimeType.startsWith('image/') ? Image : FileText;
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">{row.original.name}</span>
          </div>
        );
      },
    },
    {
      id: 'contact',
      accessorFn: (file) => (file.contactId ? contactName(file.contactId) : ''),
      meta: { label: 'Contact' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ row }) =>
        row.original.contactId ? (
          <Link
            to={`${paths.contacts}/${row.original.contactId}`}
            className="inline-flex max-w-48 items-center gap-1.5 truncate font-medium text-primary hover:underline"
          >
            <UserRound aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{contactName(row.original.contactId)}</span>
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      filterFn: facetFilterFn,
      meta: { label: 'Folder' },
      header: 'Folder',
      cell: ({ row }) => categoryLabel(row.original.category),
    },
    {
      id: 'size',
      accessorKey: 'size',
      meta: { label: 'Size', className: 'text-right tabular-nums whitespace-nowrap' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Size" />,
      cell: ({ getValue }) => formatBytes(getValue<number>()),
    },
    {
      id: 'owner',
      accessorFn: (file) => file.ownerId ?? '',
      meta: { label: 'Uploaded by' },
      header: 'Uploaded by',
      cell: ({ row }) => (
        <UserChip name={row.original.ownerId ? users.get(row.original.ownerId)?.name : undefined} />
      ),
    },
    {
      id: 'uploadedAt',
      accessorKey: 'uploadedAt',
      sortingFn: 'datetime',
      meta: { label: 'Uploaded', className: 'whitespace-nowrap' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Uploaded" />,
      cell: ({ getValue }) => formatDateTime(getValue<string>()),
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      meta: { className: 'w-24 text-right' },
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {row.original.url && (
            <Button variant="ghost" size="icon-sm" asChild>
              <a
                href={row.original.url}
                download={row.original.name}
                aria-label={`Download ${row.original.name}`}
              >
                <Download aria-hidden />
              </a>
            </Button>
          )}
          <DataTableRowActions
            label={`Actions for ${row.original.name}`}
            actions={[
              {
                label: row.original.contactId ? 'Change contact' : 'Link to contact',
                icon: Link2,
                onSelect: () => {
                  onLinkContact(row.original);
                },
              },
              {
                label: 'Delete',
                separatorBefore: true,
                icon: Trash2,
                destructive: true,
                onSelect: () => {
                  onDelete(row.original);
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];
}

export default function FileCabinetPage() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: files = [], isPending, error, refetch } = useFiles();
  const users = useUserLookup();
  const upload = useUploadFiles();
  const deleteFile = useDeleteFile();
  const [folder, setFolder] = useState<FileCategory | typeof ALL>(ALL);
  const [uploadTo, setUploadTo] = useState<FileCategory>('documents');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<StoredFile | null>(null);
  const { data: contacts = [] } = useContacts();
  const setFileContact = useSetFileContact();
  /** New uploads go to this contact (optional). */
  const [uploadContactId, setUploadContactId] = useState<string | null>(null);
  /** The file being linked, or 'upload' while choosing the contact for new uploads. */
  const [picking, setPicking] = useState<StoredFile | 'upload' | null>(null);

  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );
  const contactName = (id: string) => contactNames.get(id) || `Contact #${id}`;

  const byCategory = useMemo(() => {
    const map = new Map<FileCategory, { count: number; bytes: number }>();
    for (const file of files) {
      const entry = map.get(file.category) ?? { count: 0, bytes: 0 };
      map.set(file.category, { count: entry.count + 1, bytes: entry.bytes + file.size });
    }
    return map;
  }, [files]);

  const visible = useMemo(
    () => (folder === ALL ? files : files.filter((file) => file.category === folder)),
    [files, folder],
  );
  const columns = useMemo(
    () =>
      getColumns(
        users,
        (id) => contactNames.get(id) || `Contact #${id}`,
        setPicking,
        setPendingDelete,
      ),
    [users, contactNames],
  );

  const onPickContact = (contactId: string | null) => {
    if (picking === 'upload') {
      setUploadContactId(contactId);
      setPicking(null);
      return;
    }
    if (!picking) return;
    const file = picking;
    setFileContact.mutate(
      { id: file.id, contactId },
      {
        onSuccess: () => {
          toast.success(
            contactId
              ? `“${file.name}” linked to ${contactName(contactId)}.`
              : `“${file.name}” is no longer linked to a contact.`,
          );
          setPicking(null);
        },
        onError: (err) => toast.error(errorMessage(err, 'Couldn’t update the file.')),
      },
    );
  };

  const handleFiles = (list: FileList | null) => {
    const selected = Array.from(list ?? []);
    if (selected.length === 0) return;
    const tooBig = selected.filter((file) => file.size > MAX_UPLOAD_BYTES);
    const category = FILE_CATEGORIES.find((item) => item.value === uploadTo);
    const limit = category && 'limit' in category ? category.limit : undefined;
    const used = byCategory.get(uploadTo)?.count ?? 0;
    if (tooBig.length) {
      toast.error(`${tooBig.map((file) => file.name).join(', ')} exceed the 25 MB limit.`);
      return;
    }
    if (limit !== undefined && used + selected.length > limit) {
      toast.error(`${categoryLabel(uploadTo)} holds at most ${String(limit)} files.`);
      return;
    }
    upload.mutate(
      { files: selected, category: uploadTo, contactId: uploadContactId },
      {
        onSuccess: ({ uploaded, failed }) => {
          if (uploaded.length)
            toast.success(
              `Uploaded ${String(uploaded.length)} file${uploaded.length === 1 ? '' : 's'}${
                uploadContactId ? ` to ${contactName(uploadContactId)}` : ''
              }.`,
            );
          if (failed.length) toast.error(`Couldn’t upload ${failed.join(', ')}.`);
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="File cabinet"
        description="Shared documents, images and knowledge-base articles for your team and bots."
        actions={
          <>
            {uploadContactId ? (
              <span className="inline-flex h-9 items-center gap-1 rounded-md border pr-1 pl-2.5 text-sm">
                <UserRound aria-hidden className="size-3.5 text-muted-foreground" />
                <span className="max-w-40 truncate">{contactName(uploadContactId)}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Don’t attach uploads to a contact"
                  onClick={() => {
                    setUploadContactId(null);
                  }}
                >
                  <X aria-hidden />
                </Button>
              </span>
            ) : (
              <Button
                variant="outline"
                className="h-9"
                onClick={() => {
                  setPicking('upload');
                }}
              >
                <Link2 aria-hidden />
                Attach to contact
              </Button>
            )}
            <Select
              value={uploadTo}
              onValueChange={(value) => {
                setUploadTo(value as FileCategory);
              }}
            >
              <SelectTrigger className="h-9 w-44" aria-label="Upload to folder">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              multiple
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = '';
              }}
            />
            <Button disabled={upload.isPending} onClick={() => inputRef.current?.click()}>
              <Upload aria-hidden />
              {upload.isPending ? 'Uploading…' : 'Upload files'}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FILE_CATEGORIES.map((category) => {
          const stats = byCategory.get(category.value) ?? { count: 0, bytes: 0 };
          const limit = 'limit' in category ? category.limit : undefined;
          const active = folder === category.value;
          return (
            <Card
              key={category.value}
              className={cn(
                'gap-0 py-0 transition-colors',
                active && 'border-primary ring-2 ring-primary/20',
              )}
            >
              <CardContent className="p-0">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFolder(active ? ALL : category.value);
                  }}
                  className="w-full space-y-2 rounded-xl p-4 text-left focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FolderOpen aria-hidden className="size-4 text-muted-foreground" />
                    {category.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {stats.count} file{stats.count === 1 ? '' : 's'} · {formatBytes(stats.bytes)}
                    {limit !== undefined && ` · ${String(stats.count)}/${String(limit)}`}
                  </span>
                  {limit !== undefined && (
                    <Progress
                      value={(stats.count / limit) * 100}
                      aria-label={`${category.label} capacity`}
                      className="h-1"
                    />
                  )}
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DataTable
        label="Files"
        storageKey="files"
        columns={columns}
        data={visible}
        getRowId={(file) => file.id}
        globalFilter={search}
        isLoading={isPending}
        error={error}
        onRetry={() => void refetch()}
        initialSorting={[{ id: 'uploadedAt', desc: true }]}
        toolbar={() => (
          <SearchInput value={search} onValueChange={setSearch} placeholder="Search files…" />
        )}
        emptyState={
          <EmptyState
            icon={FolderOpen}
            title={folder === ALL ? 'No files yet' : `${categoryLabel(folder)} is empty`}
            description="Upload documents, images or articles to share them with your team."
            className="border-none"
            actions={
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                <Upload aria-hidden />
                Upload files
              </Button>
            }
          />
        }
      />

      <ContactPickerDialog
        open={picking !== null}
        onOpenChange={(open) => {
          if (!open) setPicking(null);
        }}
        title={
          picking === 'upload'
            ? 'Attach uploads to a contact'
            : picking?.contactId
              ? 'Change contact'
              : 'Link to a contact'
        }
        description={
          picking === 'upload'
            ? 'Files you upload next will appear in this contact’s Files tab.'
            : picking
              ? `“${picking.name}” will appear in the contact’s Files tab.`
              : undefined
        }
        currentContactId={picking === 'upload' ? uploadContactId : (picking?.contactId ?? null)}
        onSelect={onPickContact}
        pending={setFileContact.isPending}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this file?"
        description={`“${pendingDelete?.name ?? ''}” will be removed for everyone.`}
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
