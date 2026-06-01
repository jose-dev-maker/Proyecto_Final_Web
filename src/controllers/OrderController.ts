import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { OrderService } from '../services/OrderService';

const orderService = new OrderService();

export class OrderController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const operatorId = req.user!.id;
      const order = await orderService.createOrder(operatorId, req.body);
      res.status(201).json({
        success: true,
        message: 'Pedido creado exitosamente',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const order = await orderService.getOrderById(id);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);
      const order = await orderService.updateStatus(id, req.body);
      res.status(200).json({
        success: true,
        message: `Estado del pedido actualizado a ${req.body.status}`,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}
