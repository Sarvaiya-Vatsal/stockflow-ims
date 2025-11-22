'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockAdjustmentsApi, StockAdjustment, StockAdjustmentStatus } from '@/lib/api/stock-adjustments';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Search, Check, X, Eye, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { StockAdjustmentForm } from '@/components/stock-adjustments/stock-adjustment-form';

export default function StockAdjustmentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockAdjustmentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['stock-adjustments', { search, status: statusFilter, page, limit }],
    queryFn: () => stockAdjustmentsApi.getAll({ search, status: statusFilter || undefined, page, limit }),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => stockAdjustmentsApi.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => stockAdjustmentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
    },
  });

  const handleValidate = async (id: string) => {
    if (confirm('Validate this adjustment? Stock will be corrected automatically.')) {
      await validateMutation.mutateAsync(id);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Cancel this adjustment?')) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const getStatusColor = (status: StockAdjustmentStatus) => {
    switch (status) {
      case StockAdjustmentStatus.DONE:
        return 'bg-green-100 text-green-800';
      case StockAdjustmentStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      case StockAdjustmentStatus.READY:
        return 'bg-blue-100 text-blue-800';
      case StockAdjustmentStatus.WAITING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Adjustments</h1>
            <p className="mt-2 text-gray-600">Fix inventory discrepancies</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Adjustment
          </Button>
        </div>

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Create New Stock Adjustment"
          size="lg"
        >
          <StockAdjustmentForm
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search adjustments..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <select
                className="h-10 rounded-md border border-gray-300 px-3"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StockAdjustmentStatus | '');
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value={StockAdjustmentStatus.DRAFT}>Draft</option>
                <option value={StockAdjustmentStatus.WAITING}>Waiting</option>
                <option value={StockAdjustmentStatus.READY}>Ready</option>
                <option value={StockAdjustmentStatus.DONE}>Done</option>
                <option value={StockAdjustmentStatus.CANCELED}>Canceled</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : data && data.items.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Adjustment #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Warehouse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.items.map((adjustment) => (
                        <tr key={adjustment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {adjustment.adjustmentNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {adjustment.warehouse?.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {adjustment.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {adjustment.items.length} item(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                adjustment.status
                              )}`}
                            >
                              {adjustment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {adjustment.status === StockAdjustmentStatus.READY && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleValidate(adjustment.id)}
                                disabled={validateMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {adjustment.status !== StockAdjustmentStatus.DONE &&
                              adjustment.status !== StockAdjustmentStatus.CANCELED && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancel(adjustment.id)}
                                  disabled={cancelMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
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
              <div className="text-center py-8 text-gray-500">No adjustments found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
