import type { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ExternalLink, RefreshCw, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  DataTableColumnHeader,
  DataTableRowActions,
  facetFilterFn,
  type RowAction,
} from '@/components/data/data-table';
import { UserChip } from '@/components/data/user-chip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { User } from '@/features/auth';
import {
  LIFECYCLE_STAGES,
  LifecycleStageBadge,
  OptedOutBadge,
  TemperatureBadge,
  type Contact,
  type LifecycleStage,
} from '@/features/contacts';
import { formatDateTime, formatRelativeTime } from '@/lib/format';

import { stageMovesFor } from '../constants';

const stageOrder = (stage: string) => LIFECYCLE_STAGES.findIndex((entry) => entry.id === stage);

const muted = <span className="text-muted-foreground">—</span>;

interface LeadColumnOptions {
  users: Map<string, User>;
  contactHref: (contact: Contact) => string;
  onOpen: (contact: Contact) => void;
  onRescore: (contact: Contact) => void;
  onSetStage: (contact: Contact, stage: LifecycleStage) => void;
  /** False for viewers: hides re-score and stage changes. */
  canEdit: boolean;
}

export function getLeadColumns({
  users,
  contactHref,
  onOpen,
  onRescore,
  onSetStage,
  canEdit,
}: LeadColumnOptions): ColumnDef<Contact>[] {
  return [
    {
      id: 'name',
      accessorFn: (contact) => `${contact.fullName} ${contact.email} ${contact.mobile}`,
      meta: { label: 'Name' },
      enableHiding: false,
      sortingFn: (a, b) => a.original.fullName.localeCompare(b.original.fullName),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-medium">
            <Link
              to={contactHref(row.original)}
              className="truncate underline-offset-4 hover:underline"
            >
              {row.original.fullName || 'Unnamed lead'}
            </Link>
            <OptedOutBadge optedOutAt={row.original.optedOutAt} />
          </p>
          {(row.original.email || row.original.mobile) && (
            <p className="truncate text-xs text-muted-foreground">
              {row.original.email || row.original.mobile}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'score',
      accessorFn: (contact) => contact.score ?? -1,
      meta: { label: 'Score' },
      enableGlobalFilter: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Score" />,
      cell: ({ row }) => <TemperatureBadge contact={row.original} />,
    },
    {
      id: 'lifecycle',
      accessorKey: 'lifecycleStage',
      meta: { label: 'Stage' },
      filterFn: facetFilterFn,
      enableGlobalFilter: false,
      sortingFn: (a, b) =>
        stageOrder(a.original.lifecycleStage) - stageOrder(b.original.lifecycleStage),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stage" />,
      cell: ({ row }) => <LifecycleStageBadge stage={row.original.lifecycleStage} />,
    },
    {
      id: 'source',
      accessorKey: 'source',
      meta: { label: 'Source' },
      filterFn: facetFilterFn,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
      cell: ({ getValue }) => getValue<string>() || muted,
    },
    {
      id: 'destination',
      accessorKey: 'destination',
      meta: { label: 'Destination' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Destination" />,
      cell: ({ getValue }) => getValue<string>() || muted,
    },
    {
      id: 'owner',
      accessorFn: (contact) => contact.leadOwnerId ?? '',
      meta: { label: 'Owner' },
      filterFn: facetFilterFn,
      enableGlobalFilter: false,
      sortingFn: (a, b) =>
        (users.get(a.original.leadOwnerId ?? '')?.name ?? '').localeCompare(
          users.get(b.original.leadOwnerId ?? '')?.name ?? '',
        ),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
      cell: ({ row }) => (
        <UserChip
          name={row.original.leadOwnerId ? users.get(row.original.leadOwnerId)?.name : undefined}
        />
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      meta: { label: 'Captured', className: 'whitespace-nowrap' },
      sortingFn: 'datetime',
      enableGlobalFilter: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Captured" />,
      cell: ({ getValue }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <time dateTime={getValue<string>()} className="text-muted-foreground">
              {formatRelativeTime(getValue<string>())}
            </time>
          </TooltipTrigger>
          <TooltipContent>{formatDateTime(getValue<string>())}</TooltipContent>
        </Tooltip>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      meta: { className: 'w-12 text-right' },
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const contact = row.original;
        const actions: RowAction[] = [
          {
            label: 'Open contact',
            icon: ExternalLink,
            onSelect: () => {
              onOpen(contact);
            },
          },
        ];
        if (canEdit) {
          const { forward, canLose } = stageMovesFor(contact.lifecycleStage);
          actions.push({
            label: 'Re-score',
            icon: RefreshCw,
            onSelect: () => {
              onRescore(contact);
            },
          });
          forward.forEach((move, index) => {
            actions.push({
              label: move.label,
              icon: ArrowRight,
              separatorBefore: index === 0,
              onSelect: () => {
                onSetStage(contact, move.stage);
              },
            });
          });
          if (canLose)
            actions.push({
              label: 'Mark as lost',
              icon: XCircle,
              destructive: true,
              separatorBefore: true,
              onSelect: () => {
                onSetStage(contact, 'lost');
              },
            });
        }
        return <DataTableRowActions label={`Actions for ${contact.fullName}`} actions={actions} />;
      },
    },
  ];
}
