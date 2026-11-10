import { useEffect } from 'react';
import {
  useWatch,
  type Control,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormSetValue,
} from 'react-hook-form';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';

import { CRITERION_VALUE_OPTIONS, criterionNeedsValue } from '../constants';
import type { AssignmentCriterion, ScoringCriterion } from '../types';

type Criterion = ScoringCriterion | AssignmentCriterion;

const VALUE_HINTS: Partial<Record<Criterion, { placeholder: string; description: string }>> = {
  source_equals: {
    placeholder: 'e.g. Website',
    description: 'Matches the lead’s source exactly (not case-sensitive).',
  },
  destination_equals: {
    placeholder: 'e.g. Goa',
    description: 'Matches the destination the lead asked about.',
  },
  text_contains: {
    placeholder: 'e.g. honeymoon',
    description: 'Matches when the lead’s message contains this text.',
  },
  inbound_messages_at_least: {
    placeholder: 'e.g. 3',
    description: 'Number of messages the lead has sent you.',
  },
};

interface CriterionValueFieldProps<TValues extends FieldValues & { criterion: Criterion }> {
  control: Control<TValues>;
  setValue: UseFormSetValue<TValues>;
}

/**
 * The rule's `value`, shown only when the selected criterion needs one: a select for
 * enum criteria (channel, temperature), otherwise text.
 */
export function CriterionValueField<TValues extends FieldValues & { criterion: Criterion }>({
  control,
  setValue,
}: CriterionValueFieldProps<TValues>) {
  const criterionPath = 'criterion' as Path<TValues>;
  const valuePath = 'value' as Path<TValues>;
  const criterion = useWatch({ control, name: criterionPath }) as Criterion;
  const value = useWatch({ control, name: valuePath }) as string;
  const options = CRITERION_VALUE_OPTIONS[criterion];

  // A value left over from another criterion can't be picked in this one's select: clear it.
  useEffect(() => {
    if (options && value && !options.some((option) => option.value === value)) {
      setValue(valuePath, '' as PathValue<TValues, Path<TValues>>);
    }
  }, [options, value, setValue, valuePath]);

  if (!criterionNeedsValue(criterion)) return null;

  if (options) {
    return <FormSelect control={control} name={valuePath} label="Value" options={options} />;
  }
  const hint = VALUE_HINTS[criterion];
  return (
    <FormInput
      control={control}
      name={valuePath}
      label="Value"
      placeholder={hint?.placeholder}
      description={hint?.description}
      inputMode={criterion === 'inbound_messages_at_least' ? 'numeric' : undefined}
    />
  );
}
