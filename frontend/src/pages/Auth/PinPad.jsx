// PinPad.jsx
import React from 'react';

export default function PinPad({ onPressNumber, onDelete, onClear, pinLength }) {
  return (
    <div className="w-full max-w-md font-body">
      {/* visualizador del PIN */}
      <div className="flex justify-center gap-4 mb-6">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              pinLength > index
                ? 'bg-brand-500 border-brand-500 shadow-pop'
                : 'border-carbon-500 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* teclado numérico optimizado para tablets (64px de alto) */}
      <div className="grid grid-cols-3 gap-4 text-white">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPressNumber(num)}
            className="min-h-touch-lg bg-carbon-700 hover:bg-carbon-500 active:bg-brand-600 rounded-card font-display text-2xl font-semibold transition-colors duration-150 flex items-center justify-center focus:outline-none"
          >
            {num}
          </button>
        ))}

        {/* botón de limpiar (C) */}
        <button
          type="button"
          onClick={onClear}
          className="min-h-touch-lg bg-carbon-700 hover:bg-estado-agotado/20 text-estado-agotado rounded-card font-display text-xl font-bold transition-colors focus:outline-none flex items-center justify-center"
        >
          C
        </button>

        {/* Cero */}
        <button
          type="button"
          onClick={() => onPressNumber(0)}
          className="min-h-touch-lg bg-carbon-700 hover:bg-carbon-500 active:bg-brand-600 rounded-card font-display text-2xl font-semibold transition-colors focus:outline-none flex items-center justify-center"
        >
          0
        </button>

        {/* botón de borrar */}
        <button
          type="button"
          onClick={onDelete}
          className="min-h-touch-lg bg-carbon-700 hover:bg-accent-dark/20 text-accent rounded-card font-display text-xl transition-colors focus:outline-none flex items-center justify-center"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}