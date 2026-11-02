import { Controller, type Control } from 'react-hook-form';

import { FormInput } from '@/components/form/form-input';
import { FormSelect, type SelectOption } from '@/components/form/form-select';
import { FormSwitch } from '@/components/form/form-switch';
import { FormTextarea } from '@/components/form/form-textarea';
import { optionsFrom } from '@/components/form/options';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useUsers } from '@/features/auth';

import { COMPANY_SOURCES, COMPANY_STATUSES } from '../constants';
import type { CompanyFormValues, CustomFieldDefinition } from '../types';

const statusOptions: SelectOption[] = COMPANY_STATUSES.map((status) => ({
  value: status.value,
  label: status.label,
}));

function CustomFieldInput({
  control,
  field: definition,
}: {
  control: Control<CompanyFormValues>;
  field: CustomFieldDefinition;
}) {
  const id = `custom-${definition.id}`;
  return (
    <Controller
      control={control}
      name={`customFields.${definition.id}`}
      render={({ field }) =>
        definition.type === 'checkbox' ? (
          <Field orientation="horizontal" className="rounded-lg border p-3">
            <FieldLabel htmlFor={id} className="flex-1">
              {definition.label}
            </FieldLabel>
            <Switch
              id={id}
              checked={field.value === true}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
            />
          </Field>
        ) : (
          <Field>
            <FieldLabel htmlFor={id}>{definition.label}</FieldLabel>
            <Input
              id={id}
              name={field.name}
              inputMode={definition.type === 'number' ? 'decimal' : undefined}
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          </Field>
        )
      }
    />
  );
}

interface CompanyFormProps {
  control: Control<CompanyFormValues>;
  customFields: CustomFieldDefinition[];
}

export function CompanyForm({ control, customFields }: CompanyFormProps) {
  const { data: users = [] } = useUsers();
  const ownerOptions: SelectOption[] = users.map((user) => ({ value: user.id, label: user.name }));

  return (
    <FieldGroup className="gap-8">
      <FieldSet>
        <FieldLegend>Company</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            control={control}
            name="name"
            label="Company name"
            autoFocus
            fieldClassName="sm:col-span-2"
          />
          <FormInput control={control} name="email" label="Email" type="email" />
          <FormInput control={control} name="mobile" label="Phone" inputMode="tel" />
          <FormSelect control={control} name="status" label="Status" options={statusOptions} />
          <FormSelect
            control={control}
            name="ownerId"
            label="Owner"
            options={ownerOptions}
            allowEmpty
            placeholder="Unassigned"
          />
          <FormInput control={control} name="employees" label="Employees" inputMode="numeric" />
          <FormInput
            control={control}
            name="annualRevenue"
            label="Annual revenue (₹)"
            inputMode="numeric"
          />
          <FormSelect
            control={control}
            name="leadSource"
            label="Lead source"
            options={optionsFrom(COMPANY_SOURCES)}
            allowEmpty
          />
          <FormInput control={control} name="website" label="Website" placeholder="https://" />
        </div>
        <FormTextarea control={control} name="description" label="Description" rows={3} />
      </FieldSet>

      <FieldSet>
        <FieldLegend>Address</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            control={control}
            name="address"
            label="Address"
            fieldClassName="sm:col-span-2"
          />
          <FormInput control={control} name="city" label="City" />
          <FormInput control={control} name="state" label="State" />
          <FormInput control={control} name="zipcode" label="ZIP code" />
          <FormInput control={control} name="country" label="Country" />
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Social & preferences</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput control={control} name="linkedin" label="LinkedIn" placeholder="https://" />
          <FormInput control={control} name="instagram" label="Instagram" placeholder="https://" />
          <FormInput control={control} name="facebook" label="Facebook" placeholder="https://" />
          <FormInput control={control} name="twitter" label="X / Twitter" placeholder="https://" />
          <FormSwitch control={control} name="emailOptOut" label="Email opt-out" />
          <FormSwitch control={control} name="smsOptOut" label="SMS opt-out" />
        </div>
      </FieldSet>

      {customFields.length > 0 && (
        <FieldSet>
          <FieldLegend>Custom fields</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-2">
            {customFields.map((field) => (
              <CustomFieldInput key={field.id} control={control} field={field} />
            ))}
          </div>
        </FieldSet>
      )}
    </FieldGroup>
  );
}
