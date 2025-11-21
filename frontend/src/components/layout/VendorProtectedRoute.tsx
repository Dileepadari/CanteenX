import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';

const VendorProtectedRoute = () => {
    const { user } = useUserStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'vendor') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default VendorProtectedRoute;
