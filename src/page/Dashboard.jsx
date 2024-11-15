import { useEffect, useState } from "react";
import Logo from "../assets/AutoPilot.png";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  Calendar,
  DollarSign,
  Filter,
  LogOutIcon,
  PieChart,
  Plus,
  Settings,
} from "lucide-react";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const email = user.email;
      const firstName = email.split("@")[0];
      setUsername(firstName.charAt(0).toUpperCase() + firstName.slice(1));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purpura via-vino to-purpura text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-purpura/30 backdrop-blur-md border-r border-rosa/20">
        <div className="p-5">
          <div className="flex items-center space-x-4">
            <img
              src={Logo}
              alt="Logo"
              className="h-12 w-12 transform transition-all duration-300 scale-100 hover:scale-[1.05]"
            />
            <h1 className="text-3xl font-bold text-white transform transition-all duration-300 scale-100 hover:scale-[1.05]">
              AutoPilot
            </h1>
          </div>
          <p className="text-md text-white/50 font-bold text-center">
            Subscription Manager
          </p>
        </div>
        {/* Navigation */}
        <nav className="mt-9 flex flex-col h-auto">
          <a
            href="#dashboard"
            className="flex items-center px-6 py-5 text-white bg-vino/30 border-l-4 border-rosa"
          >
            <PieChart className="mr-3 h-5 w-5" />
            Dashboard
          </a>
          <a
            href="#subscriptions"
            className="flex items-center px-6 py-5 text-white hover:bg-vino/20 hover:text-rosa transition-all duration-200"
          >
            <Calendar className="mr-3 h-5 w-5" />
            Subscriptions
          </a>
          <a
            href="#goals"
            className="flex items-center px-6 py-5 text-white hover:bg-vino/20 hover:text-rosa transition-all duration-200"
          >
            <DollarSign className="mr-3 h-5 w-5" />
            Savings Goals
          </a>
          <a
            href="#alerts"
            className="flex items-center px-6 py-5 text-white hover:bg-vino/20 hover:text-rosa transition-all duration-200"
          >
            <Bell className="mr-3 h-5 w-5" />
            Alerts
          </a>
          <a
            href="#settings"
            className="flex items-center px-6 py-5 text-white hover:bg-vino/20 hover:text-rosa transition-all duration-200"
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </a>
          <a
            href="#logout"
            onClick={handleLogout}
            className="flex items-center px-6 py-5 text-white hover:bg-vino/20 hover:text-rosa transition-all duration-200 mt-60"
          >
            <LogOutIcon className="mr-3 h-5 w-5" />
            Log Out
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold">Welcome back, {username}!</h2>
            <button className="px-4 py-2 bg-rosa text-white rounded-md hover:bg-vino transition-all duration-200 transform hover:scale-105">
              <Plus className="inline-block mr-2 h-4 w-4" /> Add Subscription
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="p-4 bg-purpura/30 backdrop-blur-md rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  Total Monthly Cost
                </span>
                <DollarSign className="h-4 w-4 text-rosa" />
              </div>
              <div className="text-2xl font-bold text-rosa">$299.99</div>
              <p className="text-xs text-white">+2.1% from last month</p>
            </div>
            {/* Add more summary cards here */}
          </div>

          {/* Subscriptions List */}
          <div className="bg-purpura/30 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-bold text-rosa mb-4">
              Your Subscriptions
            </h3>
            <div className="flex justify-between mb-4">
              <input
                className="p-2 border rounded-md bg-grisFuerte/50 text-white placeholder-grisClaro/70 focus:outline-none focus:ring-2 focus:ring-rosa"
                placeholder="Search subscriptions..."
              />
              <button className="px-4 py-2 bg-vino/50 text-rosa rounded-md hover:bg-vino transition-all duration-200 transform hover:scale-105">
                <Filter className="inline-block mr-2 h-4 w-4" /> Filter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-grisClaro">
                    <th className="p-2">Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Cost</th>
                    <th className="p-2">Renewal Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-grisFuerte/30">
                    <td className="p-2 text-white">Netflix</td>
                    <td className="p-2 text-white">Entertainment</td>
                    <td className="p-2 text-white">$14.99</td>
                    <td className="p-2 text-white">May 15, 2023</td>
                  </tr>
                  {/* Add more subscription rows here */}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts placeholder */}
          <div className="bg-purpura/30 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-bold text-rosa mb-4">
              Spending Overview
            </h3>
            <div className="h-64 bg-grisFuerte/50 rounded-md flex items-center justify-center text-white">
              [Chart placeholder]
            </div>
          </div>

          {/* Savings Goals */}
          <div className="bg-purpura/30 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-bold text-rosa mb-4">Savings Goals</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-white">
                    Reduce entertainment costs
                  </span>
                  <span className="text-sm font-medium text-white">75%</span>
                </div>
                <div className="w-full bg-grisFuerte/50 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-rosa to-vino h-2.5 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              {/* Add more savings goals here */}
            </div>
          </div>

          {/* Alerts and Reminders */}
          <div className="bg-purpura/30 backdrop-blur-md p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-rosa mb-4">
              Alerts and Reminders
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-rosa" />
                <span className="text-white">Netflix renewal in 3 days</span>
              </div>
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-rosa" />
                <span className="text-white">
                  Gym membership payment due tomorrow
                </span>
              </div>
              <hr className="border-grisFuerte/30" />
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">
                  Notification Settings
                </span>
                <button className="px-4 py-2 bg-vino/50 text-rosa rounded-md hover:bg-vino transition-all duration-200 transform hover:scale-105">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
