'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { productsApi, CreateProductDto, UpdateProductDto, Product } from '@/lib/api/products';
import { categoriesApi, Category } from '@/lib/api/categories';
import { warehousesApi, Warehouse } from '@/lib/api/warehouses';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.string().uuid('Category ID must be a valid UUID').optional().or(z.literal('')).or(z.undefined()),
  unitOfMeasure: z.string().optional(),
  reorderPoint: z.number().min(0, 'Reorder point must be positive').optional(),
  initialStock: z.object({
    warehouseId: z.string().optional(),
    quantity: z.number().min(0).optional(),
  }).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAllActive(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId || '',
          unitOfMeasure: product.unitOfMeasure || '',
          reorderPoint: product.reorderPoint || 0,
        }
      : {
          reorderPoint: 0,
        },
  });

  const hasInitialStock = watch('initialStock.warehouseId');

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      if (product) {
        const updateData: UpdateProductDto = {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId && data.categoryId !== '' ? data.categoryId : undefined,
          unitOfMeasure: data.unitOfMeasure || undefined,
          reorderPoint: data.reorderPoint,
        };
        await productsApi.update(product.id, updateData);
      } else {
        const createData: CreateProductDto = {
          sku: data.sku,
          name: data.name,
          description: data.description,
          categoryId: data.categoryId && data.categoryId !== '' ? data.categoryId : undefined,
          unitOfMeasure: data.unitOfMeasure || undefined,
          reorderPoint: data.reorderPoint,
          initialStock: data.initialStock?.warehouseId && data.initialStock?.quantity
            ? {
                warehouseId: data.initialStock.warehouseId,
                quantity: data.initialStock.quantity,
              }
            : undefined,
        };
        await productsApi.create(createData);
      }
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Create New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!product && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU / Code *
              </label>
              <Input
                {...register('sku')}
                placeholder="PROD-001"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              {...register('name')}
              placeholder="Product Name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="w-full h-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              {...register('categoryId')}
              className="w-full h-10 rounded-md border border-gray-300 px-3"
            >
              <option value="">No Category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measure
              </label>
              <Input
                {...register('unitOfMeasure')}
                placeholder="pcs, kg, liters, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Point
              </label>
              <Input
                type="number"
                {...register('reorderPoint', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.reorderPoint && (
                <p className="mt-1 text-sm text-red-600">{errors.reorderPoint.message}</p>
              )}
            </div>
          </div>

          {!product && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Initial Stock (Optional)
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (hasInitialStock) {
                      setValue('initialStock', undefined);
                    } else {
                      setValue('initialStock', { warehouseId: '', quantity: 0 });
                    }
                  }}
                >
                  {hasInitialStock ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Stock
                    </>
                  )}
                </Button>
              </div>
              {hasInitialStock && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warehouse
                    </label>
                    <select
                      {...register('initialStock.warehouseId')}
                      className="w-full h-10 rounded-md border border-gray-300 px-3"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses?.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      {...register('initialStock.quantity', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


