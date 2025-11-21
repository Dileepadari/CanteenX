import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';

const AdminProtectedRoute = () => {
  const { user } = useUserStore();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminProtectedRoute;
