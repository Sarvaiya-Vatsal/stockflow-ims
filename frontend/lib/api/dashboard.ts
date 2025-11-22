import { apiClient } from './client';

export interface KPIs {
  totalProducts: number;
  lowStockCount: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
  timestamp: string;
  cached?: boolean;
}

export interface RecentActivity {
  id: string;
  timestamp: string;
  transactionType: string;
  documentNumber: string;
  product: {
    id: string;
    sku: string;
    name: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  metadata: Record<string, any>;
}

export interface MoveHistoryFilters {
  productId?: string;
  warehouseId?: string;
  transactionType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface MoveHistoryResponse {
  items: RecentActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const dashboardApi = {
  getKPIs: async (): Promise<KPIs> => {
    const response = await apiClient.get<KPIs>('/dashboard/kpis');
    return response.data;
  },

  getRecentActivity: async (limit: number = 20): Promise<RecentActivity[]> => {
    const response = await apiClient.get<RecentActivity[]>('/dashboard/recent-activity', {
      params: { limit },
    });
    return response.data;
  },

  getMoveHistory: async (filters: MoveHistoryFilters): Promise<MoveHistoryResponse> => {
    const response = await apiClient.get<MoveHistoryResponse>('/dashboard/move-history', {
      params: filters,
    });
    return response.data;
  },
};

