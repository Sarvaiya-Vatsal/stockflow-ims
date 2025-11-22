import { apiClient } from './client';

export enum DeliveryOrderStatus {
  DRAFT = 'draft',
  PICKING = 'picking',
  PACKING = 'packing',
  READY = 'ready',
  DONE = 'done',
  CANCELED = 'canceled',
}

export interface DeliveryOrderItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    sku: string;
    name: string;
  };
  quantity: number;
  pickedQuantity?: number;
  packedQuantity?: number;
  unitPrice: number;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
  };
  status: DeliveryOrderStatus;
  expectedDate: string;
  shippedDate?: string;
  items: DeliveryOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryOrderDto {
  customerName?: string;
  warehouseId: string;
  deliveryDate?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface UpdateDeliveryOrderDto {
  customerName?: string;
  expectedDate?: string;
  items?: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface PickItemsDto {
  items: {
    itemId: string;
    pickedQuantity: number;
  }[];
}

export interface PackItemsDto {
  items: {
    itemId: string;
    packedQuantity: number;
  }[];
}

export interface DeliveryOrderFilters {
  search?: string;
  status?: DeliveryOrderStatus;
  warehouseId?: string;
  page?: number;
  limit?: number;
}

export interface DeliveryOrdersResponse {
  items: DeliveryOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const deliveryOrdersApi = {
  getAll: async (filters?: DeliveryOrderFilters): Promise<DeliveryOrdersResponse> => {
    const response = await apiClient.get<DeliveryOrdersResponse>('/delivery-orders', {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: string): Promise<DeliveryOrder> => {
    const response = await apiClient.get<DeliveryOrder>(`/delivery-orders/${id}`);
    return response.data;
  },

  create: async (data: CreateDeliveryOrderDto): Promise<DeliveryOrder> => {
    const response = await apiClient.post<DeliveryOrder>('/delivery-orders', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDeliveryOrderDto): Promise<DeliveryOrder> => {
    const response = await apiClient.patch<DeliveryOrder>(`/delivery-orders/${id}`, data);
    return response.data;
  },

  pick: async (id: string, data: PickItemsDto): Promise<DeliveryOrder> => {
    const response = await apiClient.post<DeliveryOrder>(`/delivery-orders/${id}/pick`, data);
    return response.data;
  },

  pack: async (id: string, data: PackItemsDto): Promise<DeliveryOrder> => {
    const response = await apiClient.post<DeliveryOrder>(`/delivery-orders/${id}/pack`, data);
    return response.data;
  },

  validate: async (id: string): Promise<DeliveryOrder> => {
    const response = await apiClient.post<DeliveryOrder>(`/delivery-orders/${id}/validate`);
    return response.data;
  },

  cancel: async (id: string): Promise<DeliveryOrder> => {
    const response = await apiClient.post<DeliveryOrder>(`/delivery-orders/${id}/cancel`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/delivery-orders/${id}`);
  },
};


