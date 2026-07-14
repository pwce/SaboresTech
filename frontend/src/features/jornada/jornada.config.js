// estructura base de insumos de una jornada nueva.
// se mantiene alineada con las claves que espera src/utils/helperRecetas.js
export function insumosVacios() {
  return {
    envases: { vasos: 0, tapas: 0, bombillas: 0 },
    leches: { natural: false, sinLactosa: false },
    frutas: {
      frutilla: false,
      frambuesa: false,
      arandano: false,
      naranja: false,
      platano: false,
      piña: false,
      mora: false,
    },
    endulzantes: { azucar: false, endulzante: false },
    crema: { chantilly: false },
    extras: {
      aguaEmbotellada: false,
      café: false,
      chocolatepolvo: false,
      matcha: false,
      galletas_oreo: false,
      vainilla: false,
      menta: false,
      salsas: false,
    },
    agotados: [], // claves "grupo.item" marcadas como agotadas manualmente durante la jornada
  };
}

export const ENVASES_CONFIG = [
  { key: "vasos", label: "Vasos" },
  { key: "tapas", label: "Tapas" },
  { key: "bombillas", label: "Bombillas" },
];

export const LECHES_CONFIG = [
  { key: "natural", label: "Leche natural" },
  { key: "sinLactosa", label: "Leche sin lactosa" },
];

export const FRUTAS_CONFIG = [
  { key: "frutilla", label: "Frutilla" },
  { key: "frambuesa", label: "Frambuesa" },
  { key: "arandano", label: "Arándano" },
  { key: "naranja", label: "Naranja" },
  { key: "platano", label: "Plátano" },
  { key: "piña", label: "Piña" },
  { key: "mora", label: "Mora" },
];

export const ENDULZANTES_CONFIG = [
  { key: "azucar", label: "Azúcar" },
  { key: "endulzante", label: "Endulzante" },
];

export const CREMA_CONFIG = [{ key: "chantilly", label: "Crema chantilly" }];

export const EXTRAS_CONFIG = [
  { key: "aguaEmbotellada", label: "Agua embotellada" },
  { key: "café", label: "Café" },
  { key: "chocolatepolvo", label: "Chocolate en polvo" },
  { key: "matcha", label: "Matcha" },
  { key: "galletas_oreo", label: "Galletas Oreo" },
  { key: "vainilla", label: "Vainilla en polvo" },
  { key: "menta", label: "Menta" },
  { key: "salsas", label: "Salsas" },
];

// categorías de productos que se muestran en la jornada
export const CATEGORIAS_PRODUCTO = ["Salado", "Dulce", "Bebestibles"];

// nombres de productos que por definición del negocio SIEMPRE tienen stock fijo
export const PRODUCTOS_STOCK_FIJO = [
  "pizza",
  "empanada",
  "pan con chicharrones",
  "pajarito",
  "dona",
  "sandwich",
  "bebida en lata",
  "energizante",
  "agua mineral",
];

// tipos de bebestible que dependen de la disponibilidad de insumos de la jornada
export const BEBESTIBLES_SIN_STOCK_FIJO = ["milkshake", "jugo natural", "frappé"];

export function esProductoDeStockFijoPorNombre(nombre = "") {
  const n = nombre.toLowerCase();
  return PRODUCTOS_STOCK_FIJO.some((p) => n.includes(p));
}
