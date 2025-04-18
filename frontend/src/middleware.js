import Cookies from "js-cookie";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useAuthMiddleware = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    const publicPaths = ["/login"];
    const pathIsPublic = publicPaths.includes(location.pathname);

    if (!token && !pathIsPublic) {
      navigate("/login");
    }
  }, [location, navigate]);

  return null;
};

export default useAuthMiddleware;
