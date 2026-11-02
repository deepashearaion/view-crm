import { z } from 'zod';

import { MAX_FILE_BYTES } from './constants';

/** Accepts CSV files up to MAX_FILE_BYTES. Excel users can "Save as CSV". */
export const importFileSchema = z
  .instanceof(File)
  .refine((file) => /\.csv$/i.test(file.name) || file.type === 'text/csv', {
    message: 'Please upload a .csv file (in Excel: File → Save as → CSV).',
  })
  .refine((file) => file.size > 0, { message: 'The file is empty.' })
  .refine((file) => file.size <= MAX_FILE_BYTES, {
    message: `Files can be at most ${String(MAX_FILE_BYTES / 1024 / 1024)} MB.`,
  });
