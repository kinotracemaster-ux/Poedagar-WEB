// === CONFIGURACIÓN PRINCIPAL ===
export const WHATSAPP_NUMBER = "5491122334455";

// Marca a filtrar (solo mostrar esta marca del Sheet y Drive)
export const BRAND_FILTER = "POEDAGAR";

// Colores — paleta café oscuro / cuero
export const GOLD_VINTAGE = "#8B6914";
export const BG_CREAM = "#FAF6F1";
export const BG_DARK = "#1a1209";

// Google Sheets (publicado como CSV)
export const SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1FiZdSeYEVlUxfBtFPZ0pVOe_vWvbwVFlShMK6q49OL8/export?format=csv";

// Google Drive folder ID
export const DRIVE_FOLDER_ID = "1fYy8YwK4Vt_mVS0zjZtJIjlyvJiZXV4m";

// Visor API (proxy para acceder a imágenes de Google Drive)
export const VISOR_API_URL = "https://viewfinder-kino-visor.up.railway.app";

// Categorías del negocio
export const CATEGORIES = [
  "Todos",
  "CLASICO",
  "DEPORTIVO",
  "LUZ LED",
  "PARED 3D",
];

// Géneros
export const GENDERS = ["Todos", "hombre", "mujer", "HOGAR"];

// Zonas de envío
export const SHIPPING_ZONES = [
  { id: "local", name: "Local (Buenos Aires)", price: 500 },
  { id: "nacional", name: "Nacional (Interior)", price: 1200 },
  { id: "internacional", name: "Internacional", price: 3500 },
];
