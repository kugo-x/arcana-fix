import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, clearToken, getMe } from "../../lib/api";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "kandidat" | "perusahaan";
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  setUser: (u: UserProfile | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      try {
        const data = await getMe();
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          });
        } else {
          clearToken();
        }
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const signOut = async () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
