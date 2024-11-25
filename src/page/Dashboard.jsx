import { useEffect, useState, useRef, useMemo } from "react";
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
  Film,
  ShoppingBag,
  Zap,
  BookOpen,
  Heart,
  Utensils,
  Plane,
  Smartphone,
  HelpCircle,
  Pencil,
  X,
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
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase.config";
import SubsModal from "./SubsModal";
import { checkForAlerts } from "../utils/alertUtils";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeSection, setActiveSection] = useState("subscriptions");
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [annualTotal, setAnnualTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
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

  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) {
      setAlerts([]);
      return;
    }
    const newAlerts = checkForAlerts(subscriptions);
    setAlerts(newAlerts);
    setUnreadAlerts(newAlerts.length);
  }, [subscriptions]);

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

      const paymentDate = new Date(formData.paymentDate);

      if (isNaN(paymentDate.getTime())) {
        throw new Error("Invalid paymentDate provided");
      }

      await addDoc(collection(db, "subscriptions"), {
        ...formData,
        paymentDate,
        userId: user.uid,
        expenses: 0,
        createdAt: new Date(),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding subscription: ", error);
    }
  };

  const handleEditSubscription = async (formData) => {
    try {
      if (!editingSubscription)
        throw new Error("No subscription selected for editing");

      const subscriptionRef = doc(db, "subscriptions", editingSubscription.id);
      await updateDoc(subscriptionRef, formData);
      setIsModalOpen(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error("Error updating subscription: ", error);
    }
  };

  const openEditModal = (subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
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

  const calculateExpenses = useMemo(() => {
    let monthly = 0;
    let annual = 0;
    let catTotals = {};

    subscriptions.forEach((sub) => {
      let monthlyAmount = 0;
      switch (sub.cycle.toLowerCase()) {
        case "monthly":
          monthlyAmount = parseFloat(sub.price);
          break;
        case "annually":
          monthlyAmount = parseFloat(sub.price) / 12;
          break;
        case "weekly":
          monthlyAmount = parseFloat(sub.price) * 4;
          break;
        // Add more cases for other cycles if needed
      }

      monthly += monthlyAmount;
      annual += monthlyAmount * 12;

      if (catTotals[sub.category]) {
        catTotals[sub.category] += monthlyAmount;
      } else {
        catTotals[sub.category] = monthlyAmount;
      }
    });

    setMonthlyTotal(monthly);
    setAnnualTotal(annual);
    setCategoryTotals(catTotals);
  }, [subscriptions]);

  useEffect(() => {
    calculateExpenses;
  }, [calculateExpenses]);

  const renderPieChart = () => {
    const total = Object.values(categoryTotals).reduce(
      (sum, value) => sum + value,
      0
    );
    let startAngle = 0;

    return (
      <div className="flex flex-col items-center">
        {/* Gráfico circular */}
        <svg
          viewBox="0 0 100 100"
          className="w-64 h-64 transform transition-all duration-300 scale-100 hover:scale-[1.1]"
        >
          {Object.entries(categoryTotals).map(([category, amount]) => {
            const percentage = (amount / total) * 100;
            const endAngle = startAngle + (percentage / 100) * 360;

            const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

            const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${
              percentage > 50 ? 1 : 0
            } 1 ${x2} ${y2} Z`;

            startAngle = endAngle;

            return (
              <path key={category} d={path} fill={getCategoryColor(category)} />
            );
          })}
        </svg>

        {/* Leyenda */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {Object.keys(categoryTotals).map((category) => (
            <div key={category} className="flex items-center">
              <span
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: getCategoryColor(category) }}
              ></span>
              <span className="text-sm font-medium">{category}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      Entertainment: "#722548", // rosa
      Sports: "#775E88", // lila
      Shopping: "#221932", // purpura
      Utilities: "#282F32", // grisFuerte
      Education: "#4D474F", // grisClaro
      "Health & Fitness": "#6E2A3C", // tono más claro de rosa
      "Food & Drink": "#87455C", // variante de vino
      Travel: "#5A3A58", // mezcla de purpura y gris
      Technology: "#3F2B4B", // tono oscuro lila/purpura
      Other: "#282F32", // grisFuerte para casos generales
    };
    return colors[category] || "#808080";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Entertainment: Film,
      Sports: Calendar,
      Shopping: ShoppingBag,
      Utilities: Zap,
      Education: BookOpen,
      "Health & Fitness": Heart,
      "Food & Drink": Utensils,
      Travel: Plane,
      Technology: Smartphone,
      Other: HelpCircle,
    };
    const IconComponent = icons[category] || HelpCircle;
    return (
      <IconComponent
        className="w-5 h-5"
        style={{ color: getCategoryColor(category) }}
      />
    );
  };

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

  const markAlertAsRead = (alertId) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
    setUnreadAlerts((prevUnread) => Math.max(0, prevUnread - 1));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purpura via-vino to-purpura text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-purpura/50 backdrop-blur-md border-r border-rosa/50 flex flex-col shadow-lg shadow-black/30">
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
          <p className="text-md text-rosa font-bold text-center">
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
            <div className="relative flex items-center">
              <Bell className="mr-3 h-5 w-5" />
              Alerts
              {unreadAlerts > 0 && (
                <span className="absolute -right-28 bg-rosa text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-full">
                  {unreadAlerts}
                </span>
              )}
            </div>
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
            <h2 className="text-4xl font-bold transform transition-all duration-300 scale-100 hover:scale-[1.05] ml-16">
              Welcome back, {username}!
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-4 bg-rosa text-white text-lg rounded-full hover:bg-vino transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg shadow-black/30"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Subscription
            </button>
          </div>

          {/* Subscriptions List */}
          <div
            ref={subscriptionsRef}
            className="bg-purpura/50 backdrop-blur-md p-6 rounded-lg shadow-lg shadow-black/50 mb-8"
          >
            <h3 className="text-xl font-bold text-white/50 mb-4">
              Your Subscriptions
            </h3>
            <div className="flex justify-between mb-4">
              <div className="relative w-full max-w-fit">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-4 py-2 pr-10 bg-rosa text-white rounded-full shadow-lg shadow-black/30 hover:bg-vino transition-all duration-200 transform hover:scale-105 appearance-none focus:outline-none focus:ring-2 focus:ring-vino w-full"
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
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="border-t border-rosa">
                      <td className="p-2 text-white">{sub.platformName}</td>
                      <td className="p-2 text-white">
                        <div className="flex items-center">
                          <div className="bg-white/50 p-1.5 rounded-full">
                            {getCategoryIcon(sub.category)}
                          </div>
                          <span className="ml-2">{sub.category}</span>
                        </div>
                      </td>
                      <td className="p-2 text-white">${sub.price}</td>
                      <td className="p-2 text-white">{sub.cycle}</td>
                      <td className="p-2 text-white">
                        {new Date(sub.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="p-2 flex space-x-8">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="text-blue-900 hover:text-white transition-colors duration-200"
                          aria-label="Edit subscription"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(sub.id)}
                          className="text-red-900 hover:text-white transition-colors duration-200"
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

          {/* Spending Overview */}
          <div
            ref={spendingOverviewRef}
            className="bg-purpura/50 backdrop-blur-md p-6 rounded-lg shadow-lg shadow-black/50 mb-8"
          >
            <h3 className="text-xl font-bold text-white/50 mb-4">
              Spending Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="bg-vino rounded-2xl p-4 ">
                  <h4 className="text-lg font-semibold mb-2 border-b-2 border-rosa">
                    Monthly Expenses
                  </h4>
                  <p className="text-2xl font-bold">
                    ${monthlyTotal.toFixed(2)}
                  </p>
                  <h4 className="text-lg font-semibold mt-5 mb-2 border-b-2 border-rosa">
                    Annual Projection
                  </h4>
                  <p className="text-2xl font-bold">
                    ${annualTotal.toFixed(2)}
                  </p>
                </div>
                <div className="bg-vino rounded-2xl p-4  mt-4">
                  <h4 className="text-lg font-semibold mb-2">
                    Category Breakdown
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(categoryTotals).map(
                      ([category, amount]) => (
                        <div
                          key={category}
                          className="rounded-2xl p-4 hover:bg-rosa/50"
                          style={{
                            borderColor: getCategoryColor(category),
                            borderWidth: "2px",
                            borderLeftWidth: "8px",
                            borderStyle: "solid",
                          }}
                        >
                          <h5 className="font-medium">{category}</h5>
                          <p className="text-lg font-semibold">
                            ${amount.toFixed(2)}/mo
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-vino rounded-2xl p-4 ">
                <h4 className="text-lg font-semibold mb-2">
                  Expense Distribution
                </h4>
                <div className="h-48">{renderPieChart()}</div>
              </div>
            </div>
          </div>

          {/* Savings Goals */}
          <div
            ref={savingsGoalsRef}
            className="bg-purpura/50 backdrop-blur-md p-6 rounded-lg shadow-lg shadow-black/50 mb-8 "
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
            className="bg-purpura/50 backdrop-blur-md p-6 rounded-lg shadow-lg shadow-black/50 mb-8"
          >
            <h3 className="text-xl font-bold text-rosa mb-4">
              Alerts and Reminders
            </h3>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between bg-vino/50 p-4 rounded-lg"
                >
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-rosa" />
                    <span className="text-white">{alert.message}</span>
                  </div>
                  <button
                    onClick={() => markAlertAsRead(alert.id)}
                    className="text-rosa hover:text-white transition-colors duration-200"
                    aria-label="Dismiss alert"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-white">No current alerts or reminders.</p>
              )}
            </div>
          </div>

          {/* Settings */}
          <div
            ref={settingsRef}
            className="bg-purpura/50 backdrop-blur-md p-6 rounded-lg shadow-lg shadow-black/50 mb-8"
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubscription(null);
        }}
        onSubmit={
          editingSubscription ? handleEditSubscription : handleAddSubscription
        }
        initialData={editingSubscription}
      />
    </div>
  );
}
