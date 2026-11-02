import { http } from '@/services';

import type {
  DiscountType,
  Product,
  ProductDto,
  ProductFormOutput,
  ProductFormValues,
  ProductWriteDto,
} from '../types';

/** Sale price minus discount, rounded to paise. */
export function sellingPrice(
  salePrice: number,
  discountType: DiscountType,
  discount: number,
): number {
  const reduction = discountType === 'percent' ? (salePrice * discount) / 100 : discount;
  return Math.max(0, Math.round((salePrice - reduction) * 100) / 100);
}

export function toProduct(dto: ProductDto): Product {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description,
    type: dto.type,
    category: dto.category,
    sku: dto.sku,
    unit: dto.unit,
    purchasePrice: dto.purchase_price,
    salePrice: dto.sale_price,
    discountType: dto.discount_type,
    discount: dto.discount,
    taxPercent: dto.tax_percent,
    stock: dto.stock,
    sellingPrice: sellingPrice(dto.sale_price, dto.discount_type, dto.discount),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

const text = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

export function productToFormValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? '',
    type: product?.type ?? 'product',
    description: product?.description ?? '',
    category: product?.category ?? '',
    sku: product?.sku ?? '',
    unit: product?.unit ?? '',
    purchasePrice: text(product?.purchasePrice),
    salePrice: text(product?.salePrice),
    discountType: product?.discountType ?? 'percent',
    discount: product?.discount ? String(product.discount) : '',
    taxPercent: String(product?.taxPercent ?? 0),
    stock: text(product?.stock),
  };
}

export function formValuesToDto(values: ProductFormOutput): ProductWriteDto {
  return {
    name: values.name,
    type: values.type,
    description: values.description,
    category: values.category,
    sku: values.sku,
    unit: values.unit,
    purchase_price: values.purchasePrice ? Number(values.purchasePrice) : null,
    sale_price: Number(values.salePrice),
    discount_type: values.discountType,
    discount: values.discount ? Number(values.discount) : 0,
    tax_percent: Number(values.taxPercent),
    stock: values.type === 'service' || !values.stock ? null : Number(values.stock),
  };
}

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const response = await http.get<{ products: ProductDto[] }>('/api/products', { signal });
  return response.products.map(toProduct);
}

export async function createProduct(body: ProductWriteDto): Promise<Product> {
  const response = await http.post<{ product: ProductDto }>('/api/products', body);
  return toProduct(response.product);
}

export async function updateProduct(id: string, body: ProductWriteDto): Promise<Product> {
  const response = await http.patch<{ product: ProductDto }>(
    `/api/products/${encodeURIComponent(id)}`,
    body,
  );
  return toProduct(response.product);
}

export async function deleteProduct(id: string): Promise<void> {
  await http.delete(`/api/products/${encodeURIComponent(id)}`);
}
