import { useEffect, useState, useRef } from "react";
import Logo from "../assets/AutoPilot.png";
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
  Trash2,
} from "lucide-react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase.config";
import SubsModal from "./SubsModal";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeSection, setActiveSection] = useState("subscriptions");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();
  const subscriptionsRef = useRef(null);
  const spendingOverviewRef = useRef(null);
  const savingsGoalsRef = useRef(null);
  const alertsRef = useRef(null);
  const settingsRef = useRef(null);
  const mainContentRef = useRef(null);
  const categories = [
    "All",
    "Entertainment",
    "Sports",
    "Shopping",
    "Utilities",
    "Education",
    "Health & Fitness",
    "Food & Drink",
    "Travel",
    "Technology",
    "Other",
  ];

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("User is signed in:", user);
      try {
        const docRef = doc(db, "collection", "documentId");
        const docSnap = await getDoc(docRef);
        console.log("Document data:", docSnap.data());
      } catch (error) {
        console.error("Error fetching document:", error.message);
      }
    } else {
      console.log("No user signed in");
    }
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is signed in:", user);

        const email = user.email;
        const firstName = email.split("@")[0];
        setUsername(firstName.charAt(0).toUpperCase() + firstName.slice(1));

        const q = query(
          collection(db, "subscriptions"),
          where("userId", "==", user.uid)
        );
        const unsubscribeSubscriptions = onSnapshot(q, (querySnapshot) => {
          const subscriptionsData = [];
          querySnapshot.forEach((doc) => {
            subscriptionsData.push({ id: doc.id, ...doc.data() });
          });
          setSubscriptions(subscriptionsData);
        });

        return () => unsubscribeSubscriptions();
      } else {
        console.log("No user signed in");
        navigate("/");
      }
    });

    return () => unsubscribeAuth();
  }, [auth, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleAddSubscription = async (formData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      await addDoc(collection(db, "subscriptions"), {
        ...formData,
        userId: user.uid,
        expenses: 0,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding subscription: ", error);
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    try {
      await deleteDoc(doc(db, "subscriptions", subscriptionId));
      console.log("Subscription successfully deleted!");
    } catch (error) {
      console.error("Error deleting subscription: ", error);
    }
  };

  const handleFilterChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredSubscriptions = subscriptions.filter(
    (sub) => selectedCategory === "All" || sub.category === selectedCategory
  );

  const scrollToSection = (elementRef, section) => {
    if (elementRef.current && mainContentRef.current) {
      const yOffset = -20;
      const y =
        elementRef.current.getBoundingClientRect().top +
        mainContentRef.current.scrollTop +
        yOffset;
      mainContentRef.current.scrollTo({ top: y, behavior: "smooth" });
    }
    setActiveSection(section);
  };

  const navButtonClass = (section) =>
    `flex items-center px-6 py-5 text-white transition-all duration-200 ${
      activeSection === section
        ? "bg-vino text-rosa border-l-4 border-rosa ml-2"
        : "hover:bg-vino/20 hover:text-rosa"
    }`;

  return (
    <div className="flex h-screen bg-gradient-to-br from-purpura via-vino to-purpura text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-purpura/30 backdrop-blur-md border-r border-rosa/20 flex flex-col">
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
        <nav className="mt-9 flex flex-col flex-grow">
          <button
            onClick={() => scrollToSection(subscriptionsRef, "subscriptions")}
            className={navButtonClass("subscriptions")}
          >
            <Calendar className="mr-3 h-5 w-5" />
            Subscriptions
          </button>
          <button
            onClick={() => scrollToSection(spendingOverviewRef, "spending")}
            className={navButtonClass("spending")}
          >
            <PieChart className="mr-3 h-5 w-5" />
            Spending Overview
          </button>
          <button
            onClick={() => scrollToSection(savingsGoalsRef, "savings")}
            className={navButtonClass("savings")}
          >
            <DollarSign className="mr-3 h-5 w-5" />
            Savings Goals
          </button>
          <button
            onClick={() => scrollToSection(alertsRef, "alerts")}
            className={navButtonClass("alerts")}
          >
            <Bell className="mr-3 h-5 w-5" />
            Alerts
          </button>
          <button
            onClick={() => scrollToSection(settingsRef, "settings")}
            className={navButtonClass("settings")}
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-5 text-white hover:bg-vino/20 hover:text-rosa transition-all duration-200 mt-auto"
          >
            <LogOutIcon className="mr-3 h-5 w-5" />
            Log Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main ref={mainContentRef} className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8 pt-10 pb-10">
            <h2 className="text-4xl font-bold transform transition-all duration-300 scale-100 hover:scale-[1.05]">
              Welcome back, {username}!
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-4 bg-rosa text-white text-lg rounded-full hover:bg-vino transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Subscription
            </button>
          </div>

          {/* Subscriptions List */}
          <div
            ref={subscriptionsRef}
            className="bg-purpura/30 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8"
          >
            <h3 className="text-xl font-bold text-white/50 mb-4">
              Your Subscriptions
            </h3>
            <div className="flex justify-between mb-4">
              <div className="relative w-full max-w-fit">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-4 py-2 pr-10 bg-rosa text-white rounded-full hover:bg-vino transition-all duration-200 transform hover:scale-105 appearance-none focus:outline-none focus:ring-2 focus:ring-vino w-full"
                >
                  <option value="" disabled>
                    Filter
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <Filter className="text-white absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-rosa text-lg">
                    <th className="p-2">Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Cost</th>
                    <th className="p-2">Cycle</th>
                    <th className="p-2">Next Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="border-t border-rosa">
                      <td className="p-2 text-white">{sub.platformName}</td>
                      <td className="p-2 text-white">{sub.category}</td>
                      <td className="p-2 text-white">${sub.price}</td>
                      <td className="p-2 text-white">{sub.cycle}</td>
                      <td className="p-2 text-white">
                        {new Date(sub.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDeleteSubscription(sub.id)}
                          className="text-rosa hover:text-white transition-colors duration-200"
                          aria-label="Delete subscription"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts placeholder */}
          <div
            ref={spendingOverviewRef}
            className="bg-purpura/30 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8"
          >
            <h3 className="text-xl font-bold text-rosa mb-4">
              Spending Overview
            </h3>
            <div className="h-64 bg-grisFuerte/50 rounded-md flex items-center justify-center text-white">
              [Chart placeholder]
            </div>
          </div>

          {/* Savings Goals */}
          <div
            ref={savingsGoalsRef}
            className="bg-purpura/30 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8 "
          >
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
          <div
            ref={alertsRef}
            className="bg-purpura/30 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8"
          >
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
          <div
            ref={settingsRef}
            className="bg-purpura/30 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8"
          >
            <h3 className="text-xl font-bold text-rosa mb-4">Settings</h3>
            {/* Add your settings content here */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">Account Settings</span>
                <button className="px-4 py-2 bg-vino/50 text-rosa rounded-md hover:bg-vino transition-all duration-200 transform hover:scale-105">
                  Edit
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">Notifications</span>
                <button className="px-4 py-2 bg-vino/50 text-rosa rounded-md hover:bg-vino transition-all duration-200 transform hover:scale-105">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Subscription Modal */}
      <SubsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubscription}
      />
    </div>
  );
}
