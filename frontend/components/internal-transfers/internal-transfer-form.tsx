'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { internalTransfersApi, CreateInternalTransferDto } from '@/lib/api/internal-transfers';
import { productsApi } from '@/lib/api/products';
import { warehousesApi } from '@/lib/api/warehouses';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

const transferSchema = z.object({
  fromWarehouseId: z.string().min(1, 'From warehouse is required'),
  toWarehouseId: z.string().min(1, 'To warehouse is required'),
  transferDate: z.string().min(1, 'Transfer date is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
  message: 'From and To warehouses must be different',
  path: ['toWarehouseId'],
});

type TransferFormData = z.infer<typeof transferSchema>;

interface InternalTransferFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function InternalTransferForm({ onSuccess, onCancel }: InternalTransferFormProps) {
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
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transferDate: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const fromWarehouseId = watch('fromWarehouseId');

  const onSubmit = async (data: TransferFormData) => {
    try {
      setIsSubmitting(true);
      await internalTransfersApi.create(data);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Warehouse *
          </label>
          <select
            {...register('fromWarehouseId')}
            className="w-full h-10 rounded-md border border-gray-300 px-3"
          >
            <option value="">Select Warehouse</option>
            {warehouses?.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
          {errors.fromWarehouseId && (
            <p className="mt-1 text-sm text-red-600">{errors.fromWarehouseId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Warehouse *
          </label>
          <select
            {...register('toWarehouseId')}
            className="w-full h-10 rounded-md border border-gray-300 px-3"
          >
            <option value="">Select Warehouse</option>
            {warehouses?.filter((wh) => wh.id !== fromWarehouseId).map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
          {errors.toWarehouseId && (
            <p className="mt-1 text-sm text-red-600">{errors.toWarehouseId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transfer Date *
          </label>
          <Input type="date" {...register('transferDate')} />
          {errors.transferDate && (
            <p className="mt-1 text-sm text-red-600">{errors.transferDate.message}</p>
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
            onClick={() => append({ productId: '', quantity: 1 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start space-x-2 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-2">
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
                    placeholder="Quantity"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
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
          {isSubmitting ? 'Creating...' : 'Create Transfer'}
        </Button>
      </div>
    </form>
  );
}

