import { Role, OrderStatus } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface RegisterDTO {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateProductDTO {
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  price: number;
  categoryId: number;
}

export interface UpdateProductDTO {
  name?: string;
  sku?: string;
  stock?: number;
  minStock?: number;
  price?: number;
  categoryId?: number;
}

export interface OrderItemDTO {
  productId: number;
  quantity: number;
}

export interface CreateOrderDTO {
  items: OrderItemDTO[];
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
