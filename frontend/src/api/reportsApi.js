import { get } from './client';

export const getLowStock = () => get('/reports/low-stock');
