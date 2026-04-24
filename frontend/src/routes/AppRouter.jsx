import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import AdminUsersPage from "../features/admin/AdminUsersPage";
import AdminResourcesPage from "../features/admin/AdminResourcesPage";
import AdminBookingsPage from "../features/admin/AdminBookingsPage";
import AdminTicketsPage from "../features/admin/AdminTicketsPage";
import ResourceDetails from "../features/admin/ResourceDetails";
import DashboardPage from "../features/auth/DashboardPage";
import LoginPage from "../features/auth/LoginPage";
import ManagerDashboard from "../features/auth/ManagerDashboard";
import OAuth2RedirectPage from "../features/auth/OAuth2RedirectPage";
import RegisterPage from "../features/auth/RegisterPage";
import StudentDashboard from "../features/auth/StudentDashboard";
import TechnicianDashboard from "../features/auth/TechnicianDashboard";
import UserBookingsPage from "../features/user/UserBookingsPage";
import UserTicketsPage from "../features/user/UserTicketsPage";
import BookingDetailsPage from "../features/user/BookingDetailsPage";
import CheckInPage from "../features/user/CheckInPage";
import HomePage from "../features/home/HomePage";
import ProtectedRoute from "./ProtectedRoute";

function HomeGate() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
}

export default function AppRouter() {
  const { auth } = useAuth();
  const roles = auth?.roles || [];

  // Role-specific home routes
  function RoleBasedDashboard() {
    if (roles.includes("ADMIN")) {
      return <Navigate to="/admin/users" replace />;
    }
    if (roles.includes("MANAGER")) {
      return <Navigate to="/dashboard/manager" replace />;
    }
    if (roles.includes("TECHNICIAN")) {
      return <Navigate to="/dashboard/technician" replace />;
    }
    if (roles.includes("USER")) {
      return <Navigate to="/dashboard/student" replace />;
    }
    return <DashboardPage />;
  }

  return (
    <>
      <Navbar />
      <main className="layout">
        <Routes>
          <Route path="/" element={<HomeGate />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
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
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminResourcesPage />
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
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student/bookings"
            element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                <UserBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student/tickets"
            element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                <UserTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:bookingId"
            element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                <BookingDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/check-in"
            element={
              <ProtectedRoute allowedRoles={["USER", "TECHNICIAN", "MANAGER", "ADMIN"]}>
                <CheckInPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
