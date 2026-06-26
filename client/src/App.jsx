import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ContactsPage from "./pages/ContactsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import BookingSetupPage from "./pages/BookingSetupPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import BookingsPage from "./pages/BookingsPage";
import MemoryPage from "./pages/MemoryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPage from "./pages/SettingsPage";
import TasksPage from "./pages/TasksPage";
import PaymentSuccess from "./pages/PaymentSuccess";
function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
<Route
  path="/memory"
  element={
    <ProtectedRoute>
      <MemoryPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="/booking-setup"
          element={
            <ProtectedRoute>
              <BookingSetupPage />
            </ProtectedRoute>
          }
        />
<Route
  path="/contacts"
  element={
    <ProtectedRoute>
      <ContactsPage />
    </ProtectedRoute>
  }

  
/>

<Route
  path="/tasks"
  element={
    <ProtectedRoute>
      <TasksPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <ContactsPage />
            </ProtectedRoute>
          }
        />
        <Route
  path="/whatsapp"
  element={
    <ProtectedRoute>
      <WhatsAppPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
<Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/book/:slug" element={<PublicBookingPage />} />
      </Routes>
    </>
  );
}

export default App;