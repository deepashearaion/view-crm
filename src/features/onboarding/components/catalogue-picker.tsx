import { Package, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useProducts, type Product } from '@/features/products';
import { formatCurrency } from '@/lib/format';

interface CataloguePickerProps {
  onPick: (product: Product) => void;
  disabled?: boolean;
}

/** "Add from catalogue": picks a product or service to turn into an invoice line. */
export function CataloguePicker({ onPick, disabled }: CataloguePickerProps) {
  const [open, setOpen] = useState(false);
  const { data: products = [], isPending, isError } = useProducts();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <Package aria-hidden />
          Add from catalogue
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Command>
          <CommandInput placeholder="Search products and services…" />
          <CommandList>
            <CommandEmpty>
              {isPending
                ? 'Loading catalogue…'
                : isError
                  ? 'Couldn’t load the catalogue.'
                  : 'No matching items.'}
            </CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.category} ${product.sku} #${product.id}`}
                  onSelect={() => {
                    onPick(product);
                    setOpen(false);
                  }}
                >
                  <Plus aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{product.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatCurrency(product.sellingPrice)} + {product.taxPercent}% GST
                      {product.category && ` · ${product.category}`}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
