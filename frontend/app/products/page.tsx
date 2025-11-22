'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, Product } from '@/lib/api/products';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ProductForm } from '@/components/products/product-form';
import { CategoryManager } from '@/components/products/category-manager';
import { AddStockModal } from '@/components/products/add-stock-modal';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingStockProduct, setAddingStockProduct] = useState<Product | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const limit = 20;

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['products', { search, page, limit, lowStock: lowStockOnly }],
    queryFn: async () => {
      try {
        // Only send lowStockOnly if it's true, otherwise omit it
        const filters: any = { search, page, limit };
        if (lowStockOnly) {
          filters.lowStockOnly = true;
        }
        const result = await productsApi.getAll(filters);
        console.log('Products fetched:', result);
        return result;
      } catch (err: any) {
        console.error('Error fetching products:', err);
        console.error('Error details:', err.response?.data);
        throw err;
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to ensure fresh data
    retry: 2, // Retry failed requests
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    // Invalidate and refetch products
    queryClient.invalidateQueries({ queryKey: ['products'] });
    // Also invalidate dashboard to update product count
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    // Force refetch after a short delay to ensure data is fresh
    setTimeout(() => {
      refetch();
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
    }, 300);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={handleFormCancel}>
            ← Back to Products
          </Button>
          <ProductForm
            product={editingProduct || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-gray-600">Manage your product inventory</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowCategories(true)}>
              <Package className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {showCategories && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Category Management</h2>
              <Button variant="outline" onClick={() => setShowCategories(false)}>
                Close
              </Button>
            </div>
            <CategoryManager />
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by SKU or name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                variant={lowStockOnly ? 'default' : 'outline'}
                onClick={() => {
                  setLowStockOnly(!lowStockOnly);
                  setPage(1);
                }}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Low Stock Only
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">Error loading products</p>
                <p className="text-sm text-gray-500">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => queryClient.refetchQueries({ queryKey: ['products'] })}
                >
                  Retry
                </Button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : data && data.items && data.items.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit of Measure
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.items.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category?.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.unitOfMeasure || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.stockLevels && product.stockLevels.length > 0 ? (
                              <div className="space-y-1">
                                {product.stockLevels.map((stock) => (
                                  <div key={stock.id} className="flex items-center space-x-2">
                                    <Package className="h-4 w-4 text-gray-400" />
                                    <span>
                                      {stock.warehouse?.name}: {stock.quantity - stock.reservedQuantity} (Available: {stock.quantity}, Reserved: {stock.reservedQuantity})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No stock</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAddingStockProduct(product)}
                              title="Add Stock"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {data.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of{' '}
                      {data.total} results
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= data.totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">No products found</div>
            )}
          </CardContent>
        </Card>

        {addingStockProduct && (
          <AddStockModal
            product={addingStockProduct}
            isOpen={!!addingStockProduct}
            onClose={() => setAddingStockProduct(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}

