// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * guardián de rutas que protege las vistas según el rol del usuario
 * @param {React.ReactNode} children - el componente que se quiere renderizar
 * @param {string[]} allowedRoles - lista de roles permitidos 
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, rol, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
        <p className="text-white animate-pulse">Cargando sistema...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(rol)) {
    return <Navigate to={rol === "dueña" ? "/duena" : "/atendedor"} replace />;
  }

  return children;
}