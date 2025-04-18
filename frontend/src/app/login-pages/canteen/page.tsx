"use client";

import LoginForm from "../../../Components/LoginPage";

const CanteenLogin = () => {
    const handleLogin = (formData) => {
        console.log("Canteen Login Data:", formData);
        // Add canteen login logic here
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Canteen Login</h1>
                <LoginForm title="" onSubmit={handleLogin} />
            </div>
        </div>
    );
};

export default CanteenLogin;