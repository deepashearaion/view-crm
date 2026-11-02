import { Download, FileUp } from 'lucide-react';
import { useId, useState, type DragEvent } from 'react';

import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { downloadCsv, parseCsv, toCsv } from '@/lib/csv';
import { cn } from '@/lib/utils';

import { IMPORT_FIELDS, MAX_ROWS, TARGET_LABELS } from '../constants';
import { importFileSchema } from '../schemas';
import type { ImportTarget, ParsedFile } from '../types';

interface UploadStepProps {
  target: ImportTarget;
  onParsed: (file: ParsedFile) => void;
}

export function UploadStep({ target, onParsed }: UploadStepProps) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    const valid = importFileSchema.safeParse(file);
    if (!valid.success) {
      setError(valid.error.issues[0]?.message ?? 'This file can’t be imported.');
      return;
    }
    const [headers, ...rows] = parseCsv(await file.text());
    if (!headers || rows.length === 0) {
      setError('The file needs a header row and at least one data row.');
      return;
    }
    if (rows.length > MAX_ROWS) {
      setError(`Import at most ${MAX_ROWS.toLocaleString('en-IN')} rows at a time.`);
      return;
    }
    onParsed({ name: file.name, headers, rows });
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  };

  const downloadTemplate = () => {
    const fields = IMPORT_FIELDS[target].filter((field) => field.key !== 'fullName');
    downloadCsv(
      `${target}-import-template`,
      toCsv(
        [],
        fields.map((field) => ({ header: field.label, value: () => '' })),
      ),
    );
  };

  return (
    <div className="space-y-4">
      {error && <InlineAlert>{error}</InlineAlert>}
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
          dragging && 'border-primary bg-primary/5',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileUp aria-hidden className="size-6" />
        </span>
        <span className="text-base font-medium">Drop a CSV file here, or click to browse</span>
        <span className="text-sm text-muted-foreground">
          One {TARGET_LABELS[target].singular} per row, with a header row. Up to 5 MB.
        </span>
        <input
          id={inputId}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      <div className="flex justify-center">
        <Button variant="link" onClick={downloadTemplate}>
          <Download aria-hidden />
          Download a {TARGET_LABELS[target].singular} template
        </Button>
      </div>
    </div>
  );
}
