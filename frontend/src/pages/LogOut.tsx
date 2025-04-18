import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("accessToken");

    // Clear the access token cookie
    Cookies.remove("accessToken");
    // Optionally clear local storage or session storage
    localStorage.removeItem("accessToken");
    sessionStorage.clear();

    // Redirect to the login page
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;