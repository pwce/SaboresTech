// jornada.config.js
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
      hielo: false,
      aguaEmbotellada: false,
      café: false,
      chocolatepolvo: false,
      matcha: false,
      galletas_oreo: false,
      vainilla: false,
      menta: false,
      salsas: false,
    },
    agotados: [],
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
  { key: "hielo", label: "Hielo" },
  { key: "aguaEmbotellada", label: "Agua embotellada" },
  { key: "café", label: "Café" },
  { key: "chocolatepolvo", label: "Chocolate en polvo" },
  { key: "matcha", label: "Matcha" },
  { key: "galletas_oreo", label: "Galletas Oreo" },
  { key: "vainilla", label: "Vainilla en polvo" },
  { key: "menta", label: "Menta" },
  { key: "salsas", label: "Salsas" },
];

export const CATEGORIAS_PRODUCTO = ["Salado", "Dulce", "Bebestibles"];

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

export function esProductoDeStockFijoPorNombre(nombre = "") {
  const n = nombre.toLowerCase();
  return PRODUCTOS_STOCK_FIJO.some((p) => n.includes(p));
}


export const RECETAS_BEBESTIBLES = [
  {
    id: "milkshakes",
    keywords: ["milkshake"],
    requiere: { frutas: "alguna", leches: "alguna", endulzantes: "alguna" },
    mensajeFaltante: "Faltan frutas, leche y/o algún endulzante (azúcar o endulzante) para preparar milkshakes.",
  },
  {
    id: "jugosNaturales",
    keywords: ["jugo"],
    requiere: { frutas: "alguna", endulzantes: "alguna", extras: ["aguaEmbotellada"] },
    mensajeFaltante: "Falta seleccionar al menos una fruta, un endulzante (azúcar o endulzante) y agua embotellada.",
  },
  {
    id: "frappeChocomenta",
    keywords: ["chocomenta"],
    requiere: { leches: "alguna", hielo: true, endulzantes: "alguna", extras: ["chocolatepolvo", "menta"] },
    mensajeFaltante: "Faltan leche, hielo, endulzante, chocolate en polvo o menta.",
  },
  {
    id: "frappeOreo",
    keywords: ["oreo"],
    requiere: { leches: "alguna", hielo: true, endulzantes: "alguna", extras: ["galletas_oreo"] },
    mensajeFaltante: "Faltan leche, hielo, endulzante o galletas Oreo.",
  },
  {
    id: "frappeMatcha",
    keywords: ["matcha"],
    requiere: { leches: "alguna", hielo: true, endulzantes: "alguna", extras: ["matcha"] },
    mensajeFaltante: "Faltan leche, hielo, endulzante o matcha.",
  },
  {
    id: "frappeVainilla",
    keywords: ["vainilla"],
    requiere: { leches: "alguna", hielo: true, endulzantes: "alguna", extras: ["vainilla"] },
    mensajeFaltante: "Faltan leche, hielo, endulzante o vainilla en polvo.",
  },
  {
    id: "frappeFrutilla",
    keywords: ["frutilla"],
    requiere: { leches: "alguna", hielo: true, endulzantes: "alguna", frutas: ["frutilla"] },
    mensajeFaltante: "Faltan leche, hielo, endulzante o frutilla.",
  },
  {
    id: "chocofrape",
    keywords: ["chocofrap", "choco frap"],
    requiere: { leches: "alguna", hielo: true, endulzantes: "alguna", extras: ["chocolatepolvo"] },
    mensajeFaltante: "Faltan leche, hielo, endulzante o chocolate en polvo.",
  },
  {
    id: "frapuccino",
    keywords: ["frapuccino", "frappuccino"],
    requiere: { leches: "alguna", hielo: true, endulzantes: "alguna", extras: ["café"] },
    mensajeFaltante: "Faltan leche, hielo, endulzante o café.",
  },
  {

    id: "frappeGenerico",
    keywords: ["frap"],
    requiere: { leches: "alguna", hielo: true, endulzantes: "alguna" },
    mensajeFaltante: "Faltan leche, hielo y/o endulzante.",
  },
];

/**
 * encuentra la receta que corresponde a un producto según su nombre.
 * @param {string} nombre
 * @returns {object|null}
 */
export function obtenerRecetaBebestible(nombre = "") {
  const n = nombre.toLowerCase();
  return RECETAS_BEBESTIBLES.find((r) => r.keywords.some((k) => n.includes(k))) || null;
}

export const LABELS_POR_GRUPO = {
  envases: Object.fromEntries(ENVASES_CONFIG.map((i) => [i.key, i.label])),
  leches: Object.fromEntries(LECHES_CONFIG.map((i) => [i.key, i.label])),
  frutas: Object.fromEntries(FRUTAS_CONFIG.map((i) => [i.key, i.label])),
  endulzantes: Object.fromEntries(ENDULZANTES_CONFIG.map((i) => [i.key, i.label])),
  crema: Object.fromEntries(CREMA_CONFIG.map((i) => [i.key, i.label])),
  extras: Object.fromEntries(EXTRAS_CONFIG.map((i) => [i.key, i.label])),
};

//obtiene el nombre legible de un insumo puntual 
export function obtenerLabelInsumo(grupo, key, insumos) {
  const labelPersonalizado = insumos?.customLabels?.[`${grupo}.${key}`];
  if (labelPersonalizado) return labelPersonalizado;
  return LABELS_POR_GRUPO[grupo]?.[key] || key;
}

/**
 * genera una key sin tildes/espacios a partir de un nombre libre, para
 * poder guardar insumos personalizados (ej: una fruta nueva) dentro del
 * mismo objeto plano {key: boolean} que ya usan los insumos fijos.
 */
export function slugificarInsumo(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * agrega un insumo personalizado (ej: una fruta nueva) al objeto de insumos,
 * marcándolo disponible y guardando su nombre legible original.
 * @returns {object} una copia actualizada de `insumos`
 */
export function agregarInsumoPersonalizado(insumos, grupo, nombreLibre) {
  const key = slugificarInsumo(nombreLibre);
  if (!key) return insumos;
  const copia = structuredClone(insumos);
  copia[grupo] = { ...copia[grupo], [key]: true };
  copia.customLabels = { ...(copia.customLabels || {}), [`${grupo}.${key}`]: nombreLibre.trim() };
  return copia;
}

