'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { receiptsApi, CreateReceiptDto } from '@/lib/api/receipts';
import { productsApi } from '@/lib/api/products';
import { warehousesApi } from '@/lib/api/warehouses';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

const receiptSchema = z.object({
  supplierName: z.string().min(1, 'Supplier name is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  expectedDate: z.string().min(1, 'Expected date is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0, 'Unit price must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;

interface ReceiptFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReceiptForm({ onSuccess, onCancel }: ReceiptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAllActive(),
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll({ limit: 1000 }),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      expectedDate: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = async (data: ReceiptFormData) => {
    try {
      setIsSubmitting(true);
      await receiptsApi.create(data);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier Name *
          </label>
          <Input {...register('supplierName')} placeholder="Azure Interior" />
          {errors.supplierName && (
            <p className="mt-1 text-sm text-red-600">{errors.supplierName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warehouse *
          </label>
          <select
            {...register('warehouseId')}
            className="w-full h-10 rounded-md border border-gray-300 px-3"
          >
            <option value="">Select Warehouse</option>
            {warehouses?.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
          {errors.warehouseId && (
            <p className="mt-1 text-sm text-red-600">{errors.warehouseId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Date *
          </label>
          <Input type="date" {...register('expectedDate')} />
          {errors.expectedDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Items *</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start space-x-2 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  <select
                    {...register(`items.${index}.productId`)}
                    className="w-full h-10 rounded-md border border-gray-300 px-3"
                  >
                    <option value="">Select Product</option>
                    {products?.items.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Quantity"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price"
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {errors.items && (
          <p className="mt-1 text-sm text-red-600">{errors.items.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Receipt'}
        </Button>
      </div>
    </form>
  );
}

