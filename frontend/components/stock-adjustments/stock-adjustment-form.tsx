'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { stockAdjustmentsApi, CreateStockAdjustmentDto, AdjustmentReason } from '@/lib/api/stock-adjustments';
import { productsApi } from '@/lib/api/products';
import { warehousesApi } from '@/lib/api/warehouses';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

const adjustmentSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  reason: z.nativeEnum(AdjustmentReason),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product is required'),
        adjustedQuantity: z.number().min(0, 'Adjusted quantity must be non-negative'),
      })
    )
    .min(1, 'At least one item is required'),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface StockAdjustmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function StockAdjustmentForm({ onSuccess, onCancel }: StockAdjustmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAllActive(),
  });

  const { data: products } = useQuery({
    queryKey: ['products', selectedWarehouse],
    queryFn: () => productsApi.getAll({ warehouseId: selectedWarehouse, limit: 1000 }),
    enabled: !!selectedWarehouse,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      reason: AdjustmentReason.CYCLE_COUNT,
      items: [{ productId: '', adjustedQuantity: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const warehouseId = watch('warehouseId');

  // Update selected warehouse when warehouse changes
  useEffect(() => {
    if (warehouseId) {
      setSelectedWarehouse(warehouseId);
    }
  }, [warehouseId]);

  const onSubmit = async (data: AdjustmentFormData) => {
    try {
      setIsSubmitting(true);
      await stockAdjustmentsApi.create(data);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warehouse *
          </label>
          <select
            {...register('warehouseId', {
              onChange: (e) => {
                setSelectedWarehouse(e.target.value);
                setValue('items', [{ productId: '', quantityAfter: 0 }]);
              },
            })}
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
            Reason *
          </label>
          <select
            {...register('reason')}
            className="w-full h-10 rounded-md border border-gray-300 px-3"
          >
            <option value={AdjustmentReason.CYCLE_COUNT}>Cycle Count</option>
            <option value={AdjustmentReason.DAMAGE}>Damage</option>
            <option value={AdjustmentReason.LOSS}>Loss</option>
            <option value={AdjustmentReason.FOUND}>Found</option>
            <option value={AdjustmentReason.OTHER}>Other</option>
          </select>
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...register('notes')}
            className="w-full h-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Additional notes about this adjustment"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Items *</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productId: '', adjustedQuantity: 0 })}
            disabled={!warehouseId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {!warehouseId && (
          <p className="text-sm text-gray-500 mb-2">Please select a warehouse first to see available products</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start space-x-2 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <select
                    {...register(`items.${index}.productId`)}
                    className="w-full h-10 rounded-md border border-gray-300 px-3"
                    disabled={!warehouseId}
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
                    placeholder="Adjusted Quantity"
                    {...register(`items.${index}.adjustedQuantity`, { valueAsNumber: true })}
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
          {isSubmitting ? 'Creating...' : 'Create Adjustment'}
        </Button>
      </div>
    </form>
  );
}

