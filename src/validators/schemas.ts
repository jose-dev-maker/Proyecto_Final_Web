import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'El email no tiene un formato válido' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  role: z.enum(['ADMIN', 'OPERATOR']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'El email no tiene un formato válido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

export const createProductSchema = z.object({
  name: z.string().min(1, { message: 'El nombre del producto es requerido' }),
  sku: z.string().min(1, { message: 'El SKU es requerido' }),
  stock: z
    .number()
    .int()
    .nonnegative({ message: 'El stock no puede ser negativo' }),
  minStock: z
    .number()
    .int()
    .nonnegative({ message: 'El stock mínimo no puede ser negativo' }),
  price: z.number().positive({ message: 'El precio debe ser mayor a 0' }),
  categoryId: z
    .number()
    .int()
    .positive({ message: 'El categoryId debe ser un entero positivo' }),
});

export const updateProductSchema = createProductSchema.partial();

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z
          .number()
          .int()
          .positive({ message: 'El productId debe ser un entero positivo' }),
        quantity: z
          .number()
          .int()
          .positive({ message: 'La cantidad debe ser mayor a 0' }),
      })
    )
    .min(1, { message: 'El pedido debe contener al menos un producto' }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'DISPATCHED', 'CANCELLED'], {
    errorMap: () => ({
      message: 'El estado debe ser PENDING, DISPATCHED o CANCELLED',
    }),
  }),
});
