import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass w-full max-w-md rounded-3xl p-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-white/10" />
          <p className="text-lg font-semibold">Loading your workspace...</p>
          <p className="mt-2 text-sm text-slate-300">
            Please wait while we prepare your dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}