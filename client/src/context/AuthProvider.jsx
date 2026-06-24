import { useEffect, useState } from "react";
import API from "../services/api";
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const { data } = await API.get("/auth/me");
        const currentUser = data.user || data;
        setUser(currentUser);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });

    localStorage.setItem("token", data.token);
    setUser(data.user);

    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post("/auth/register", {
      name,
      email,
      password,
    });

    localStorage.setItem("token", data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const plan = user?.plan || "trial";
  const subscriptionStatus = user?.subscriptionStatus || "trial";
  const trialEndsAt = user?.trialEndsAt || null;

  const isTrialExpired =
    plan === "trial" &&
    trialEndsAt &&
    new Date(trialEndsAt) < new Date();

  const isTrial = plan === "trial" && !isTrialExpired;
  const isStarter =
    plan === "starter" && subscriptionStatus === "active";

  const isPro =
    plan === "pro" && subscriptionStatus === "active";

  const canUseFreeFeatures = isTrial || isStarter || isPro;
  const canUseProFeatures = isPro;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,

        login,
        register,
        logout,

        authLoading,

        plan,
        subscriptionStatus,
        trialEndsAt,

        isTrial,
        isTrialExpired,
        isStarter,
        isPro,

        canUseFreeFeatures,
        canUseProFeatures,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}