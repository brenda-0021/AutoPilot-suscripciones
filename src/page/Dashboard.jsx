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
  writeBatch,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase.config";
import SubsModal from "./SubsModal";
import GoalModal from "./GoalModal";
import { checkForAlerts } from "../utils/alertUtils";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [isSubsModalOpen, setIsSubsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSubscription, setDeletingSubscription] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [savingsGoals, setSavingsGoals] = useState([]);
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

  const handleAddGoal = async (goal) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const newGoal = {
        ...goal,
        userId: user.uid,
        createdAt: new Date(),
      };

      const querySnapshot = await getDoc(
        query(
          collection(db, "savingsGoals"),
          where("userId", "==", user.uid),
          where("name", "==", goal.name)
        )
      );

      if (!querySnapshot.empty) {
        alert("Goal with the same name already exists!");
        return;
      }

      await addDoc(collection(db, "savingsGoals"), newGoal);
      setIsGoalModalOpen(false);
    } catch (error) {
      console.error("Error adding goal: ", error);
    }
  };

  const handleEditGoal = async (goal) => {
    try {
      const goalRef = doc(db, "savingsGoals", goal.id);
      await updateDoc(goalRef, goal);
      setSavingsGoals((prevGoals) =>
        prevGoals.map((g) => (g.id === goal.id ? goal : g))
      );
      setIsGoalModalOpen(false);
      setEditingGoal(null);
    } catch (error) {
      console.error("Error updating goal: ", error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteDoc(doc(db, "savingsGoals", goalId));
      setSavingsGoals((prevGoals) =>
        prevGoals.filter((goal) => goal.id !== goalId)
      );
    } catch (error) {
      console.error("Error deleting goal: ", error);
    }
  };

  const openGoalModal = () => {
    setIsGoalModalOpen(true);
  };

  const closeGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  onAuthStateChanged(auth, async (user) => {
    if (user) {
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
        const email = user.email;
        const firstName = email.split("@")[0];
        setUsername(firstName.charAt(0).toUpperCase() + firstName.slice(1));

        const subscriptionsQuery = query(
          collection(db, "subscriptions"),
          where("userId", "==", user.uid)
        );
        const unsubscribeSubscriptions = onSnapshot(
          subscriptionsQuery,
          (querySnapshot) => {
            const subscriptionsData = [];
            querySnapshot.forEach((doc) => {
              subscriptionsData.push({ id: doc.id, ...doc.data() });
            });
            setSubscriptions(subscriptionsData);
          }
        );

        const savingsGoalsQuery = query(
          collection(db, "savingsGoals"),
          where("userId", "==", user.uid)
        );
        const unsubscribeSavingsGoals = onSnapshot(
          savingsGoalsQuery,
          (querySnapshot) => {
            const savingsGoalsData = [];
            querySnapshot.forEach((doc) => {
              savingsGoalsData.push({ id: doc.id, ...doc.data() });
            });
            setSavingsGoals(savingsGoalsData);
          }
        );

        return () => {
          unsubscribeSubscriptions();
          unsubscribeSavingsGoals();
        };
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

      const subscriptionData = {
        ...formData,
        userId: user.uid,
        expenses: 0,
        createdAt: new Date(),
        paymentDate: new Date(formData.paymentDate).toISOString(),
      };

      await addDoc(collection(db, "subscriptions"), subscriptionData);
      setIsSubsModalOpen(false);
    } catch (error) {
      console.error("Error adding subscription: ", error);
    }
  };

  const handleEditSubscription = async (formData) => {
    try {
      if (!editingSubscription)
        throw new Error("No subscription selected for editing");

      const subscriptionRef = doc(db, "subscriptions", editingSubscription.id);
      await updateDoc(subscriptionRef, {
        ...formData,
        paymentDate: new Date(formData.paymentDate).toISOString(),
      });

      setIsSubsModalOpen(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error("Error updating subscription: ", error);
    }
  };

  const openDeleteModal = (subscription) => {
    setDeletingSubscription(subscription);
    setIsDeleteModalOpen(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const openEditModal = (subscription) => {
    setEditingSubscription(subscription);
    setIsSubsModalOpen(true);
  };

  const handleDeleteSubscription = async () => {
    try {
      if (!deletingSubscription) return;

      await deleteDoc(doc(db, "subscriptions", deletingSubscription.id));
      console.log("Subscription successfully deleted!");

      const subscriptionPrice = parseFloat(deletingSubscription.price || 0);
      if (isNaN(subscriptionPrice) || subscriptionPrice <= 0) {
        console.error("Invalid subscription price:", subscriptionPrice);
        return;
      }

      let remainingAmount = subscriptionPrice;
      const updatedGoals = savingsGoals.map((goal) => {
        if (remainingAmount <= 0) return goal;

        const amountToAdd = Math.min(remainingAmount, goal.target - goal.saved);
        remainingAmount -= amountToAdd;

        return {
          ...goal,
          saved: goal.saved + amountToAdd,
        };
      });

      console.log("Updated Goals: ", updatedGoals);

      const batch = writeBatch(db);
      updatedGoals.forEach((goal) => {
        const goalRef = doc(db, "savingsGoals", goal.id);
        batch.update(goalRef, { saved: goal.saved });
      });
      await batch.commit();

      console.log("Firebase updated successfully!");

      setSavingsGoals(updatedGoals);
    } catch (error) {
      console.error("Error deleting subscription: ", error);
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingSubscription(null);
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
              onClick={() => setIsSubsModalOpen(true)}
              className="px-4 py-4 bg-rosa text-white text-lg rounded-full hover:bg-vino transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg shadow-black/30"
            >
              Add Subscription <Plus className="ml-2 h-5 w-5" />
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
                        {new Date(sub.paymentDate).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
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
                          onClick={() => openDeleteModal(sub)}
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
                <div className="bg-vino/70 rounded-2xl p-4 ">
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
                <div className="bg-vino/70 rounded-2xl p-4  mt-4">
                  <h4 className="text-lg font-semibold mb-2">
                    Category Breakdown
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(categoryTotals).map(
                      ([category, amount]) => (
                        <div
                          key={category}
                          className="rounded-2xl p-4 hover:bg-rosa/50 overflow-hidden"
                          style={{
                            borderColor: getCategoryColor(category),
                            borderWidth: "2px",
                            borderLeftWidth: "8px",
                            borderStyle: "solid",
                          }}
                        >
                          <h5 className="font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                            {category}
                          </h5>
                          <p className="text-lg font-semibold truncate">
                            ${amount.toFixed(2)}/mo
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-vino/70 rounded-2xl p-4 ">
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
            className="bg-purpura/50 backdrop-blur-md p-6 rounded-lg shadow-lg shadow-black/50 mb-8"
          >
            <h3 className="text-xl font-bold text-white/50 mb-4">
              Saving Goals
            </h3>
            <button
              className="flex items-center justify-between px-4 w-44 py-2 mb-5 bg-rosa text-white rounded-full shadow-lg shadow-black/30 hover:bg-vino transition-all duration-200 transform hover:scale-105 appearance-none focus:outline-none focus:ring-2 focus:ring-vino"
              onClick={openGoalModal}
            >
              Add Goal
              <Plus className=" h-5 w-5" />
            </button>

            {savingsGoals.length === 0 ? (
              <p className="text-grisClaro text-sm">
                No savings goals yet. Start now!
              </p>
            ) : (
              <div className="space-y-4">
                {savingsGoals.map((goal) => (
                  <div key={goal.id} className="bg-vino/70 p-4 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        {goal.name}
                      </span>
                      <span className="text-sm font-medium text-white">
                        ${goal.saved.toFixed(2)} / ${goal.target.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-grisFuerte/50 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-rosa h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            (goal.saved / goal.target) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          className="text-sm text-rosa hover:underline"
                          onClick={() => openEditGoalModal(goal)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-sm text-rosa hover:underline"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alerts and Reminders */}
          <div
            ref={alertsRef}
            className="bg-purpura/50 backdrop-blur-md p-6 rounded-lg shadow-lg shadow-black/50 mb-8"
          >
            <h3 className="text-xl font-bold text-white/50 mb-4">
              Alerts and Reminders
            </h3>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between bg-vino/70 p-4 rounded-lg"
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
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-rosa/70 backdrop-blur-md p-6 rounded-2xl shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this subscription?</p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubscription}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      <SubsModal
        isOpen={isSubsModalOpen}
        onClose={() => {
          setIsSubsModalOpen(false);
          setEditingSubscription(null);
        }}
        onSubmit={
          editingSubscription ? handleEditSubscription : handleAddSubscription
        }
        initialData={editingSubscription}
      />
      {/* Add Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={closeGoalModal}
        onSave={editingGoal ? handleEditGoal : handleAddGoal}
        editingGoal={editingGoal}
      />
    </div>
  );
}
