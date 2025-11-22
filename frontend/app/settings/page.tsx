'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesApi, Warehouse, CreateWarehouseDto } from '@/lib/api/warehouses';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWarehouseDto) => warehousesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setShowForm(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWarehouseDto> }) =>
      warehousesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setShowForm(false);
      setEditingWarehouse(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warehousesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: editingWarehouse
      ? {
          name: editingWarehouse.name,
          address: editingWarehouse.address,
        }
      : {},
  });

  const onSubmit = async (data: WarehouseFormData) => {
    if (editingWarehouse) {
      await updateMutation.mutateAsync({ id: editingWarehouse.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setShowForm(true);
    reset({
      name: warehouse.name,
      address: warehouse.address,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this warehouse?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => {
            setShowForm(false);
            setEditingWarehouse(null);
            reset();
          }}>
            ← Back to Settings
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingWarehouse ? 'Edit Warehouse' : 'Create New Warehouse'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input {...register('name')} placeholder="Main Warehouse" />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input {...register('address')} placeholder="123 Main St, City" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingWarehouse(null);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : editingWarehouse
                      ? 'Update Warehouse'
                      : 'Create Warehouse'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">Manage warehouses and application settings</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Warehouses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : warehouses && warehouses.length > 0 ? (
              <div className="space-y-4">
                {warehouses.map((warehouse) => (
                  <div
                    key={warehouse.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${warehouse.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Building2 className={`h-6 w-6 ${warehouse.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{warehouse.name}</h3>
                        {warehouse.address && (
                          <p className="text-sm text-gray-500">{warehouse.address}</p>
                        )}
                        <span
                          className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded ${
                            warehouse.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {warehouse.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(warehouse)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {warehouse.isActive && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(warehouse.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No warehouses found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}


