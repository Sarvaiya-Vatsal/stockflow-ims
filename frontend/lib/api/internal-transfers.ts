import { apiClient } from './client';

export enum InternalTransferStatus {
  DRAFT = 'draft',
  WAITING = 'waiting',
  READY = 'ready',
  DONE = 'done',
  CANCELED = 'canceled',
}

export interface InternalTransferItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    sku: string;
    name: string;
  };
  quantity: number;
}

export interface InternalTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  fromWarehouse?: {
    id: string;
    name: string;
  };
  toWarehouseId: string;
  toWarehouse?: {
    id: string;
    name: string;
  };
  status: InternalTransferStatus;
  scheduledDate: string;
  completedDate?: string;
  items: InternalTransferItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInternalTransferDto {
  fromWarehouseId: string;
  toWarehouseId: string;
  transferDate?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface UpdateInternalTransferDto {
  scheduledDate?: string;
  items?: {
    productId: string;
    quantity: number;
  }[];
}

export interface InternalTransferFilters {
  search?: string;
  status?: InternalTransferStatus;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  page?: number;
  limit?: number;
}

export interface InternalTransfersResponse {
  items: InternalTransfer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const internalTransfersApi = {
  getAll: async (filters?: InternalTransferFilters): Promise<InternalTransfersResponse> => {
    const response = await apiClient.get<InternalTransfersResponse>('/internal-transfers', {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: string): Promise<InternalTransfer> => {
    const response = await apiClient.get<InternalTransfer>(`/internal-transfers/${id}`);
    return response.data;
  },

  create: async (data: CreateInternalTransferDto): Promise<InternalTransfer> => {
    const response = await apiClient.post<InternalTransfer>('/internal-transfers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateInternalTransferDto): Promise<InternalTransfer> => {
    const response = await apiClient.patch<InternalTransfer>(`/internal-transfers/${id}`, data);
    return response.data;
  },

  validate: async (id: string): Promise<InternalTransfer> => {
    const response = await apiClient.post<InternalTransfer>(`/internal-transfers/${id}/validate`);
    return response.data;
  },

  cancel: async (id: string): Promise<InternalTransfer> => {
    const response = await apiClient.post<InternalTransfer>(`/internal-transfers/${id}/cancel`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/internal-transfers/${id}`);
  },
};


