import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../types/AppError';

export const roleGuard = (allowedRoles: Role[]) => {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Acceso denegado. Se requiere uno de estos roles: ${allowedRoles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};
