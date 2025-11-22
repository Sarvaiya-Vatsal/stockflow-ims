import { apiClient } from './client';

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDto {
  name: string;
  address?: string;
}

export interface UpdateWarehouseDto {
  name?: string;
  address?: string;
  isActive?: boolean;
}

export const warehousesApi = {
  getAll: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get<Warehouse[]>('/warehouses');
    return response.data;
  },

  getAllActive: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get<Warehouse[]>('/warehouses/all');
    return response.data;
  },

  getById: async (id: string): Promise<Warehouse> => {
    const response = await apiClient.get<Warehouse>(`/warehouses/${id}`);
    return response.data;
  },

  create: async (data: CreateWarehouseDto): Promise<Warehouse> => {
    const response = await apiClient.post<Warehouse>('/warehouses', data);
    return response.data;
  },

  update: async (id: string, data: UpdateWarehouseDto): Promise<Warehouse> => {
    const response = await apiClient.patch<Warehouse>(`/warehouses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/warehouses/${id}`);
  },
};


