'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryOrdersApi, DeliveryOrder, DeliveryOrderStatus } from '@/lib/api/delivery-orders';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Search, Check, X, Eye, Package, Truck, List, LayoutGrid, Printer } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DeliveryOrderForm } from '@/components/delivery-orders/delivery-order-form';
import { DeliveryOrderKanban } from '@/components/delivery-orders/delivery-order-kanban';

export default function DeliveryOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryOrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['delivery-orders', { search, status: statusFilter, page, limit }],
    queryFn: () => deliveryOrdersApi.getAll({ search, status: statusFilter || undefined, page, limit }),
  });

  const { data: allOrders } = useQuery({
    queryKey: ['delivery-orders', 'all', { search, status: statusFilter }],
    queryFn: () => deliveryOrdersApi.getAll({ search, status: statusFilter || undefined, limit: 1000 }),
    enabled: viewMode === 'kanban',
  });

  const pickMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: any[] }) => 
      deliveryOrdersApi.pick(id, { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    },
  });

  const packMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: any[] }) => 
      deliveryOrdersApi.pack(id, { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => deliveryOrdersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    },
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => deliveryOrdersApi.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['move-history'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => deliveryOrdersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    },
  });

  const handlePick = async (order: DeliveryOrder) => {
    if (confirm('Mark all items as picked?')) {
      // Mark all items as fully picked
      const items = order.items.map(item => ({
        itemId: item.id,
        pickedQuantity: item.quantity,
      }));
      await pickMutation.mutateAsync({ id: order.id, items });
    }
  };

  const handlePack = async (order: DeliveryOrder) => {
    if (confirm('Mark all items as packed?')) {
      // Mark all items as fully packed
      const items = order.items.map(item => ({
        itemId: item.id,
        packedQuantity: item.quantity,
      }));
      await packMutation.mutateAsync({ id: order.id, items });
    }
  };

  const handleValidate = async (id: string) => {
    if (confirm('Validate this delivery order? Stock will be deducted automatically.')) {
      await validateMutation.mutateAsync(id);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Cancel this delivery order?')) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const handlePrint = (order: DeliveryOrder) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const itemsHtml = order.items.map(item => {
        const total = item.quantity * item.unitPrice;
        return `
          <tr>
            <td>${item.product?.name || 'N/A'}</td>
            <td>${item.quantity}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td>$${total.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Delivery Order ${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .info { margin-bottom: 20px; }
              .items { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Delivery Order ${order.orderNumber}</h1>
            </div>
            <div class="info">
              <p><strong>Customer:</strong> ${order.customerName}</p>
              <p><strong>Warehouse:</strong> ${order.warehouse?.name || 'N/A'}</p>
              <p><strong>Expected Date:</strong> ${formatDate(order.expectedDate)}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
            <table class="items">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: DeliveryOrderStatus) => {
    switch (status) {
      case DeliveryOrderStatus.DONE:
        return 'bg-green-100 text-green-800';
      case DeliveryOrderStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      case DeliveryOrderStatus.READY:
        return 'bg-blue-100 text-blue-800';
      case DeliveryOrderStatus.PACKING:
        return 'bg-purple-100 text-purple-800';
      case DeliveryOrderStatus.PICKING:
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
            <h1 className="text-3xl font-bold text-gray-900">Delivery Orders</h1>
            <p className="mt-2 text-gray-600">Manage outgoing stock orders</p>
          </div>
          <div className="flex space-x-2">
            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Delivery Order
            </Button>
          </div>
        </div>

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Create New Delivery Order"
          size="lg"
        >
          <DeliveryOrderForm
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
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
                  placeholder="Search by reference or contact..."
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
                  setStatusFilter(e.target.value as DeliveryOrderStatus | '');
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value={DeliveryOrderStatus.DRAFT}>Draft</option>
                <option value={DeliveryOrderStatus.PICKING}>Picking</option>
                <option value={DeliveryOrderStatus.PACKING}>Packing</option>
                <option value={DeliveryOrderStatus.READY}>Ready</option>
                <option value={DeliveryOrderStatus.DONE}>Done</option>
                <option value={DeliveryOrderStatus.CANCELED}>Canceled</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'kanban' ? (
              <DeliveryOrderKanban
                orders={allOrders?.items || []}
                onPick={handlePick}
                onPack={handlePack}
                onValidate={handleValidate}
                onCancel={handleCancel}
                onView={(id) => {
                  const order = allOrders?.items.find((o) => o.id === id);
                  if (order) setSelectedOrder(order);
                }}
              />
            ) : isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : data && data.items.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Warehouse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Schedule Date
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
                      {data.items.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.warehouse?.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.items.length} item(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.expectedDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrint(order)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.status === DeliveryOrderStatus.DRAFT && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePick(order)}
                                disabled={pickMutation.isPending}
                                title="Pick Items"
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            )}
                            {(order.status === DeliveryOrderStatus.PICKING || order.status === DeliveryOrderStatus.DRAFT) && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePack(order)}
                                disabled={packMutation.isPending}
                                title="Pack Items"
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status === DeliveryOrderStatus.READY && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleValidate(order.id)}
                                disabled={validateMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status !== DeliveryOrderStatus.DONE &&
                              order.status !== DeliveryOrderStatus.CANCELED && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancel(order.id)}
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
              <div className="text-center py-8 text-gray-500">No delivery orders found</div>
            )}
          </CardContent>
        </Card>

        {selectedOrder && (
          <Modal
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            title={`Delivery Order ${selectedOrder.orderNumber}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Customer</p>
                  <p className="text-sm text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Warehouse</p>
                  <p className="text-sm text-gray-900">{selectedOrder.warehouse?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Expected Date</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedOrder.expectedDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.product?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handlePrint(selectedOrder)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button onClick={() => setSelectedOrder(null)}>Close</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
}
