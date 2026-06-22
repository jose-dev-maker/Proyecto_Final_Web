import { get, post, put, del } from './client';

export const getAll = (categoryId) =>
  get('/products' + (categoryId ? `?categoryId=${categoryId}` : ''));

export const create = (data)       => post('/products', data);
export const update = (id, data)   => put(`/products/${id}`, data);
export const remove = (id)         => del(`/products/${id}`);
