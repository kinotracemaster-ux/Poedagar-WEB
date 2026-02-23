// === CONFIGURACIÓN PRINCIPAL ===
export const WHATSAPP_NUMBER = "5491122334455";

// Marca a filtrar (solo mostrar esta marca del Sheet y Drive)
export const BRAND_FILTER = "POEDAGAR";

// Colores
export const GOLD_VINTAGE = "#C5A059";
export const BG_CREAM = "#FDFBF7";
export const BG_DARK = "#0a0a0a";

// Google Sheets (publicado como CSV)
export const SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1FiZdSeYEVlUxfBtFPZ0pVOe_vWvbwVFlShMK6q49OL8/export?format=csv";

// Google Drive folder ID
export const DRIVE_FOLDER_ID = "1fYy8YwK4Vt_mVS0zjZtJIjlyvJiZXV4m";

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
