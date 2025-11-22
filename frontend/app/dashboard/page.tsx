'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, MoveHistoryFilters } from '@/lib/api/dashboard';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, AlertTriangle, Receipt, Truck, ArrowLeftRight, Filter, X } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { LowStockAlert } from '@/components/alerts/low-stock-alert';

export default function DashboardPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MoveHistoryFilters>({
    page: 1,
    limit: 20,
  });

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => dashboardApi.getKPIs(),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => dashboardApi.getRecentActivity(10),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const { data: moveHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['dashboard', 'move-history', filters],
    queryFn: () => dashboardApi.getMoveHistory(filters),
    enabled: showFilters,
  });

  const kpiCards = [
    {
      title: 'Total Products',
      value: kpis?.totalProducts ?? 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Low Stock Items',
      value: kpis?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Pending Receipts',
      value: kpis?.pendingReceipts ?? 0,
      icon: Receipt,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Pending Deliveries',
      value: kpis?.pendingDeliveries ?? 0,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Scheduled Transfers',
      value: kpis?.scheduledTransfers ?? 0,
      icon: ArrowLeftRight,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your inventory management system
          </p>
        </div>

        {/* Low Stock Alert */}
        <LowStockAlert />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {kpisLoading ? '...' : kpi.value}
                      </p>
                    </div>
                    <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Move History</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({ page: 1, limit: 20 });
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
              {historyLoading ? (
                <div className="text-center py-8 text-gray-500">Loading history...</div>
              ) : moveHistory && moveHistory.items.length > 0 ? (
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
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {activity.transactionType} • {activity.warehouse.name} •{' '}
                          {formatDateTime(activity.timestamp)}
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
                  {moveHistory.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
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
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No move history found</div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
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
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {activity.transactionType} • {activity.warehouse.name} •{' '}
                        {formatDateTime(activity.timestamp)}
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
            ) : (
              <div className="text-center py-8 text-gray-500">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

