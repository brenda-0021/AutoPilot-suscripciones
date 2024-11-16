import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/AutoPilot.png";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function FormsLR() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError("Failed to log in: " + error.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.register(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError("Failed to register: " + error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await auth.loginWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      setError("Failed to sign in with Google: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-purpura via-vino to-purpura p-4">
      <img
        src={Logo}
        alt="Logo"
        className="absolute opacity-50 top-auto h-2/3 ml-96 transform transition-all duration-300 scale-100 hover:scale-[1.05]"
      />

      <div className="w-full md:w-1/2 max-w-md mr-96 backdrop-blur-lg bg-white/10 rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300 scale-100 hover:scale-[1.05]">
        <div className="text-center p-6">
          <h2 className="text-3xl font-bold text-white mb-2 mt-2">AutoPilot</h2>
          <p className="text-white/70">Manage your subscriptions with ease</p>
        </div>
        <div className="p-6">
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 text-white text-center text-lg font-semibold transition-all duration-300 ${
                activeTab === "login"
                  ? "border-b-4 border-rosa"
                  : "opacity-60 hover:opacity-80"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 text-white text-center text-lg font-semibold transition-all duration-300 ${
                activeTab === "register"
                  ? "border-b-4 border-rosa"
                  : "opacity-60 hover:opacity-80"
              }`}
            >
              Register
            </button>
          </div>
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 pl-10 rounded-full bg-grisClaro/20 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-rosa transition-all duration-300"
                  required
                />
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-10 pr-10 rounded-full bg-grisClaro/20 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-rosa transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full p-3 rounded-full bg-rosa hover:bg-vino text-white transition-colors duration-300 font-semibold text-lg disabled:opacity-50 shadow-black shadow-sm"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          )}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 pl-10 rounded-full bg-grisClaro/20 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-rosa transition-all duration-300"
                  required
                />
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-10 pr-10 rounded-full bg-grisClaro/20 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-rosa transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full p-3 rounded-full bg-rosa hover:bg-vino text-white transition-colors duration-300 font-semibold text-lg disabled:opacity-50 shadow-black shadow-sm"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}
          {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="px-2 text-white/50">Or</span>
              </div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mt-4 p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-300 flex items-center justify-center font-semibold disabled:opacity-50"
            >
              <FcGoogle className="mr-2 h-5 w-5" /> Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
