'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptsApi, Receipt, ReceiptStatus } from '@/lib/api/receipts';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Search, Check, X, Eye, List, LayoutGrid, Printer } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ReceiptForm } from '@/components/receipts/receipt-form';
import { ReceiptKanban } from '@/components/receipts/receipt-kanban';

export default function ReceiptsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReceiptStatus | ''>('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['receipts', { search, status: statusFilter, page, limit }],
    queryFn: () => receiptsApi.getAll({ search, status: statusFilter || undefined, page, limit }),
  });

  // For Kanban view, get all receipts without pagination
  const { data: allReceipts } = useQuery({
    queryKey: ['receipts', 'all', { search, status: statusFilter }],
    queryFn: () => receiptsApi.getAll({ search, status: statusFilter || undefined, limit: 1000 }),
    enabled: viewMode === 'kanban',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => receiptsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => receiptsApi.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['move-history'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => receiptsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });

  const handleValidate = async (id: string) => {
    if (confirm('Validate this receipt? Stock will be updated automatically.')) {
      await validateMutation.mutateAsync(id);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Cancel this receipt?')) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const handlePrint = (receipt: Receipt) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const itemsHtml = receipt.items.map(item => {
        const unitPrice = item.unitPrice || 0;
        const total = item.quantity * unitPrice;
        return `
          <tr>
            <td>${item.product?.name || 'N/A'}</td>
            <td>${item.quantity}</td>
            <td>$${unitPrice.toFixed(2)}</td>
            <td>$${total.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt ${receipt.receiptNumber}</title>
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
              <h1>Receipt ${receipt.receiptNumber}</h1>
            </div>
            <div class="info">
              <p><strong>Supplier:</strong> ${receipt.supplierName}</p>
              <p><strong>Warehouse:</strong> ${receipt.warehouse?.name || 'N/A'}</p>
              <p><strong>Expected Date:</strong> ${formatDate(receipt.expectedDate)}</p>
              <p><strong>Status:</strong> ${receipt.status}</p>
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

  const getStatusColor = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.DONE:
        return 'bg-green-100 text-green-800';
      case ReceiptStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      case ReceiptStatus.READY:
        return 'bg-blue-100 text-blue-800';
      case ReceiptStatus.WAITING:
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
            <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
            <p className="mt-2 text-gray-600">Manage incoming stock receipts</p>
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
              New Receipt
            </Button>
          </div>
        </div>

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Create New Receipt"
          size="lg"
        >
          <ReceiptForm
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ['receipts'] });
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
              {viewMode === 'list' && (
                <select
                  className="h-10 rounded-md border border-gray-300 px-3"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as ReceiptStatus | '');
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value={ReceiptStatus.DRAFT}>Draft</option>
                  <option value={ReceiptStatus.WAITING}>Waiting</option>
                  <option value={ReceiptStatus.READY}>Ready</option>
                  <option value={ReceiptStatus.DONE}>Done</option>
                  <option value={ReceiptStatus.CANCELED}>Canceled</option>
                </select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'kanban' ? (
              <ReceiptKanban
                receipts={allReceipts?.items || []}
                onValidate={handleValidate}
                onCancel={handleCancel}
                onView={(id) => {
                  const receipt = allReceipts?.items.find((r) => r.id === id);
                  if (receipt) {
                    setSelectedReceipt(receipt);
                  }
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
                          Receipt #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Warehouse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Expected Date
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
                      {data.items.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {receipt.receiptNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {receipt.supplierName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {receipt.warehouse?.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {receipt.items.length} item(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(receipt.expectedDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                receipt.status
                              )}`}
                            >
                              {receipt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrint(receipt)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReceipt(receipt)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(receipt.status === ReceiptStatus.DRAFT || receipt.status === ReceiptStatus.READY) && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleValidate(receipt.id)}
                                disabled={validateMutation.isPending}
                                title="Validate Receipt"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {receipt.status !== ReceiptStatus.DONE &&
                              receipt.status !== ReceiptStatus.CANCELED && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancel(receipt.id)}
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
              <div className="text-center py-8 text-gray-500">No receipts found</div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Detail Modal */}
        {selectedReceipt && (
          <Modal
            isOpen={!!selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
            title={`Receipt ${selectedReceipt.receiptNumber}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Supplier</p>
                  <p className="text-sm text-gray-900">{selectedReceipt.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Warehouse</p>
                  <p className="text-sm text-gray-900">{selectedReceipt.warehouse?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Expected Date</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedReceipt.expectedDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      selectedReceipt.status
                    )}`}
                  >
                    {selectedReceipt.status}
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
                    {selectedReceipt.items.map((item, idx) => {
                      const unitPrice = item.unitPrice || 0;
                      const total = item.quantity * unitPrice;
                      return (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.product?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">${unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            ${total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handlePrint(selectedReceipt)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button onClick={() => setSelectedReceipt(null)}>Close</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
}
