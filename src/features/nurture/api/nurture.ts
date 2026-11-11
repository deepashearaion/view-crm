import { http } from '@/services';

import type {
  NurtureEnrollment,
  NurtureEnrollmentDto,
  NurtureEnrollmentFilters,
  NurtureSequence,
  NurtureSequenceCreateDto,
  NurtureSequenceDto,
  NurtureSequencePatchDto,
  NurtureStep,
  NurtureStepDto,
  NurtureStepWriteDto,
} from '../types';

const SEQUENCES = '/api/v1/nurture-sequences';
const ENROLLMENTS = '/api/v1/nurture-enrollments';

const path = (base: string, id: string, suffix = '') =>
  `${base}/${encodeURIComponent(id)}${suffix}`;

/** Drops undefined/null values: /api/v1 rejects unknown fields and ignores null. */
function compact<T extends object>(body: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== null),
  ) as Partial<T>;
}

export function toNurtureStep(dto: NurtureStepDto): NurtureStep {
  return {
    delayMinutes: dto.delay_minutes,
    channel: dto.channel,
    subject: dto.subject,
    body: dto.body,
    whatsappTemplate: dto.whatsapp_template,
    whatsappLanguage: dto.whatsapp_language,
    whatsappTemplateParams: dto.whatsapp_template_params ?? [],
  };
}

/** UI step → write DTO, keeping only the fields its channel uses. */
export function toNurtureStepWriteDto(step: NurtureStep): NurtureStepWriteDto {
  return step.channel === 'email'
    ? {
        delay_minutes: step.delayMinutes,
        channel: 'email',
        subject: step.subject,
        body: step.body,
      }
    : {
        delay_minutes: step.delayMinutes,
        channel: 'whatsapp',
        body: step.body,
        whatsapp_template: step.whatsappTemplate,
        whatsapp_language: step.whatsappLanguage,
        whatsapp_template_params: step.whatsappTemplateParams,
      };
}

export function toNurtureSequence(dto: NurtureSequenceDto): NurtureSequence {
  return {
    id: String(dto.id),
    name: dto.name,
    trigger: dto.trigger,
    active: dto.active,
    stopOnReply: dto.stop_on_reply,
    steps: (dto.steps ?? []).map(toNurtureStep),
    activeEnrollments: dto.active_enrollments,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function toNurtureEnrollment(dto: NurtureEnrollmentDto): NurtureEnrollment {
  return {
    id: String(dto.id),
    sequenceId: String(dto.sequence_id),
    sequenceName: dto.sequence_name,
    contactId: String(dto.contact_id),
    status: dto.status,
    stopReason: dto.stop_reason,
    nextStep: dto.next_step,
    nextRunAt: dto.next_run_at,
    attempts: dto.attempts,
    lastError: dto.last_error,
    enrolledById: dto.enrolled_by_id === null ? null : String(dto.enrolled_by_id),
    enrolledAt: dto.enrolled_at,
    finishedAt: dto.finished_at,
  };
}

/** GET /api/v1/nurture-sequences (nurture.view). */
export async function fetchNurtureSequences(signal?: AbortSignal): Promise<NurtureSequence[]> {
  const response = await http.get<{ sequences: NurtureSequenceDto[] | null }>(SEQUENCES, {
    signal,
  });
  return (response.sequences ?? []).map(toNurtureSequence);
}

/** GET /api/v1/nurture-sequences/{id}. */
export async function fetchNurtureSequence(
  id: string,
  signal?: AbortSignal,
): Promise<NurtureSequence> {
  const response = await http.get<{ sequence: NurtureSequenceDto }>(path(SEQUENCES, id), {
    signal,
  });
  return toNurtureSequence(response.sequence);
}

/** POST /api/v1/nurture-sequences. 409 name_taken / trigger_taken. */
export async function createNurtureSequence(
  body: NurtureSequenceCreateDto,
): Promise<NurtureSequence> {
  const response = await http.post<{ sequence: NurtureSequenceDto }>(SEQUENCES, compact(body));
  return toNurtureSequence(response.sequence);
}

/** PATCH /api/v1/nurture-sequences/{id}. Sends only the given keys; `steps` replaces all steps. */
export async function updateNurtureSequence(
  id: string,
  body: NurtureSequencePatchDto,
): Promise<NurtureSequence> {
  const response = await http.patch<{ sequence: NurtureSequenceDto }>(
    path(SEQUENCES, id),
    compact(body),
  );
  return toNurtureSequence(response.sequence);
}

/** DELETE /api/v1/nurture-sequences/{id} → 204. */
export async function deleteNurtureSequence(id: string): Promise<void> {
  await http.delete(path(SEQUENCES, id));
}

/** POST /api/v1/nurture-sequences/{id}/enrollments. 409 already_enrolled. */
export async function enrollContact(
  sequenceId: string,
  contactId: string,
): Promise<NurtureEnrollment> {
  const response = await http.post<{ enrollment: NurtureEnrollmentDto }>(
    path(SEQUENCES, sequenceId, '/enrollments'),
    { contact_id: Number(contactId) },
  );
  return toNurtureEnrollment(response.enrollment);
}

/** GET /api/v1/nurture-enrollments (offset paging; nurture.view `own` must pass contactId). */
export async function fetchNurtureEnrollments(
  filters: NurtureEnrollmentFilters = {},
  signal?: AbortSignal,
): Promise<NurtureEnrollment[]> {
  const response = await http.get<{ enrollments: NurtureEnrollmentDto[] | null }>(ENROLLMENTS, {
    query: {
      contact_id: filters.contactId,
      sequence_id: filters.sequenceId,
      status: filters.status,
      limit: filters.limit,
      offset: filters.offset,
    },
    signal,
  });
  return (response.enrollments ?? []).map(toNurtureEnrollment);
}

/** POST /api/v1/nurture-enrollments/{id}/stop. */
export async function stopNurtureEnrollment(id: string): Promise<NurtureEnrollment> {
  const response = await http.post<{ enrollment: NurtureEnrollmentDto }>(
    path(ENROLLMENTS, id, '/stop'),
  );
  return toNurtureEnrollment(response.enrollment);
}

/** POST /api/v1/unsubscribe (public). Bad token → 400 invalid_token. */
export async function unsubscribe(token: string): Promise<{ status: 'unsubscribed' }> {
  return http.post<{ status: 'unsubscribed' }>('/api/v1/unsubscribe', { token });
}
