import { post } from './client';

export const login    = (email, password)              => post('/auth/login',    { email, password });
export const register = (email, password, role = 'OPERATOR') => post('/auth/register', { email, password, role });
