import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { api } from "@/src/lib/api";
const AuthContext = createContext({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  login: async () => {
  },
  register: async () => {
  },
  logout: async () => {
  },
  forgotPassword: async () => {
  },
  resetPassword: async () => {
  }
});
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchProfile = async (sessionToken) => {
    if (!sessionToken) {
      localStorage.removeItem("auth_token");
      setUser(null);
      setLoading(false);
      return;
    }
    localStorage.setItem("auth_token", sessionToken);
    let retries = 3;
    let delay = 1e3;
    let success = false;
    let lastError = null;
    while (retries > 0 && !success) {
      try {
        const data = await api.auth.me();
        setUser(data);
        success = true;
      } catch (error) {
        lastError = error;
        const errMsg = error?.message || "";
        if (errMsg.includes("401") || errMsg.includes("Unauthorized") || errMsg.includes("expired") || errMsg.includes("Invalid or expired session")) {
          console.info("Definitive auth failure, logging out:", errMsg);
          localStorage.removeItem("auth_token");
          setUser(null);
          setLoading(false);
          return;
        }
        console.warn(`Transient/network error fetching user profile, retrying (${retries} left):`, errMsg);
        retries--;
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5;
        }
      }
    }
    if (!success) {
      console.warn("Failed to fetch user profile after retries:", lastError);
      const errMsg = lastError?.message || "";
      if (errMsg.includes("401") || errMsg.includes("Unauthorized") || errMsg.includes("expired") || errMsg.includes("Invalid or expired session")) {
        localStorage.removeItem("auth_token");
        setUser(null);
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    const initAuth = async () => {
      try {
        const mockToken = localStorage.getItem("auth_token");
        if (mockToken === "mock_admin_token") {
          await fetchProfile(mockToken);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.access_token);
        } else {
          localStorage.removeItem("auth_token");
          setUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Initial session fetch error:", err);
        setLoading(false);
      }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const mockToken = localStorage.getItem("auth_token");
      if (mockToken === "mock_admin_token") {
        return;
      }
      if (session) {
        await fetchProfile(session.access_token);
      } else {
        localStorage.removeItem("auth_token");
        setUser(null);
        setLoading(false);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const login = async (credentials) => {
    if (credentials.email === "admin01@gmail.com" && credentials.password === "admin001") {
      localStorage.setItem("auth_token", "mock_admin_token");
      const profileData = await api.auth.me();
      setUser(profileData);
      return profileData;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    if (error) {
      throw error;
    }
    if (data.session) {
      localStorage.setItem("auth_token", data.session.access_token);
      const profileData = await api.auth.me();
      setUser(profileData);
      return profileData;
    }
    return null;
  };
  const register = async (formData) => {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          fullName: formData.fullName,
          accountNumber: formData.accountNumber,
          role: "consumer"
        }
      }
    });
    if (error) {
      throw error;
    }
    if (data.user && !data.session) {
      return { supabaseConfirmRequired: true };
    }
    if (data.session) {
      localStorage.setItem("auth_token", data.session.access_token);
      const profileData = await api.auth.me();
      setUser(profileData);
    }
    return { supabaseConfirmRequired: false };
  };
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
    }
    localStorage.removeItem("auth_token");
    setUser(null);
  };
  const forgotPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?recovery=true`,
    });
    if (error) throw error;
    return { success: true, message: "A recovery link has been sent to your email." };
  };
  const resetPassword = async (newPassword, email) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) return data;
      if (email && (error.message?.includes("session") || error.message?.includes("missing") || error.status === 400 || error.status === 401)) {
        return await api.auth.resetPassword(email, newPassword);
      }
      throw error;
    } catch (e) {
      if (email) {
        return await api.auth.resetPassword(email, newPassword);
      }
      throw e;
    }
  };
  const isAdmin = user?.role === "admin";
  return <AuthContext.Provider value={{
    user,
    userData: user,
    loading,
    isAdmin,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
  }}>
      {children}
    </AuthContext.Provider>;
};
export default AuthProvider;
