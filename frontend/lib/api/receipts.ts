import { apiClient } from './client';

export enum ReceiptStatus {
  DRAFT = 'draft',
  WAITING = 'waiting',
  READY = 'ready',
  DONE = 'done',
  CANCELED = 'canceled',
}

export interface ReceiptItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    sku: string;
    name: string;
  };
  quantity: number;
  receivedQuantity?: number;
  unitPrice: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  supplierName: string;
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
  };
  status: ReceiptStatus;
  expectedDate: string;
  receivedDate?: string;
  items: ReceiptItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReceiptDto {
  supplierName?: string;
  warehouseId: string;
  expectedDate?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice?: number;
  }[];
  notes?: string;
}

export interface UpdateReceiptDto {
  supplierName?: string;
  expectedDate?: string;
  items?: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface ValidateReceiptDto {
  receivedItems?: {
    itemId: string;
    receivedQuantity: number;
  }[];
}

export interface ReceiptFilters {
  search?: string;
  status?: ReceiptStatus;
  warehouseId?: string;
  page?: number;
  limit?: number;
}

export interface ReceiptsResponse {
  items: Receipt[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const receiptsApi = {
  getAll: async (filters?: ReceiptFilters): Promise<ReceiptsResponse> => {
    const response = await apiClient.get<ReceiptsResponse>('/receipts', {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Receipt> => {
    const response = await apiClient.get<Receipt>(`/receipts/${id}`);
    return response.data;
  },

  create: async (data: CreateReceiptDto): Promise<Receipt> => {
    const response = await apiClient.post<Receipt>('/receipts', data);
    return response.data;
  },

  update: async (id: string, data: UpdateReceiptDto): Promise<Receipt> => {
    const response = await apiClient.patch<Receipt>(`/receipts/${id}`, data);
    return response.data;
  },

  validate: async (id: string, data?: ValidateReceiptDto): Promise<Receipt> => {
    const response = await apiClient.post<Receipt>(`/receipts/${id}/validate`, data || {});
    return response.data;
  },

  cancel: async (id: string): Promise<Receipt> => {
    const response = await apiClient.post<Receipt>(`/receipts/${id}/cancel`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/receipts/${id}`);
  },
};


