import prisma from '../prisma/client';
import { AppError } from '../types/AppError';
import { CreateProductDTO, UpdateProductDTO } from '../types';

export class ProductService {
  async getAll(categoryId?: number) {
    return prisma.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new AppError(`Producto con id ${id} no encontrado`, 404);
    }

    return product;
  }

  async create(dto: CreateProductDTO) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new AppError(`El SKU '${dto.sku}' ya está en uso`, 409);
    }

    const category = await prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new AppError(`Categoría con id ${dto.categoryId} no encontrada`, 404);
    }

    return prisma.product.create({
      data: dto,
      include: { category: true },
    });
  }

  async update(id: number, dto: UpdateProductDTO) {
    await this.getById(id);

    if (dto.sku) {
      const existing = await prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      });
      if (existing) {
        throw new AppError(`El SKU '${dto.sku}' ya está en uso`, 409);
      }
    }

    return prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async delete(id: number) {
    await this.getById(id);

    await prisma.product.delete({ where: { id } });
  }

  async getLowStock() {
    const allProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: { stock: 'asc' },
    });

    return allProducts.filter((p) => p.stock <= p.minStock);
  }
}
