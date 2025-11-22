import { apiClient } from './client';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  unitOfMeasure?: string;
  reorderPoint: number;
  stockLevels?: StockLevel[];
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  id: string;
  productId: string;
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
  };
  quantity: number;
  reservedQuantity: number;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  unitOfMeasure?: string;
  reorderPoint?: number;
  metadata?: Record<string, any>;
  initialStock?: {
    warehouseId: string;
    quantity: number;
  };
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  categoryId?: string;
  unitOfMeasure?: string;
  reorderPoint?: number;
  metadata?: Record<string, any>;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  warehouseId?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    try {
      // Clean up filters - only send defined values and omit false booleans
      const cleanParams: any = {};
      if (filters?.search) cleanParams.search = filters.search;
      if (filters?.categoryId) cleanParams.categoryId = filters.categoryId;
      if (filters?.warehouseId) cleanParams.warehouseId = filters.warehouseId;
      // Only send lowStockOnly if it's explicitly true
      if (filters?.lowStockOnly === true) {
        cleanParams.lowStockOnly = true;
      }
      if (filters?.page) cleanParams.page = filters.page;
      if (filters?.limit) cleanParams.limit = filters.limit;
      
      const response = await apiClient.get<ProductsResponse>('/products', {
        params: cleanParams,
      });
      // Ensure response has the expected structure
      if (!response.data || !Array.isArray(response.data.items)) {
        console.error('Invalid products response:', response.data);
        return {
          items: [],
          total: 0,
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          totalPages: 0,
        };
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  getBySku: async (sku: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/sku/${sku}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

