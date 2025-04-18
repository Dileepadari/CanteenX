"use client";

export default function CustomButton({ label, onClick, color = "blue", redirectUrl }) {
    const baseClasses = "px-6 py-2 text-white rounded-lg hover:brightness-110 transition";
    const colorClasses = {
      blue: "bg-blue-500 hover:bg-blue-600",
      green: "bg-green-500 hover:bg-green-600",
      red: "bg-red-500 hover:bg-red-600",
    };
    const handleClick = () => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (onClick) {
        onClick();
      }
    };
    
    return (
      <button onClick={handleClick} className={`${baseClasses} ${colorClasses[color]}`}>
        {label}
      </button>
    );
  }