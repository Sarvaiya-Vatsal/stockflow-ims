'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptsApi, Receipt, ReceiptStatus } from '@/lib/api/receipts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ReceiptKanbanProps {
  receipts: Receipt[];
  onValidate: (id: string) => void;
  onCancel: (id: string) => void;
  onView: (id: string) => void;
}

const statusColumns: { status: ReceiptStatus; label: string; color: string }[] = [
  { status: ReceiptStatus.DRAFT, label: 'Draft', color: 'bg-gray-100' },
  { status: ReceiptStatus.WAITING, label: 'Waiting', color: 'bg-yellow-100' },
  { status: ReceiptStatus.READY, label: 'Ready', color: 'bg-blue-100' },
  { status: ReceiptStatus.DONE, label: 'Done', color: 'bg-green-100' },
  { status: ReceiptStatus.CANCELED, label: 'Canceled', color: 'bg-red-100' },
];

export function ReceiptKanban({ receipts, onValidate, onCancel, onView }: ReceiptKanbanProps) {
  const groupedReceipts = statusColumns.reduce((acc, column) => {
    acc[column.status] = receipts.filter((r) => r.status === column.status);
    return acc;
  }, {} as Record<ReceiptStatus, Receipt[]>);

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {statusColumns.map((column) => (
        <div key={column.status} className="flex-shrink-0 w-80">
          <div className={`${column.color} p-3 rounded-t-lg`}>
            <h3 className="font-semibold text-gray-900">
              {column.label} ({groupedReceipts[column.status]?.length || 0})
            </h3>
          </div>
          <div className="bg-gray-50 p-2 space-y-2 min-h-[400px] rounded-b-lg">
            {groupedReceipts[column.status]?.map((receipt) => (
              <Card key={receipt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{receipt.receiptNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(receipt.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">{receipt.supplierName}</p>
                    <p className="text-xs text-gray-500">
                      {receipt.warehouse?.name} • {formatDate(receipt.expectedDate)}
                    </p>
                    <p className="text-xs text-gray-500">{receipt.items.length} item(s)</p>
                    <div className="flex space-x-1 pt-2">
                      {receipt.status === ReceiptStatus.READY && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onValidate(receipt.id)}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Validate
                        </Button>
                      )}
                      {receipt.status !== ReceiptStatus.DONE &&
                        receipt.status !== ReceiptStatus.CANCELED && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onCancel(receipt.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

