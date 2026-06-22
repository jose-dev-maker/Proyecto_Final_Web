import { post, get, patch } from './client';

export const create       = (items)        => post('/orders', { items });
export const getById      = (id)           => get(`/orders/${id}`);
export const updateStatus = (id, status)   => patch(`/orders/${id}/status`, { status });
