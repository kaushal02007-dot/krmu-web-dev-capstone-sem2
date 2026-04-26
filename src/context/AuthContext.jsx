import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: 1, email: "demo@trangmix.com", password: "demo123", name: "Demo User" },
  { id: 2, email: "test@trangmix.com", password: "test123", name: "Test User" },
];

const STORAGE_KEY = "trangmix_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Point 3 & 4: read persisted user on every startup
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    await new Promise((r) => setTimeout(r, 700));
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) throw new Error("Invalid email or password");
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser)); // persist
    return safeUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY); // clear on logout
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthContext;
