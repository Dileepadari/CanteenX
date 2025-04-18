"use client";

import LoginForm from "../../../Components/LoginPage";

const AdminLogin = () => {
    const handleLogin = (formData) => {
        console.log("Admin Login Data:", formData);
        // Add admin login logic here
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h1>
                <LoginForm title="" onSubmit={handleLogin} />
            </div>
        </div>
    );
};

export default AdminLogin;