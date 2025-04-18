import Image from "next/image";

import CustomButton from "../Components/HomePage";

export default function Home() {
  return (
    <>
      <header className="w-full bg-blue-500 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold">Smart Canteen</h1>
        <p className="text-sm">Welcome to the Smart Canteen!</p>
      </header>

      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col space-y-4">
          <CustomButton label="Login for IIITH Student" color="blue" redirectUrl="login-pages/student" />
          <CustomButton label="Login for Canteen" color="blue" redirectUrl="login-pages/canteen"/>
          <CustomButton label="Login for Admin" color="blue" redirectUrl="login-pages/admin"/>
        </div>
      </main>
    </>
  );
}