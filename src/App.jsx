import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import FormsLR from "./page/FormsLR";
import Dashboard from "./page/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return user ? children : <Navigate to="/" />;
}

function AuthenticatedApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormsLR />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
