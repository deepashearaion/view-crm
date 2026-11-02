import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../api/products';
import { productKeys } from '../constants';
import type { Product, ProductWriteDto } from '../types';

export function useProducts() {
  return useQuery({ queryKey: productKeys.list(), queryFn: ({ signal }) => fetchProducts(signal) });
}

function useSetProduct() {
  const queryClient = useQueryClient();
  return (product: Product) => {
    queryClient.setQueryData<Product[]>(productKeys.list(), (products = []) =>
      products.some((item) => item.id === product.id)
        ? products.map((item) => (item.id === product.id ? product : item))
        : [product, ...products],
    );
  };
}

export function useCreateProduct() {
  const setProduct = useSetProduct();
  return useMutation({ mutationFn: createProduct, onSuccess: setProduct });
}

export function useUpdateProduct() {
  const setProduct = useSetProduct();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ProductWriteDto }) => updateProduct(id, body),
    onSuccess: setProduct,
  });
}

export function useDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map(deleteProduct));
      return {
        succeeded: ids.filter((_, index) => results[index]?.status === 'fulfilled'),
        failed: ids.filter((_, index) => results[index]?.status === 'rejected'),
      };
    },
    onSuccess: ({ succeeded }) => {
      const removed = new Set(succeeded);
      queryClient.setQueryData<Product[]>(productKeys.list(), (products) =>
        products?.filter((product) => !removed.has(product.id)),
      );
    },
  });
}
