import type { ProductDto } from '@/features/products';

import { db, newId } from '../db';
import { mock, mockError } from '../router';

type ProductWrite = Partial<Omit<ProductDto, 'id' | 'created_at' | 'updated_at'>>;

function asWrite(body: unknown): ProductWrite {
  if (typeof body !== 'object' || body === null) mockError(400, 'Invalid request body');
  return body;
}

function find(id: string | undefined): ProductDto {
  const product = db.products.find((item) => String(item.id) === id);
  if (!product) mockError(404, 'Product not found');
  return product;
}

mock('GET', '/api/products', () => ({ products: db.products }));

mock('POST', '/api/products', ({ body }) => {
  const input = asWrite(body);
  if (!input.name?.trim()) mockError(400, 'name is required');
  if (input.sale_price === undefined || input.sale_price < 0)
    mockError(400, 'sale_price is required');
  const now = new Date().toISOString();
  const product: ProductDto = {
    description: '',
    type: 'product',
    category: '',
    sku: '',
    unit: '',
    purchase_price: null,
    discount_type: 'percent',
    discount: 0,
    tax_percent: 0,
    stock: null,
    ...input,
    name: input.name,
    sale_price: input.sale_price,
    id: newId(),
    created_at: now,
    updated_at: now,
  };
  db.products.unshift(product);
  return { product };
});

mock('PATCH', '/api/products/:id', ({ params, body }) => {
  const product = find(params.id);
  Object.assign(product, asWrite(body), { updated_at: new Date().toISOString() });
  return { product };
});

mock('DELETE', '/api/products/:id', ({ params }) => {
  const product = find(params.id);
  db.products = db.products.filter((item) => item !== product);
  return { message: 'Product deleted' };
});
