import { errorMessage, isHttpError, http } from '@/services';

import { STAGE_KIND_LABELS, stageColor } from '../constants';
import type { DealStage, StageDto, StageFormOutput, StageWriteDto } from '../types';

type StageRow = StageFormOutput['stages'][number];

function toStage(dto: StageDto, openIndex: number): DealStage {
  return {
    id: String(dto.id),
    name: dto.name,
    position: dto.position,
    kind: dto.kind,
    probability: dto.probability,
    guidance: dto.guidance,
    requiredFields: dto.required_fields ?? [],
    openDeals: dto.open_deals,
    openValuePaise: dto.open_value_paise,
    color: stageColor(dto.kind, openIndex),
  };
}

/** Pipeline order, with a colour derived from each stage's kind and place among open stages. */
export function toStages(dtos: StageDto[]): DealStage[] {
  let openIndex = 0;
  return [...dtos]
    .sort((a, b) => a.position - b.position)
    .map((dto) => toStage(dto, dto.kind === 'open' ? openIndex++ : 0));
}

const stagePath = (id: string) => `/api/v1/deal-stages/${encodeURIComponent(id)}`;

export async function fetchStages(signal?: AbortSignal): Promise<DealStage[]> {
  const response = await http.get<{ stages: StageDto[] | null }>('/api/v1/deal-stages', {
    signal,
  });
  return toStages(response.stages ?? []);
}

export async function createStage(body: StageWriteDto): Promise<StageDto> {
  const response = await http.post<{ stage: StageDto }>('/api/v1/deal-stages', body);
  return response.stage;
}

/** `kind` can't change on an existing stage. */
export async function updateStage(
  id: string,
  body: Omit<StageWriteDto, 'kind'>,
): Promise<StageDto> {
  const response = await http.patch<{ stage: StageDto }>(stagePath(id), body);
  return response.stage;
}

export async function deleteStage(id: string): Promise<void> {
  await http.delete(stagePath(id));
}

/** A failed step of {@link syncStages}, naming the stage it was working on. */
export class StageSyncError extends Error {
  readonly stageName: string;
  readonly kind: DealStage['kind'];
  readonly action: 'create' | 'update' | 'delete';
  /** Form row of the stage, or undefined for a removed stage. */
  readonly rowIndex: number | undefined;

  constructor(
    cause: unknown,
    stage: { name: string; kind: DealStage['kind'] },
    action: StageSyncError['action'],
    rowIndex?: number,
  ) {
    super(errorMessage(cause, 'Couldn’t save stages.'), { cause });
    this.name = 'StageSyncError';
    this.stageName = stage.name;
    this.kind = stage.kind;
    this.action = action;
    this.rowIndex = rowIndex;
  }

  get code(): string | undefined {
    return isHttpError(this.cause) ? this.cause.code : undefined;
  }
}

/** A sentence for the stage dialog, from the problem codes stage writes can return. */
export function stageSyncErrorMessage(error: unknown): string {
  if (!(error instanceof StageSyncError)) return errorMessage(error, 'Couldn’t save stages.');
  const name = `“${error.stageName}”`;
  const kind = STAGE_KIND_LABELS[error.kind].toLowerCase();
  switch (error.code) {
    case 'stage_in_use':
      return `${name} still has deals. Move them to another stage, then remove it.`;
    case 'last_stage_of_kind':
      return error.action === 'delete'
        ? `${name} is the only ${kind} stage. Add another ${kind} stage before removing it.`
        : `${name} is the only ${kind} stage, so it has to stay.`;
    case 'name_taken':
      return `Another stage is already called ${name}. Pick a different name.`;
    default:
      return `Couldn’t save ${name}: ${error.message}`;
  }
}

function sameFields(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value) => b.includes(value));
}

/**
 * Applies the edited stage list with individual POST / PATCH / DELETE calls (there is no
 * bulk endpoint). Creates run first and deletes last, so a kind is never left empty mid-way.
 * Stops at the first failure with a {@link StageSyncError}; finished steps stay applied.
 */
export async function syncStages(
  original: DealStage[],
  rows: StageRow[],
  onCreated: (rowIndex: number, id: string) => void,
): Promise<void> {
  const base = original[0]?.position === 0 ? 0 : 1;
  const byId = new Map(original.map((stage) => [stage.id, stage]));

  for (const [index, row] of rows.entries()) {
    if (row.stageId && byId.has(row.stageId)) continue;
    const body: StageWriteDto = {
      name: row.name,
      position: base + index,
      kind: row.kind,
      probability: Number(row.probability),
      guidance: row.guidance,
      required_fields: row.requiredFields,
    };
    try {
      const created = await createStage(body);
      onCreated(index, String(created.id));
    } catch (error) {
      throw new StageSyncError(error, row, 'create', index);
    }
  }

  for (const [index, row] of rows.entries()) {
    const current = row.stageId ? byId.get(row.stageId) : undefined;
    if (!current) continue;
    const body: Omit<StageWriteDto, 'kind'> = {};
    if (row.name !== current.name) body.name = row.name;
    if (base + index !== current.position) body.position = base + index;
    if (Number(row.probability) !== current.probability) body.probability = Number(row.probability);
    if (row.guidance !== current.guidance) body.guidance = row.guidance;
    if (!sameFields(row.requiredFields, current.requiredFields)) {
      body.required_fields = row.requiredFields;
    }
    if (Object.keys(body).length === 0) continue;
    try {
      await updateStage(current.id, body);
    } catch (error) {
      throw new StageSyncError(error, row, 'update', index);
    }
  }

  const kept = new Set(rows.map((row) => row.stageId));
  for (const stage of original) {
    if (kept.has(stage.id)) continue;
    try {
      await deleteStage(stage.id);
    } catch (error) {
      throw new StageSyncError(error, stage, 'delete');
    }
  }
}
