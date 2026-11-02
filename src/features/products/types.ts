import type { z } from 'zod';

import type { DISCOUNT_TYPES, PRODUCT_TYPES } from './constants';
import type { productFormSchema } from './schemas';

export type ProductType = (typeof PRODUCT_TYPES)[number]['value'];
export type DiscountType = (typeof DISCOUNT_TYPES)[number]['value'];

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  type: ProductType;
  category: string;
  sku: string;
  unit: string;
  purchase_price: number | null;
  sale_price: number;
  discount_type: DiscountType;
  discount: number;
  tax_percent: number;
  /** null for services and untracked items. */
  stock: number | null;
  created_at: string;
  updated_at: string;
}

export type ProductWriteDto = Partial<Omit<ProductDto, 'id' | 'created_at' | 'updated_at'>>;

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  category: string;
  sku: string;
  unit: string;
  purchasePrice: number | null;
  salePrice: number;
  discountType: DiscountType;
  discount: number;
  taxPercent: number;
  stock: number | null;
  /** Sale price after discount, before tax. */
  sellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductFormValues = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;
