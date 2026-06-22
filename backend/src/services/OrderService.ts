import prisma from '../prisma/client';
import { AppError } from '../types/AppError';
import { CreateOrderDTO, UpdateOrderStatusDTO } from '../types';

export class OrderService {
  async createOrder(operatorId: string, dto: CreateOrderDTO) {
    return prisma.$transaction(async (tx) => {
      const orderItemsData: {
        productId: number;
        quantity: number;
        priceAtOrder: number;
      }[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(
            `Producto con id ${item.productId} no encontrado`,
            404
          );
        }

        if (product.stock < item.quantity) {
          throw new AppError(
            `Stock insuficiente para el producto "${product.name}" (SKU: ${product.sku}). ` +
              `Stock disponible: ${product.stock}, cantidad solicitada: ${item.quantity}`,
            400
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: product.price,
        });
      }

      const order = await tx.order.create({
        data: {
          operatorId,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          operator: {
            select: { id: true, email: true, role: true },
          },
        },
      });

      return order;
    });
  }

  async getOrderById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { include: { category: true } } },
        },
        operator: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!order) {
      throw new AppError(`Pedido con id ${id} no encontrado`, 404);
    }

    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDTO) {
    const order = await this.getOrderById(id);

    if (order.status === dto.status) {
      throw new AppError(
        `El pedido ya se encuentra en estado ${dto.status}`,
        400
      );
    }

    if (order.status === 'CANCELLED') {
      throw new AppError('No se puede modificar un pedido cancelado', 400);
    }

    if (order.status === 'DISPATCHED' && dto.status === 'PENDING') {
      throw new AppError(
        'No se puede regresar un pedido despachado a pendiente',
        400
      );
    }

    return prisma.$transaction(async (tx) => {
      if (dto.status === 'CANCELLED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status: dto.status },
        include: {
          items: {
            include: { product: true },
          },
          operator: {
            select: { id: true, email: true, role: true },
          },
        },
      });
    });
  }
}
