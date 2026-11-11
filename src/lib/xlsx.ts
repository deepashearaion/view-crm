/**
 * Minimal .xlsx writer: typed cells (numbers, money, percentages, dates), a bold frozen header
 * row with filters, and fitted column widths. No dependency: the workbook is a handful of
 * SpreadsheetML parts in an uncompressed ZIP, which Excel, LibreOffice and Google Sheets open.
 */

export type CellValue = string | number | boolean | null | undefined;

/**
 * How a column's values are written:
 * - `money`: rupees (e.g. 1234.5), shown as ₹1,234.50
 * - `percent`: 0–100 (e.g. 42.5), shown as 42.5%
 * - `date`: `YYYY-MM-DD`, or an ISO instant shown as its IST day
 * - `datetime`: an ISO instant, shown in IST
 */
export type CellFormat = 'text' | 'integer' | 'decimal' | 'money' | 'percent' | 'date' | 'datetime';

export interface SheetColumn {
  header: string;
  format?: CellFormat;
}

export interface Sheet {
  name: string;
  columns: SheetColumn[];
  rows: CellValue[][];
}

// ── Cell styles (indexes into cellXfs in styles.xml) ─────────────────────────

const STYLE: Record<CellFormat | 'header', number> = {
  text: 0,
  header: 1,
  integer: 2,
  decimal: 3,
  money: 4,
  percent: 5,
  date: 6,
  datetime: 7,
};

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="5"><numFmt numFmtId="164" formatCode="dd-mmm-yyyy"/><numFmt numFmtId="165" formatCode="dd-mmm-yyyy hh:mm"/><numFmt numFmtId="166" formatCode="&quot;₹&quot;#,##0.00"/><numFmt numFmtId="167" formatCode="0.0%"/><numFmt numFmtId="168" formatCode="#,##0.0#"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EEF7"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="8">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="168" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="167" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

// ── Values ───────────────────────────────────────────────────────────────────

const MS_PER_DAY = 86_400_000;
/** Excel's day zero (serial 0) is 1899-12-30. */
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);
/** Times are written as IST wall-clock time (UTC+05:30, no DST). */
const IST_OFFSET_MS = 330 * 60_000;
const DAY_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Excel serial date for `YYYY-MM-DD` or an ISO instant; undefined when unparseable. */
function toSerial(value: string, withTime: boolean): number | undefined {
  const day = DAY_ONLY.exec(value);
  if (day) {
    return (
      (Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3])) - EXCEL_EPOCH_MS) / MS_PER_DAY
    );
  }
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return undefined;
  const serial = (ms + IST_OFFSET_MS - EXCEL_EPOCH_MS) / MS_PER_DAY;
  return withTime ? serial : Math.floor(serial);
}

// Characters XML 1.0 can't carry at all.
// eslint-disable-next-line no-control-regex
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

