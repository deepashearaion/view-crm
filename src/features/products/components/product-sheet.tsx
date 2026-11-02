import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch, type Control } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { optionsFrom } from '@/components/form/options';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { RecordSheetState } from '@/hooks/use-record-sheet-state';
import { formatCurrency } from '@/lib/format';
import { errorMessage } from '@/services';

import { formValuesToDto, productToFormValues, sellingPrice } from '../api/products';
import { DISCOUNT_TYPES, PRODUCT_TYPES, PRODUCT_UNITS, TAX_RATES } from '../constants';
import { useCreateProduct, useProducts, useUpdateProduct } from '../hooks/use-products';
import { productFormSchema } from '../schemas';
import type { ProductFormOutput, ProductFormValues } from '../types';

const FORM_ID = 'product-form';

function PricePreview({ control }: { control: Control<ProductFormValues> }) {
  const [sale, discountType, discount, tax] = useWatch({
    control,
    name: ['salePrice', 'discountType', 'discount', 'taxPercent'],
  });
  const salePrice = Number(sale || 0);
  if (!salePrice) return null;
  const selling = sellingPrice(salePrice, discountType, Number(discount || 0));
  const withTax = selling * (1 + Number(tax || 0) / 100);
  return (
    <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm sm:col-span-2">
      <div>
        <dt className="text-muted-foreground">Selling price</dt>
        <dd className="font-semibold tabular-nums">{formatCurrency(selling)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Incl. tax</dt>
        <dd className="font-semibold tabular-nums">
          {formatCurrency(Math.round(withTax * 100) / 100)}
        </dd>
      </div>
    </dl>
  );
}

interface ProductSheetProps {
  state: RecordSheetState;
  onStateChange: (state: RecordSheetState) => void;
}

export function ProductSheet({ state, onStateChange }: ProductSheetProps) {
  const { data: products } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const productId = state.mode === 'view' || state.mode === 'edit' ? state.id : null;
  const product = products?.find((item) => item.id === productId);

  const form = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productToFormValues(),
  });
  const type = useWatch({ control: form.control, name: 'type' });

  useEffect(() => {
    if (state.mode === 'create') form.reset(productToFormValues());
    else if (product) form.reset(productToFormValues(product));
  }, [state.mode, product, form]);

  const close = () => {
    onStateChange({ mode: 'closed' });
  };
  const mutation = state.mode === 'create' ? createProduct : updateProduct;

  const onSubmit = form.handleSubmit((values) => {
    const body = formValuesToDto(values);
    const done = (verb: string) => () => {
      toast.success(`${values.type === 'service' ? 'Service' : 'Product'} ${verb}.`);
      close();
    };
    if (state.mode === 'create') createProduct.mutate(body, { onSuccess: done('created') });
    else if (productId)
      updateProduct.mutate({ id: productId, body }, { onSuccess: done('updated') });
  });

  const noun = type === 'service' ? 'service' : 'product';

  return (
    <Sheet
      open={state.mode !== 'closed'}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b p-6 pr-12">
          <SheetTitle className="text-lg">
            {state.mode === 'create' ? `New ${noun}` : `Edit ${noun}`}
          </SheetTitle>
          <SheetDescription>Used on quotations and invoices.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <form
            id={FORM_ID}
            onSubmit={(event) => void onSubmit(event)}
            noValidate
            className="space-y-6 p-6"
          >
            {mutation.isError && (
              <InlineAlert>{errorMessage(mutation.error, 'Couldn’t save.')}</InlineAlert>
            )}
            <FieldGroup className="gap-8">
              <FieldSet>
                <FieldLegend>Details</FieldLegend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Name"
                    autoFocus
                    fieldClassName="sm:col-span-2"
                  />
                  <FormSelect
                    control={form.control}
                    name="type"
                    label="Type"
                    options={PRODUCT_TYPES.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))}
                  />
                  <FormInput
                    control={form.control}
                    name="category"
                    label="Category"
                    placeholder="e.g. Travel package"
                  />
                  <FormInput control={form.control} name="sku" label="SKU / code" />
                  <FormSelect
                    control={form.control}
                    name="unit"
                    label="Unit"
                    options={optionsFrom(PRODUCT_UNITS)}
                    allowEmpty
                  />
                </div>
                <FormTextarea
                  control={form.control}
                  name="description"
                  label="Description"
                  rows={3}
                />
              </FieldSet>
              <FieldSet>
                <FieldLegend>Pricing</FieldLegend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    control={form.control}
                    name="salePrice"
                    label="Sale price (₹)"
                    inputMode="decimal"
                  />
                  <FormInput
                    control={form.control}
                    name="purchasePrice"
                    label="Purchase price (₹)"
                    inputMode="decimal"
                    placeholder="Optional"
                  />
                  <FormInput
                    control={form.control}
                    name="discount"
                    label="Discount"
                    inputMode="decimal"
                    placeholder="0"
                  />
                  <FormSelect
                    control={form.control}
                    name="discountType"
                    label="Discount in"
                    options={DISCOUNT_TYPES.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))}
                  />
                  <FormSelect
                    control={form.control}
                    name="taxPercent"
                    label="GST"
                    options={TAX_RATES.map((rate) => ({ value: rate, label: `${rate}%` }))}
                  />
                  {type === 'product' && (
                    <FormInput
                      control={form.control}
                      name="stock"
                      label="Stock"
                      inputMode="numeric"
                      placeholder="Not tracked"
                    />
                  )}
                  <PricePreview control={form.control} />
                </div>
              </FieldSet>
            </FieldGroup>
          </form>
        </ScrollArea>
        <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} disabled={mutation.isPending}>
            {mutation.isPending
              ? 'Saving…'
              : state.mode === 'create'
                ? `Create ${noun}`
                : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
