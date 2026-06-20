import { createContext, useContext } from "react";

const AuthContext = createContext(null);

// Add this export
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;