import { z } from 'zod';

const amount = (label: string, required = false) =>
  z
    .string()
    .trim()
    .refine((value) => (required ? value !== '' : true), { message: `${label} is required.` })
    .refine((value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: `${label} must be a positive number.`,
    });

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required.').max(120, 'Keep it under 120 characters.'),
    type: z.enum(['product', 'service']),
    description: z.string().trim().max(1000, 'Description can be at most 1000 characters.'),
    category: z.string().trim(),
    sku: z.string().trim(),
    unit: z.string(),
    purchasePrice: amount('Purchase price'),
    salePrice: amount('Sale price', true),
    discountType: z.enum(['percent', 'amount']),
    discount: amount('Discount'),
    taxPercent: z.string(),
    stock: z
      .string()
      .trim()
      .refine((value) => value === '' || /^\d+$/.test(value), {
        message: 'Stock must be a whole number.',
      }),
  })
  .refine(
    (values) =>
      !values.discount ||
      (values.discountType === 'percent'
        ? Number(values.discount) <= 100
        : Number(values.discount) <= Number(values.salePrice)),
    { message: 'Discount can’t exceed the sale price.', path: ['discount'] },
  );
