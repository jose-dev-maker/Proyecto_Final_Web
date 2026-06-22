import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { AppError } from '../types/AppError';
import { RegisterDTO, LoginDTO } from '../types';

export class AuthService {
  async register(dto: RegisterDTO) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new AppError('El email ya está registrado', 409);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role ?? 'OPERATOR',
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(dto: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '24h' } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}
