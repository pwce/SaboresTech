import { AuthProvider } from "./context/AuthContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { ToastProvider } from "./context/ToastContext";
import AppRoutes from "./routes/AppRoutes";
import './styles/index.css';

export default function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </ConfirmProvider>
    </AuthProvider>
  );
}