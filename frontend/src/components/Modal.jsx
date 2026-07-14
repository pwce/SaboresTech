import React from "react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-carbon-800 border border-carbon-700 rounded-card shadow-pop animate-popIn max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-700 sticky top-0 bg-carbon-800">
          <h3 className="font-display font-bold text-lg text-brand-400">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-carbon-300 hover:text-white text-xl leading-none px-2"
              aria-label="Cerrar"
            >
              ×
            </button>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
