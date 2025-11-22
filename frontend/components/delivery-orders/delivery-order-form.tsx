'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { deliveryOrdersApi, CreateDeliveryOrderDto } from '@/lib/api/delivery-orders';
import { productsApi } from '@/lib/api/products';
import { warehousesApi } from '@/lib/api/warehouses';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

const deliveryOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
});

type DeliveryOrderFormData = z.infer<typeof deliveryOrderSchema>;

interface DeliveryOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeliveryOrderForm({ onSuccess, onCancel }: DeliveryOrderFormProps) {
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
  } = useForm<DeliveryOrderFormData>({
    resolver: zodResolver(deliveryOrderSchema),
    defaultValues: {
      deliveryDate: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = async (data: DeliveryOrderFormData) => {
    try {
      setIsSubmitting(true);
      await deliveryOrdersApi.create(data);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create delivery order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name *
          </label>
          <Input {...register('customerName')} placeholder="Azure Interior" />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
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
            Delivery Date *
          </label>
          <Input type="date" {...register('deliveryDate')} />
          {errors.deliveryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.deliveryDate.message}</p>
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
                    step="1"
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
          {isSubmitting ? 'Creating...' : 'Create Delivery Order'}
        </Button>
      </div>
    </form>
  );
}

