'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';

export function LowStockAlert() {
  const { data: lowStockProducts } = useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => productsApi.getAll({ lowStock: true, limit: 5 }),
    refetchInterval: 60000, // Refetch every minute
  });

  if (!lowStockProducts || lowStockProducts.items.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <Link
                href="/products?lowStock=true"
                className="text-xs text-yellow-700 hover:text-yellow-900 underline"
              >
                View All
              </Link>
            </div>
            <p className="mt-1 text-sm text-yellow-700">
              {lowStockProducts.total} product{lowStockProducts.total !== 1 ? 's' : ''} below reorder point
            </p>
            <div className="mt-2 space-y-1">
              {lowStockProducts.items.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center space-x-2 text-xs text-yellow-700">
                  <Package className="h-3 w-3" />
                  <span>
                    {product.name} ({product.sku}) - Stock: {product.stockLevels?.[0]?.quantity || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

