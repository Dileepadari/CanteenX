import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';

const ProtectedRoute = () => {
    const { user } = useUserStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
