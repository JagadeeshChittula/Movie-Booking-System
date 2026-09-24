import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  forgotPassword: (data) => client.post('/auth/forgot-password', data),
  resetPassword: (data) => client.post('/auth/reset-password', data),
};

export const movieApi = {
  getAll: (params) => client.get('/movies/all', { params }),
  getOne: (id) => client.get(`/movies/${id}`),
  add: (data) => client.post('/movies/add', data),
  update: (id, data) => client.put(`/movies/update/${id}`, data),
  remove: (id) => client.delete(`/movies/delete/${id}`),
};

export const theatreApi = {
  getAll: (params) => client.get('/theatres/all', { params }),
  getOne: (id) => client.get(`/theatres/${id}`),
  add: (data) => client.post('/theatres/add', data),
  update: (id, data) => client.put(`/theatres/${id}`, data),
  remove: (id) => client.delete(`/theatres/${id}`),
};

export const screenApi = {
  getAll: (params) => client.get('/screens/all', { params }),
  getByTheatre: (theatreId) => client.get(`/screens/theatre/${theatreId}`),
  getOne: (id) => client.get(`/screens/${id}`),
  add: (data) => client.post('/screens/add', data),
  update: (id, data) => client.put(`/screens/${id}`, data),
  remove: (id) => client.delete(`/screens/${id}`),
};

export const showApi = {
  getAll: (params) => client.get('/shows/all', { params }),
  getOne: (id) => client.get(`/shows/${id}`),
  getSeats: (showId) => client.get(`/shows/${showId}/seats`),
  add: (data) => client.post('/shows/add', data),
  update: (id, data) => client.put(`/shows/${id}`, data),
  remove: (id) => client.delete(`/shows/${id}`),
};

export const seatLockApi = {
  lock: (data) => client.post('/seat-lock/lock', data),
  release: (data) => client.post('/seat-lock/release', data),
  extend: (data) => client.post('/seat-lock/extend', data),
};

export const bookingApi = {
  create: (data) => client.post('/bookings/create', data),
  mine: () => client.get('/bookings/my-bookings'),
  getOne: (id) => client.get(`/bookings/${id}`),
  confirm: (id) => client.put(`/bookings/confirm/${id}`),
  cancel: (id) => client.put(`/bookings/cancel/${id}`),
  checkIn: (id) => client.put(`/bookings/check-in/${id}`),
  getAllAdmin: () => client.get('/bookings/admin/all'),
};

export const paymentApi = {
  create: (data) => client.post('/payments/create', data),
  success: (id) => client.put(`/payments/success/${id}`),
  failed: (id) => client.put(`/payments/failed/${id}`),
};

export const userApi = {
  profile: () => client.get('/users/profile'),
  changePassword: (data) => client.put('/users/change-password', data),
  getAll: () => client.get('/auth/all-users'),
  block: (id) => client.put(`/users/block/${id}`),
  unblock: (id) => client.put(`/users/unblock/${id}`),
};

export const dashboardApi = {
  stats: () => client.get('/dashboard/stats'),
};
