// "use client";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import api from "../lib/api";
// // import { useAuthContext } from "../context/AuthProvider";
// // import { AuthContext } from "../context/AuthProvider";

// // ❌ Incorrect: This would create a new context instead of using the existing one    
// // export const useAuth = () => useAuthContext();

// // Define the User type
// export interface User {
//   id: string;
//   email: string;
//   name?: string;
//   currency?: string;
// }

// // Define context value shape
// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (name: string, email: string, password: string) => Promise<void>;
//   logout: () => void;
// }

// // ✅ Initialize context with proper type or undefined
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   // On mount, check for token and fetch profile
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     api
//       .get("/auth/me")
//       .then((res) => setUser(res.data))
//       .catch(() => localStorage.removeItem("token"))
//       .finally(() => setLoading(false));
//   }, []);

//   const login = async (email: string, password: string) => {
//     const res = await api.post("/auth/login", { email, password });
//     localStorage.setItem("token", res.data.token);
//     setUser(res.data.user);
//   };

//   const signup = async (name: string, email: string, password: string) => {
//     const res = await api.post("/auth/signup", { name, email, password });
//     localStorage.setItem("token", res.data.token);
//     setUser(res.data.user);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ✅ Safe hook: throws if used outside provider
// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
// This is now just a forwarder for cleaner imports
export { useAuth } from "../context/AuthProvider";
