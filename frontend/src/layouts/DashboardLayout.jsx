import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const MODULOS_DUENA = [
  { key: "jornada", label: "Jornada", icon: "☀️" },
  { key: "pedidos", label: "Pedidos", icon: "🧾" },
  { key: "gastos", label: "Gastos y Reembolsos", icon: "💸" },
  { key: "caja", label: "Control de Caja y Reportes", icon: "📊" },
];

const MODULOS_ATENDEDOR = [
  { key: "jornada", label: "Jornada", icon: "☀️" },
  { key: "pagos", label: "Pagos", icon: "💳" },
  { key: "pedidos", label: "Pedidos", icon: "🧾" },
  { key: "gastos", label: "Gastos y Reembolsos", icon: "💸" },
];

export default function DashboardLayout({ moduloActivo, onCambiarModulo, children }) {
  const { session, rol, logout } = useAuth();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const esDuena = rol === "dueña";
  const modulos = esDuena ? MODULOS_DUENA : MODULOS_ATENDEDOR;

  return (
    <div className="min-h-screen bg-carbon-900 text-white font-body flex">
      {/* sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-carbon-800 border-r border-carbon-700 flex flex-col transition-transform duration-200
          ${sidebarAbierto ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-6 py-6 border-b border-carbon-700">
          <h1 className="font-display font-bold text-brand-400 text-lg leading-tight">
            Sabores de Carolina
          </h1>
          <p className="text-carbon-300 text-xs mt-1">
            {esDuena ? "Panel de Dueña" : "Panel de Atendedor"}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {modulos.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                onCambiarModulo(m.key);
                setSidebarAbierto(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-card text-sm font-semibold transition-colors
                ${
                  moduloActivo === m.key
                    ? "bg-brand-500 text-carbon-900"
                    : "text-carbon-100 hover:bg-carbon-700"
                }`}
            >
              <span className="text-base">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-carbon-700">
          <p className="text-carbon-300 text-xs mb-2 truncate">
            Conectado como <span className="text-white font-semibold">{session?.nombre}</span>
          </p>
          <button
            onClick={logout}
            className="w-full py-2 rounded-card border border-carbon-600 text-carbon-200 hover:border-accent hover:text-accent text-sm font-semibold transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* contenido */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-carbon-800 border-b border-carbon-700">
          <button
            onClick={() => setSidebarAbierto(true)}
            className="text-white text-2xl leading-none px-2"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <span className="font-display font-bold text-brand-400">
            {modulos.find((m) => m.key === moduloActivo)?.label}
          </span>
          <span className="w-8" />
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
