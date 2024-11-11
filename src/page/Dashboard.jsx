import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purpura to-vino p-4">
      <div className="w-full max-w-md backdrop-blur-lg bg-white/10 rounded-lg shadow-xl overflow-hidden p-6">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="w-full p-3 rounded-lg bg-rosa hover:bg-vino text-white transition-colors duration-300 font-semibold text-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
