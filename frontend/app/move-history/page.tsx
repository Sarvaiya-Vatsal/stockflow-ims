'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, MoveHistoryFilters } from '@/lib/api/dashboard';
import { warehousesApi } from '@/lib/api/warehouses';
import { productsApi } from '@/lib/api/products';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, X } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function MoveHistoryPage() {
  const [filters, setFilters] = useState<MoveHistoryFilters>({
    page: 1,
    limit: 50,
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAllActive(),
  });

  const { data: moveHistory, isLoading } = useQuery({
    queryKey: ['move-history', filters],
    queryFn: () => dashboardApi.getMoveHistory(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Move History</h1>
          <p className="mt-2 text-gray-600">View all stock movement history</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 px-3"
                  value={filters.transactionType || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, transactionType: e.target.value || undefined, page: 1 })
                  }
                >
                  <option value="">All Types</option>
                  <option value="receipt">Receipt</option>
                  <option value="delivery">Delivery</option>
                  <option value="transfer_in">Transfer In</option>
                  <option value="transfer_out">Transfer Out</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse
                </label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 px-3"
                  value={filters.warehouseId || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, warehouseId: e.target.value || undefined, page: 1 })
                  }
                >
                  <option value="">All Warehouses</option>
                  {warehouses?.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value || undefined, page: 1 })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value || undefined, page: 1 })
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ page: 1, limit: 50 });
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movement History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : moveHistory && moveHistory.items.length > 0 ? (
              <>
                <div className="space-y-4">
                  {moveHistory.items.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">
                            {activity.product.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({activity.product.sku})
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {activity.transactionType}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {activity.warehouse.name} • {formatDateTime(activity.timestamp)}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Document: {activity.documentNumber} • By: {activity.user.fullName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            activity.quantityChange > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {activity.quantityChange > 0 ? '+' : ''}
                          {activity.quantityChange}
                        </div>
                        <div className="text-xs text-gray-500">
                          {activity.quantityBefore} → {activity.quantityAfter}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {moveHistory.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((moveHistory.page - 1) * moveHistory.limit) + 1} to{' '}
                      {Math.min(moveHistory.page * moveHistory.limit, moveHistory.total)} of{' '}
                      {moveHistory.total} results
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={moveHistory.page === 1}
                        onClick={() => setFilters({ ...filters, page: moveHistory.page - 1 })}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={moveHistory.page >= moveHistory.totalPages}
                        onClick={() => setFilters({ ...filters, page: moveHistory.page + 1 })}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">No movement history found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
