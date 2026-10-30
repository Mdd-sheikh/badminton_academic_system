import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logged out successfully.", { toastId: "logout" });
        navigate("/login", { replace: true });
    }, [navigate]);

    return null;
}