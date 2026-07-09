import { createContext, useContext, useState, useEffect } from "react";
import { verificarPin } from "../api/auth.service";

const AuthContext = createContext(null);
const STORAGE_KEY = "sabores_carolina_session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recupera la sesión automáticamente al cargar la app
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSession(JSON.parse(raw));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  /**
   * Intenta iniciar sesión con el PIN provisto
   * @param {string} pin 
   */
  async function loginConPin(pin) {
    // Llama al servicio del backend
    const respuesta = await verificarPin(pin); 
    
    // Si la respuesta es exitosa, se guarda la sesión
    if (respuesta.success || respuesta.token) {
      const datosSesion = {
        nombre: respuesta.nombre,
        rol: respuesta.rol,
        token: respuesta.token
      };
      
      setSession(datosSesion);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(datosSesion));
      return datosSesion.rol; // Retorna el rol para manejar la redirección en la vista
    }
    throw new Error(respuesta.mensaje || "Error de autenticación");
  }

  function logout() {
    setSession(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  const value = {
    session,
    rol: session?.rol ?? null,
    isAuthenticated: !!session,
    loading,
    loginConPin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}