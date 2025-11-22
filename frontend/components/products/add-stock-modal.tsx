'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { warehousesApi } from '@/lib/api/warehouses';
import { receiptsApi } from '@/lib/api/receipts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Product } from '@/lib/api/products';

const addStockSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive').optional(),
});

type AddStockFormData = z.infer<typeof addStockSchema>;

interface AddStockModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function AddStockModal({ product, isOpen, onClose }: AddStockModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAllActive(),
  });

  const createReceiptMutation = useMutation({
    mutationFn: (data: any) => receiptsApi.create(data),
    onSuccess: async (receipt) => {
      // Auto-validate the receipt to add stock immediately
      await receiptsApi.validate(receipt.id);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddStockFormData>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      quantity: 1,
      unitPrice: 0,
    },
  });

  const onSubmit = async (data: AddStockFormData) => {
    try {
      setIsSubmitting(true);
      // Create a receipt to add stock
      await createReceiptMutation.mutateAsync({
        supplierName: 'Stock Addition',
        warehouseId: data.warehouseId,
        expectedDate: new Date().toISOString().split('T')[0],
        items: [
          {
            productId: product.id,
            quantity: data.quantity,
            unitPrice: data.unitPrice || 0,
          },
        ],
        notes: `Stock addition for ${product.name}`,
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Stock - ${product.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <Input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price (Optional)
            </label>
            <Input
              type="number"
              step="0.01"
              {...register('unitPrice', { valueAsNumber: true })}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Stock...' : 'Add Stock'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

