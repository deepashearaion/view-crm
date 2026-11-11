import { ChevronDown, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  PERMISSION_ACTIONS,
  PERMISSION_SCOPES,
  scopeOf,
  type ModuleSpec,
  type PermissionAction,
  type PermissionScope,
  type Permissions,
} from '@/features/auth';
import { cn } from '@/lib/utils';

import {
  ACTION_LABELS,
  SCOPE_LABELS,
  SCOPE_RANK,
  applyRowPreset,
  cellKey,
  rowPresetOf,
  setCell,
  setColumn,
  type RowPreset,
} from '../permission-grid';

const PRESET_LABELS: Record<RowPreset, string> = {
  none: 'No access',
  read: 'Read only',
  full: 'Full',
};

interface ScopeControlProps {
  label: string;
  scopes: PermissionScope[];
  value: PermissionScope;
  onChange: (scope: PermissionScope) => void;
  disabled: boolean;
  invalid: boolean;
  aboveOwn: boolean;
}

/** Segmented None / Own / All picker offering only the scopes the catalog allows. */
function ScopeControl({
  label,
  scopes,
  value,
  onChange,
  disabled,
  invalid,
  aboveOwn,
}: ScopeControlProps) {
  const ordered = PERMISSION_SCOPES.filter((scope) => scopes.includes(scope));
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid || undefined}
      className={cn(
        'inline-flex rounded-lg border bg-muted/40 p-0.5',
        aboveOwn && 'border-warning ring-1 ring-warning/40',
        invalid && 'border-destructive ring-1 ring-destructive/40',
      )}
    >
      {ordered.map((scope) => {
        const checked = scope === value;
        return (
          <button
            key={scope}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => {
              onChange(scope);
            }}
            className={cn(
              'h-6 min-w-10 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors',
              'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
              'enabled:hover:text-foreground disabled:cursor-not-allowed',
              checked &&
                (scope === 'none'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'bg-primary text-primary-foreground shadow-sm enabled:hover:text-primary-foreground'),
            )}
          >
            {SCOPE_LABELS[scope]}
          </button>
        );
      })}
    </div>
  );
}

interface PermissionGridProps {
  catalog: ModuleSpec[];
  value: Permissions;
  onChange: (next: Permissions) => void;
  readOnly?: boolean;
  /** Server errors keyed `permissions.<module>.<action>`. */
  errors?: Record<string, string>;
  /** The editor's own permissions; cells above them are marked (they can't be granted). */
  ownPermissions?: Permissions;
}

export function PermissionGrid({
  catalog,
  value,
  onChange,
  readOnly = false,
  errors = {},
  ownPermissions,
}: PermissionGridProps) {
  const columnScopes = (action: PermissionAction) =>
    PERMISSION_SCOPES.filter((scope) =>
      catalog.some((spec) =>
        spec.actions.some((item) => item.action === action && item.scopes.includes(scope)),
      ),
    );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Permissions by module and action</caption>
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Module
              </th>
              {PERMISSION_ACTIONS.map((action) => (
                <th key={action} scope="col" className="px-2 py-2 text-left font-medium">
                  {readOnly ? (
                    ACTION_LABELS[action]
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="-ml-2 text-muted-foreground"
                          aria-label={`Set ${ACTION_LABELS[action]} for every module`}
                        >
                          {ACTION_LABELS[action]}
                          <ChevronDown aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>
                          {ACTION_LABELS[action]} for every module
                        </DropdownMenuLabel>
                        {columnScopes(action).map((scope) => (
                          <DropdownMenuItem
                            key={scope}
                            onSelect={() => {
                              onChange(setColumn(value, catalog, action, scope));
                            }}
                          >
                            {SCOPE_LABELS[scope]}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </th>
              ))}
              {!readOnly && (
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  <span className="sr-only">Presets</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {catalog.map((spec) => {
              const preset = rowPresetOf(value, spec);
              return (
                <tr key={spec.module} className="border-t align-top">
                  <th scope="row" className="px-3 py-2.5 text-left font-normal">
                    <span className="block font-medium">{spec.label}</span>
                    <span className="block font-mono text-xs text-muted-foreground">
                      {spec.module}
                    </span>
                  </th>
                  {PERMISSION_ACTIONS.map((action) => {
                    const item = spec.actions.find((entry) => entry.action === action);
                    if (!item) {
                      return (
                        <td key={action} className="px-2 py-2.5 text-muted-foreground">
                          <span aria-label="Not available">—</span>
                        </td>
                      );
                    }
                    const scope = scopeOf(value, spec.module, action);
                    const error = errors[cellKey(spec.module, action)];
                    const aboveOwn =
                      !readOnly &&
                      ownPermissions !== undefined &&
                      SCOPE_RANK[scope] > SCOPE_RANK[scopeOf(ownPermissions, spec.module, action)];
                    return (
                      <td key={action} className="px-2 py-2.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex">
                              <ScopeControl
                                label={`${spec.label}: ${ACTION_LABELS[action]}`}
                                scopes={item.scopes}
                                value={scope}
                                disabled={readOnly}
                                invalid={error !== undefined}
                                aboveOwn={aboveOwn}
                                onChange={(next) => {
                                  onChange(setCell(value, spec, action, next));
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="flex-col items-start gap-0.5">
                            <span>{item.description}</span>
                            {aboveOwn && (
                              <span className="font-medium">
                                More than you have yourself; you can’t grant this.
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
                      </td>
                    );
                  })}
                  {!readOnly && (
                    <td className="px-3 py-2.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="xs"
                            aria-label={`Preset for ${spec.label}`}
                          >
                            {preset ? PRESET_LABELS[preset] : 'Custom'}
                            <ChevronDown aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(['none', 'read', 'full'] as const).map((option) => (
                            <DropdownMenuItem
                              key={option}
                              onSelect={() => {
                                onChange(applyRowPreset(value, spec, option));
                              }}
                            >
                              {PRESET_LABELS[option]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
        <span>
          <strong className="font-medium text-foreground">Own</strong> = records they own, or tasks
          assigned to them
        </span>
        <span>
          <strong className="font-medium text-foreground">All</strong> = everyone’s records
        </span>
        <span>
          <strong className="font-medium text-foreground">—</strong> = the module has no such action
        </span>
        {!readOnly && ownPermissions && (
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-3 rounded-sm border border-warning" />
            More than you have yourself
          </span>
        )}
      </div>
      {!readOnly && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Edit and Delete never reach further than View: lowering View lowers them, and raising them
          raises View to match.
        </p>
      )}
    </div>
  );
}
