import { apiClient } from './client';

export enum StockAdjustmentStatus {
  DRAFT = 'draft',
  WAITING = 'waiting',
  READY = 'ready',
  DONE = 'done',
  CANCELED = 'canceled',
}

export enum AdjustmentReason {
  DAMAGE = 'damage',
  LOSS = 'loss',
  FOUND = 'found',
  CYCLE_COUNT = 'cycle_count',
  OTHER = 'other',
}

export interface StockAdjustmentItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    sku: string;
    name: string;
  };
  quantityBefore: number;
  quantityAfter: number;
  quantityChange: number;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
  };
  status: StockAdjustmentStatus;
  reason: AdjustmentReason;
  notes?: string;
  items: StockAdjustmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockAdjustmentDto {
  warehouseId: string;
  reason: AdjustmentReason;
  adjustmentDate?: string;
  items: {
    productId: string;
    adjustedQuantity: number;
  }[];
  notes?: string;
}

export interface UpdateStockAdjustmentDto {
  reason?: AdjustmentReason;
  notes?: string;
  items?: {
    productId: string;
    quantityAfter: number;
  }[];
}

export interface StockAdjustmentFilters {
  search?: string;
  status?: StockAdjustmentStatus;
  warehouseId?: string;
  reason?: AdjustmentReason;
  page?: number;
  limit?: number;
}

export interface StockAdjustmentsResponse {
  items: StockAdjustment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const stockAdjustmentsApi = {
  getAll: async (filters?: StockAdjustmentFilters): Promise<StockAdjustmentsResponse> => {
    const response = await apiClient.get<StockAdjustmentsResponse>('/stock-adjustments', {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: string): Promise<StockAdjustment> => {
    const response = await apiClient.get<StockAdjustment>(`/stock-adjustments/${id}`);
    return response.data;
  },

  create: async (data: CreateStockAdjustmentDto): Promise<StockAdjustment> => {
    const response = await apiClient.post<StockAdjustment>('/stock-adjustments', data);
    return response.data;
  },

  update: async (id: string, data: UpdateStockAdjustmentDto): Promise<StockAdjustment> => {
    const response = await apiClient.patch<StockAdjustment>(`/stock-adjustments/${id}`, data);
    return response.data;
  },

  validate: async (id: string): Promise<StockAdjustment> => {
    const response = await apiClient.post<StockAdjustment>(`/stock-adjustments/${id}/validate`);
    return response.data;
  },

  cancel: async (id: string): Promise<StockAdjustment> => {
    const response = await apiClient.post<StockAdjustment>(`/stock-adjustments/${id}/cancel`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/stock-adjustments/${id}`);
  },
};


