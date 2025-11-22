'use client';

import { DeliveryOrder, DeliveryOrderStatus } from '@/lib/api/delivery-orders';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, Package, Truck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DeliveryOrderKanbanProps {
  orders: DeliveryOrder[];
  onPick: (id: string) => void;
  onPack: (id: string) => void;
  onValidate: (id: string) => void;
  onCancel: (id: string) => void;
  onView: (id: string) => void;
}

const statusColumns: { status: DeliveryOrderStatus; label: string; color: string }[] = [
  { status: DeliveryOrderStatus.DRAFT, label: 'Draft', color: 'bg-gray-100' },
  { status: DeliveryOrderStatus.PICKING, label: 'Picking', color: 'bg-yellow-100' },
  { status: DeliveryOrderStatus.PACKING, label: 'Packing', color: 'bg-purple-100' },
  { status: DeliveryOrderStatus.READY, label: 'Ready', color: 'bg-blue-100' },
  { status: DeliveryOrderStatus.DONE, label: 'Done', color: 'bg-green-100' },
  { status: DeliveryOrderStatus.CANCELED, label: 'Canceled', color: 'bg-red-100' },
];

export function DeliveryOrderKanban({
  orders,
  onPick,
  onPack,
  onValidate,
  onCancel,
  onView,
}: DeliveryOrderKanbanProps) {
  const groupedOrders = statusColumns.reduce((acc, column) => {
    acc[column.status] = orders.filter((o) => o.status === column.status);
    return acc;
  }, {} as Record<DeliveryOrderStatus, DeliveryOrder[]>);

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {statusColumns.map((column) => (
        <div key={column.status} className="flex-shrink-0 w-80">
          <div className={`${column.color} p-3 rounded-t-lg`}>
            <h3 className="font-semibold text-gray-900">
              {column.label} ({groupedOrders[column.status]?.length || 0})
            </h3>
          </div>
          <div className="bg-gray-50 p-2 space-y-2 min-h-[400px] rounded-b-lg">
            {groupedOrders[column.status]?.map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{order.orderNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(order.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">{order.customerName}</p>
                    <p className="text-xs text-gray-500">
                      {order.warehouse?.name} • {formatDate(order.expectedDate)}
                    </p>
                    <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                    <div className="flex space-x-1 pt-2">
                      {order.status === DeliveryOrderStatus.DRAFT && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onPick(order.id)}
                        >
                          <Package className="mr-1 h-3 w-3" />
                          Pick
                        </Button>
                      )}
                      {order.status === DeliveryOrderStatus.PICKING && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onPack(order.id)}
                        >
                          <Truck className="mr-1 h-3 w-3" />
                          Pack
                        </Button>
                      )}
                      {order.status === DeliveryOrderStatus.READY && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onValidate(order.id)}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Validate
                        </Button>
                      )}
                      {order.status !== DeliveryOrderStatus.DONE &&
                        order.status !== DeliveryOrderStatus.CANCELED && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onCancel(order.id)}
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

