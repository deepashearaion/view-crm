import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CircleCheckBig,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/data/page-header';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { plural } from '@/lib/format';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { autoMap, mapRows, validateRows } from '../api/mapping';
import { ImportSteps } from '../components/steps';
import { UploadStep } from '../components/upload-step';
import { IMPORT_FIELDS, TARGET_LABELS } from '../constants';
import { useImport } from '../hooks/use-import';
import { isImportTarget, type ColumnMapping, type ImportTarget, type ParsedFile } from '../types';

const SKIP = '__skip__';
const PREVIEW_ROWS = 8;

export default function ImportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get('target');
  const target: ImportTarget = isImportTarget(param) ? param : 'contacts';
  const labels = TARGET_LABELS[target];
  const fields = IMPORT_FIELDS[target];

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const runImport = useImport();

  const rows = useMemo(() => (file ? mapRows(file, mapping) : []), [file, mapping]);
  const issues = useMemo(() => validateRows(target, rows), [target, rows]);
  const validCount = rows.length - issues.length;
  const invalidRows = useMemo(() => new Set(issues.map((issue) => issue.row)), [issues]);

  const reset = () => {
    setStep(0);
    setFile(null);
    setMapping({});
    runImport.reset();
  };

  const missingRequired = fields.filter((field) => field.required && mapping[field.key] == null);
  const contactNameMissing =
    target === 'contacts' && mapping.fullName == null && mapping.firstName == null;

  const startImport = () => {
    const valid = rows.filter((_, index) => !invalidRows.has(index + 1));
    runImport.mutate(
      { target, rows: valid },
      {
        onSettled: () => {
          setStep(3);
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Bulk import"
        description="Bring contacts or companies in from a spreadsheet."
        actions={
          <Button variant="outline" asChild>
            <Link to={target === 'contacts' ? paths.contacts : paths.companies}>
              <ArrowLeft aria-hidden />
              Back to {labels.plural}
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          value={target}
          onValueChange={(value) => {
            if (isImportTarget(value) && step < 3) {
              reset();
              setSearchParams({ target: value }, { replace: true });
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="contacts" disabled={runImport.isPending}>
              Contacts
            </TabsTrigger>
            <TabsTrigger value="companies" disabled={runImport.isPending}>
              Companies
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <ImportSteps current={step} />
      </div>

      <Card>
        <CardContent className="space-y-5">
          {step === 0 && (
            <UploadStep
              target={target}
              onParsed={(parsed) => {
                setFile(parsed);
                setMapping(autoMap(target, parsed.headers));
                setStep(1);
              }}
            />
          )}

          {step === 1 && file && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet aria-hidden className="size-4 text-muted-foreground" />
                <span className="font-medium">{file.name}</span>
                <span className="text-muted-foreground">· {plural(file.rows.length, 'row')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We matched columns by their header. Check each field and pick the right column.
              </p>
              <div className="divide-y rounded-lg border">
                {fields.map((field) => {
                  const column = mapping[field.key];
                  const sample = column == null ? '' : (file.rows[0]?.[column] ?? '');
                  return (
                    <div
                      key={field.key}
                      className="grid items-center gap-2 p-3 sm:grid-cols-[1fr_16rem_1fr]"
                    >
                      <span id={`map-${field.key}`} className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive"> *</span>}
                      </span>
                      <Select
                        value={column == null ? SKIP : String(column)}
                        onValueChange={(value) => {
                          setMapping((current) => ({
                            ...current,
                            [field.key]: value === SKIP ? null : Number(value),
                          }));
                        }}
                      >
                        <SelectTrigger className="h-9 w-full" aria-labelledby={`map-${field.key}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SKIP} className="text-muted-foreground">
                            Don’t import
                          </SelectItem>
                          {file.headers.map((header, index) => (
                            <SelectItem key={`${header}-${String(index)}`} value={String(index)}>
                              {header || `Column ${String(index + 1)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="truncate text-sm text-muted-foreground">
                        {sample ? `e.g. ${sample}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
              {(missingRequired.length > 0 || contactNameMissing) && (
                <InlineAlert>
                  Map{' '}
                  {[
                    ...missingRequired.map((field) => field.label),
                    ...(contactNameMissing ? ['Full name or First name'] : []),
                  ].join(', ')}{' '}
                  to continue.
                </InlineAlert>
              )}
              <div className="flex justify-between">
                <Button variant="ghost" onClick={reset}>
                  Choose another file
                </Button>
                <Button
                  disabled={missingRequired.length > 0 || contactNameMissing}
                  onClick={() => {
                    setStep(2);
                  }}
                >
                  Review
                  <ArrowRight aria-hidden data-icon="inline-end" />
                </Button>
              </div>
            </>
          )}

          {step === 2 && file && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="ai">
                  <CircleCheckBig aria-hidden />
                  {plural(validCount, 'row')} ready
                </Badge>
                {issues.length > 0 && (
                  <Badge variant="destructive">
                    <AlertTriangle aria-hidden />
                    {plural(issues.length, 'row')} will be skipped
                  </Badge>
                )}
              </div>
              <div className="overflow-hidden rounded-lg border">
                <Table aria-label="Import preview">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-14">Row</TableHead>
                      {fields
                        .filter((field) => mapping[field.key] != null)
                        .map((field) => (
                          <TableHead key={field.key}>{field.label}</TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, PREVIEW_ROWS).map((row, index) => (
                      <TableRow
                        key={index}
                        className={invalidRows.has(index + 1) ? 'bg-destructive/5' : undefined}
                      >
                        <TableCell className="text-muted-foreground tabular-nums">
                          {index + 1}
                        </TableCell>
                        {fields
                          .filter((field) => mapping[field.key] != null)
                          .map((field) => (
                            <TableCell key={field.key} className="max-w-48 truncate">
                              {row[field.key]}
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {rows.length > PREVIEW_ROWS && (
                <p className="text-xs text-muted-foreground">
                  Showing the first {PREVIEW_ROWS} of {rows.length} rows.
                </p>
              )}
              {issues.length > 0 && (
                <details className="rounded-lg border p-3 text-sm">
                  <summary className="cursor-pointer font-medium">
                    Rows that will be skipped ({issues.length})
                  </summary>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-muted-foreground">
                    {issues.map((issue) => (
                      <li key={issue.row}>
                        Row {issue.row}: {issue.message}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {runImport.isPending && (
                <div className="space-y-1.5" aria-live="polite">
                  <Progress value={(runImport.progress / Math.max(validCount, 1)) * 100} />
                  <p className="text-xs text-muted-foreground">
                    Imported {runImport.progress} of {validCount}…
                  </p>
                </div>
              )}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  disabled={runImport.isPending}
                  onClick={() => {
                    setStep(1);
                  }}
                >
                  <ArrowLeft aria-hidden />
                  Back
                </Button>
                <Button disabled={validCount === 0 || runImport.isPending} onClick={startImport}>
                  {runImport.isPending
                    ? 'Importing…'
                    : `Import ${plural(validCount, labels.singular, labels.plural)}`}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-5 py-4 text-center">
              {runImport.isError ? (
                <InlineAlert className="text-left">
                  {errorMessage(runImport.error, 'The import stopped unexpectedly.')}
                </InlineAlert>
              ) : (
                <>
                  <CircleCheckBig aria-hidden className="mx-auto size-12 text-success" />
                  <div className="space-y-1">
                    <h2 className="font-heading text-xl font-semibold">
                      Imported{' '}
                      {plural(runImport.data?.created ?? 0, labels.singular, labels.plural)}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {issues.length + (runImport.data?.failed.length ?? 0) > 0
                        ? `${plural(issues.length + (runImport.data?.failed.length ?? 0), 'row')} could not be imported.`
                        : 'Every row was imported.'}
                    </p>
                  </div>
                  {runImport.data && runImport.data.failed.length > 0 && (
                    <ul className="mx-auto max-w-lg space-y-1 text-left text-sm text-muted-foreground">
                      {runImport.data.failed.slice(0, 10).map((issue) => (
                        <li key={issue.row}>
                          Row {issue.row}: {issue.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={reset}>
                  <RotateCcw aria-hidden />
                  Import another file
                </Button>
                <Button asChild>
                  <Link to={target === 'contacts' ? paths.contacts : paths.companies}>
                    View {labels.plural}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
