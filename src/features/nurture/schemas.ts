import { z } from 'zod';

import { NURTURE_LIMITS, NURTURE_STEP_CHANNELS, NURTURE_TRIGGERS } from './constants';
import type { NurtureStepChannel, NurtureTrigger } from './types';

const triggerValues = NURTURE_TRIGGERS.map((trigger) => trigger.value) as [
  NurtureTrigger,
  ...NurtureTrigger[],
];
const channelValues = NURTURE_STEP_CHANNELS.map((channel) => channel.value) as [
  NurtureStepChannel,
  ...NurtureStepChannel[],
];

/** Whole number typed into a delay box; empty counts as 0. */
const delayPart = z.string().trim().regex(/^\d*$/, 'Whole numbers only.');

/** Days + hours + minutes typed in a step → minutes. */
export function stepDelayMinutes(step: { days: string; hours: string; minutes: string }): number {
  const toInt = (value: string) => Number.parseInt(value.trim() || '0', 10) || 0;
  return toInt(step.days) * 1440 + toInt(step.hours) * 60 + toInt(step.minutes);
}

export const stepFormSchema = z
  .object({
    days: delayPart,
    hours: delayPart,
    minutes: delayPart,
    channel: z.enum(channelValues),
    subject: z.string().trim().max(200, 'Keep the subject under 200 characters.'),
    body: z.string().trim().max(4000, 'Keep the message under 4000 characters.'),
    whatsappTemplate: z.string().trim().max(200, 'Template names are at most 200 characters.'),
    whatsappLanguage: z.string().trim().max(20, 'Use a language code such as en or en_US.'),
    /** Comma-separated template parameters. */
    whatsappTemplateParams: z.string(),
  })
  .superRefine((step, ctx) => {
    if (stepDelayMinutes(step) > NURTURE_LIMITS.maxDelayMinutes)
      ctx.addIssue({
        code: 'custom',
        path: ['days'],
        message: 'A step can wait at most 365 days.',
      });
    if (step.channel === 'email') {
      if (!step.subject)
        ctx.addIssue({ code: 'custom', path: ['subject'], message: 'Add a subject.' });
      if (!step.body) ctx.addIssue({ code: 'custom', path: ['body'], message: 'Write the email.' });
      return;
    }
    if (!step.body && !step.whatsappTemplate)
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'Add a message, a template, or (best) both.',
      });
    if (step.whatsappTemplate && !step.whatsappLanguage)
      ctx.addIssue({
        code: 'custom',
        path: ['whatsappLanguage'],
        message: 'Add the template’s language code.',
      });
  });

export const sequenceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name the sequence.')
    .max(120, 'Keep the name under 120 characters.'),
  trigger: z.enum(triggerValues),
  active: z.boolean(),
  stopOnReply: z.boolean(),
  steps: z
    .array(stepFormSchema)
    .min(1, 'Add at least one step.')
    .max(NURTURE_LIMITS.maxSteps, `A sequence can have at most ${NURTURE_LIMITS.maxSteps} steps.`),
});

export type StepFormValues = z.input<typeof stepFormSchema>;
export type SequenceFormValues = z.input<typeof sequenceFormSchema>;
export type SequenceFormOutput = z.output<typeof sequenceFormSchema>;
