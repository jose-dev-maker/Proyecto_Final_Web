import express from 'express';
import 'dotenv/config';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import reportRoutes from './routes/reportRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './types/AppError';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'StockFlow API v1.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      reports: '/api/reports',
    },
  });
});

app.all('*', (req, _res, next) => {
  next(new AppError(`Ruta ${req.originalUrl} no encontrada`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 StockFlow API corriendo en http://localhost:${PORT}`);
});

export default app;
