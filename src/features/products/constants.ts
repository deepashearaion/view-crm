export const PRODUCT_TYPES = [
  { value: 'product', label: 'Product' },
  { value: 'service', label: 'Service' },
] as const;

export const DISCOUNT_TYPES = [
  { value: 'percent', label: '%' },
  { value: 'amount', label: '₹' },
] as const;

export const PRODUCT_UNITS = ['Set', 'Person', 'Night', 'Trip', 'Hour', 'Piece'] as const;
export const TAX_RATES = ['0', '5', '12', '18', '28'] as const;

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
};
