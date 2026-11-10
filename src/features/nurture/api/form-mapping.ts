import {
  stepDelayMinutes,
  type SequenceFormOutput,
  type SequenceFormValues,
  type StepFormValues,
} from '../schemas';
import type {
  NurtureSequence,
  NurtureSequenceCreateDto,
  NurtureStep,
  NurtureStepChannel,
} from '../types';
import { toNurtureStepWriteDto } from './nurture';

/** Minutes → the days / hours / minutes boxes of the step editor. */
function splitDelay(total: number): Pick<StepFormValues, 'days' | 'hours' | 'minutes'> {
  return {
    days: String(Math.floor(total / 1440)),
    hours: String(Math.floor((total % 1440) / 60)),
    minutes: String(total % 60),
  };
}

export function emptyStep(
  channel: NurtureStepChannel = 'email',
  delayMinutes = 1440,
): StepFormValues {
  return {
    ...splitDelay(delayMinutes),
    channel,
    subject: '',
    body: '',
    whatsappTemplate: '',
    whatsappLanguage: 'en',
    whatsappTemplateParams: '',
  };
}

function stepToFormValues(step: NurtureStep): StepFormValues {
  return {
    ...splitDelay(step.delayMinutes),
    channel: step.channel,
    subject: step.subject,
    body: step.body,
    whatsappTemplate: step.whatsappTemplate,
    whatsappLanguage: step.whatsappLanguage || 'en',
    whatsappTemplateParams: step.whatsappTemplateParams.join(', '),
  };
}

export function sequenceToFormValues(sequence: NurtureSequence | undefined): SequenceFormValues {
  if (!sequence)
    return {
      name: '',
      trigger: 'manual',
      active: true,
      stopOnReply: true,
      steps: [emptyStep('email', 0)],
    };
  return {
    name: sequence.name,
    trigger: sequence.trigger,
    active: sequence.active,
    stopOnReply: sequence.stopOnReply,
    steps: sequence.steps.map(stepToFormValues),
  };
}

function formStepToStep(step: SequenceFormOutput['steps'][number]): NurtureStep {
  return {
    delayMinutes: stepDelayMinutes(step),
    channel: step.channel,
    subject: step.subject,
    body: step.body,
    whatsappTemplate: step.whatsappTemplate,
    whatsappLanguage: step.whatsappLanguage,
    whatsappTemplateParams: step.whatsappTemplateParams
      .split(',')
      .map((param) => param.trim())
      .filter(Boolean),
  };
}

/** Full body for POST, and for PATCH too (steps always replace the whole list). */
export function formValuesToSequenceDto(values: SequenceFormOutput): NurtureSequenceCreateDto {
  return {
    name: values.name,
    trigger: values.trigger,
    active: values.active,
    stop_on_reply: values.stopOnReply,
    steps: values.steps.map((step) => toNurtureStepWriteDto(formStepToStep(step))),
  };
}

/** "right away", "2 days", "1 day 3 h", "45 min". */
export function formatDelay(total: number): string {
  if (total <= 0) return 'right away';
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const minutes = total % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours) parts.push(`${hours} h`);
  if (minutes) parts.push(`${minutes} min`);
  return parts.join(' ');
}
