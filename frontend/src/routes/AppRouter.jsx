import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import AdminUsersPage from "../features/admin/AdminUsersPage";
import AdminResourcesPage from "../features/admin/AdminResourcesPage";
import ResourceDetails from "../features/admin/ResourceDetails";
import DashboardPage from "../features/auth/DashboardPage";
import LoginPage from "../features/auth/LoginPage";
import ManagerDashboard from "../features/auth/ManagerDashboard";
import OAuth2RedirectPage from "../features/auth/OAuth2RedirectPage";
import RegisterPage from "../features/auth/RegisterPage";
import StudentDashboard from "../features/auth/StudentDashboard";
import TechnicianDashboard from "../features/auth/TechnicianDashboard";
import NotificationsPage from "../features/notifications/NotificationsPage";
import TechnicianTicketsPage from "../features/tickets/TechnicianTicketsPage";
import TicketDetailPage from "../features/tickets/TicketDetailPage";
import ProtectedRoute from "./ProtectedRoute";

function HomeGate() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export default function AppRouter() {
  const { auth } = useAuth();
  const location = useLocation();
  const roles = auth?.roles || [];

  // Check if current route is technician hub
  const isTechnicianHub =
    location.pathname === "/dashboard/technician" ||
    location.pathname === "/technician/tickets";

  // Role-specific home routes
  // Specialized Priority Redirection
  function RoleBasedDashboard() {
    // 1st Priority: Functional Technician Hub (Core assigned work)
    if (roles.includes("TECHNICIAN")) {
      return <Navigate to="/dashboard/technician" replace />;
    }
    // 2nd Priority: Management and Approval
    if (roles.includes("ADMIN")) {
      return <Navigate to="/admin/users" replace />;
    }
    if (roles.includes("MANAGER")) {
      return <Navigate to="/dashboard/manager" replace />;
    }
    if (roles.includes("USER")) {
      return <Navigate to="/dashboard/student" replace />;
    }
    // Fallback for pending accounts
    return <DashboardPage />;
  }

  return (
    <>
      <Navbar />
      <main className={isTechnicianHub ? "" : "layout"}>
        <Routes>
          <Route path="/" element={<HomeGate />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/technician"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN", "MANAGER", "ADMIN"]}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/manager"
            element={
              <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/tickets"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN", "MANAGER", "ADMIN"]}>
                <TechnicianTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:ticketId"
            element={
              <ProtectedRoute
                allowedRoles={["TECHNICIAN", "MANAGER", "ADMIN", "USER"]}
              >
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ResourceDetails />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