function escapeXml(value: string): string {
  return value
    .replace(INVALID_XML, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** A, B, …, Z, AA, AB, … */
function columnName(index: number): string {
  let name = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  }
  return name;
}

/** Excel caps text cells at 32,767 characters. */
const MAX_CELL_TEXT = 32_767;

function textCell(ref: string, text: string, style = 0): string {
  const s = style ? ` s="${style}"` : '';
  return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${escapeXml(text.slice(0, MAX_CELL_TEXT))}</t></is></c>`;
}

function cellXml(ref: string, value: CellValue, format: CellFormat): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return `<c r="${ref}" t="b"><v>${value ? 1 : 0}</v></c>`;

  if (format === 'date' || format === 'datetime') {
    const serial = typeof value === 'string' ? toSerial(value, format === 'datetime') : value;
    return serial === undefined
      ? textCell(ref, String(value))
      : `<c r="${ref}" s="${STYLE[format]}"><v>${serial}</v></c>`;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    if (format === 'text') return `<c r="${ref}"><v>${value}</v></c>`;
    const number = format === 'percent' ? value / 100 : value;
    return `<c r="${ref}" s="${STYLE[format]}"><v>${number}</v></c>`;
  }
  return textCell(ref, value);
}

/** Rough display width of a value, for fitting columns. */
function displayLength(value: CellValue, format: CellFormat): number {
  if (value === null || value === undefined) return 0;
  if (format === 'date') return 11;
  if (format === 'datetime') return 17;
  if (typeof value === 'number') {
    const digits = Math.abs(Math.trunc(value)).toString().length;
    return (
      digits + Math.floor(digits / 3) + (format === 'money' ? 4 : format === 'percent' ? 3 : 1)
    );
  }
  const text = String(value);
  const newline = text.indexOf('\n');
  return newline === -1 ? text.length : newline;
}

function sheetXml(sheet: Sheet): string {
  const { columns, rows } = sheet;
  const formats = columns.map((column) => column.format ?? 'text');

  const widths = columns.map((column, index) => {
    let width = column.header.length + 3; // room for the filter button
    for (const row of rows.slice(0, 500)) {
      width = Math.max(width, displayLength(row[index], formats[index] ?? 'text'));
    }
    return Math.min(Math.max(width + 2, 8), 60);
  });

  const header = `<row r="1">${columns
    .map((column, index) => textCell(`${columnName(index)}1`, column.header, STYLE.header))
    .join('')}</row>`;
  const body = rows
    .map((row, rowIndex) => {
      const r = rowIndex + 2;
      const cells = formats
        .map((format, index) => cellXml(`${columnName(index)}${r}`, row[index], format))
        .join('');
      return `<row r="${r}">${cells}</row>`;
    })
    .join('');

  const lastColumn = columnName(Math.max(columns.length - 1, 0));
  const range = `A1:${lastColumn}${rows.length + 1}`;
  const cols = widths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<dimension ref="${range}"/>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
${cols ? `<cols>${cols}</cols>` : ''}
<sheetData>${header}${body}</sheetData>
${columns.length ? `<autoFilter ref="${range}"/>` : ''}
</worksheet>`;
}

/** Excel sheet names: ≤31 characters, none of []:*?/\ and unique within the workbook. */
function sheetNames(sheets: Sheet[]): string[] {
  const used = new Set<string>();
  return sheets.map((sheet, index) => {
    const base =
      sheet.name
        .replace(/[[\]:*?/\\]/g, ' ')
        .trim()
        .slice(0, 31) || `Sheet${index + 1}`;
    let name = base;
    for (let n = 2; used.has(name.toLowerCase()); n += 1) {
      const suffix = ` (${n})`;
      name = base.slice(0, 31 - suffix.length) + suffix;
    }
    used.add(name.toLowerCase());
    return name;
  });
}

function workbookParts(sheets: Sheet[]): Record<string, string> {
  const names = sheetNames(sheets);
  const sheetEntries = names
    .map(
      (name, index) =>
        `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
    )
    .join('');
  const filters = sheets
    .map((sheet, index) => {
      if (!sheet.columns.length) return '';
      const quoted = `'${(names[index] ?? '').replace(/'/g, "''")}'`;
      const last = columnName(sheet.columns.length - 1);
      return `<definedName name="_xlnm._FilterDatabase" localSheetId="${index}" hidden="1">${escapeXml(quoted)}!$A$1:$${last}$${sheet.rows.length + 1}</definedName>`;
    })
    .join('');

  const parts: Record<string, string> = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets
      .map(
        (_, index) =>
          `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
      )
      .join('')}</Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${sheetEntries}</sheets>${filters ? `<definedNames>${filters}</definedNames>` : ''}</workbook>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
      .map(
        (_, index) =>
          `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
      )
      .join(
        '',
      )}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': STYLES_XML,
  };
  sheets.forEach((sheet, index) => {
    parts[`xl/worksheets/sheet${index + 1}.xml`] = sheetXml(sheet);
  });
  return parts;
}

// ── ZIP (stored, no compression) ─────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { time: number; day: number } {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    day: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function zipStored(files: Record<string, string>): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const { time, day } = dosDateTime(new Date());
  const entries = Object.entries(files).map(([name, content]) => {
    const data = encoder.encode(content);
    return { name: encoder.encode(name), data, crc: crc32(data) };
  });

  const localSize = entries.reduce(
    (sum, entry) => sum + 30 + entry.name.length + entry.data.length,
    0,
  );
  const centralSize = entries.reduce((sum, entry) => sum + 46 + entry.name.length, 0);
  const output = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(output.buffer);
  let offset = 0;
  const offsets: number[] = [];

  const u16 = (value: number) => {
    view.setUint16(offset, value, true);
    offset += 2;
  };
  const u32 = (value: number) => {
    view.setUint32(offset, value, true);
    offset += 4;
  };
  const bytes = (value: Uint8Array) => {
    output.set(value, offset);
    offset += value.length;
  };
  /** Shared by local and central headers: version, UTF-8 flag, stored, time, crc, sizes. */
  const common = (entry: (typeof entries)[number]) => {
    u16(20);
    u16(0x0800);
    u16(0);
    u16(time);
    u16(day);
    u32(entry.crc);
    u32(entry.data.length);
    u32(entry.data.length);
    u16(entry.name.length);
    u16(0);
  };

  for (const entry of entries) {
    offsets.push(offset);
    u32(0x04034b50);
    common(entry);
    bytes(entry.name);
    bytes(entry.data);
  }
  const centralStart = offset;
  entries.forEach((entry, index) => {
    u32(0x02014b50);
    u16(20); // version made by
    common(entry);
    u16(0); // comment length
    u16(0); // disk
    u16(0); // internal attributes
    u32(0); // external attributes
    u32(offsets[index] ?? 0);
    bytes(entry.name);
  });
  const centralLength = offset - centralStart;
  u32(0x06054b50);
  u16(0); // this disk
  u16(0); // disk with the central directory
  u16(entries.length);
  u16(entries.length);
  u32(centralLength);
  u32(centralStart);
  u16(0);
  return output;
}

// ── Public API ───────────────────────────────────────────────────────────────

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function buildXlsx(sheets: Sheet[]): Blob {
  return new Blob([zipStored(workbookParts(sheets))], { type: XLSX_MIME });
}

/** A safe file name: letters, digits, dashes; `.xlsx` added. */
export function xlsxFileName(...parts: string[]): string {
  const base = parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'report'}.xlsx`;
}

/** Builds the workbook and saves it through the browser. */
export function downloadXlsx(fileName: string, sheets: Sheet[]): void {
  const url = URL.createObjectURL(buildXlsx(sheets));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
