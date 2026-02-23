import Papa from "papaparse";
import { SHEETS_CSV_URL, BRAND_FILTER } from "../utils/constants";

/**
 * Descarga y parsea el CSV del Google Sheets.
 * Retorna un array de objetos con las columnas del sheet.
 */
export async function fetchSheetData() {
    const response = await fetch(SHEETS_CSV_URL);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
            complete: (results) => resolve(results.data),
            error: (err) => reject(err),
        });
    });
}

/**
 * Determina si un SKU es una foto extra (F1, F2) o video (V1).
 * Retorna { baseSku, type, index }
 * Ej: "993-1F1" → { baseSku: "993-1", type: "photo", index: 1 }
 * Ej: "993-3V1" → { baseSku: "993-3", type: "video", index: 1 }
 * Ej: "993-1"   → { baseSku: "993-1", type: "main", index: 0 }
 */
export function parseSkuSuffix(sku) {
    const trimmed = sku.trim();

    // Detectar sufijo F(n) — foto extra
    const photoMatch = trimmed.match(/^(.+?)F(\d+)$/i);
    if (photoMatch) {
        return {
            baseSku: photoMatch[1],
            type: "photo",
            index: parseInt(photoMatch[2]),
        };
    }

    // Detectar sufijo V(n) — video
    const videoMatch = trimmed.match(/^(.+?)V(\d+)$/i);
    if (videoMatch) {
        return {
            baseSku: videoMatch[1],
            type: "video",
            index: parseInt(videoMatch[2]),
        };
    }

    return { baseSku: trimmed, type: "main", index: 0 };
}

/**
 * Extrae el modelo base de un SKU (sin la variante de color).
 * Ej: "993-1" → "993", "JX2370-5" → "JX2370", "ZH006-BF1" → "ZH006"
 */
export function extractModel(baseSku) {
    // Remove terminal letter groups that represent color (like -B, -S, -G, -BF1)
    // But preserve numbers after dash (those are variants)
    const parts = baseSku.split("-");
    return parts[0];
}

/**
 * Agrupa las filas del sheet en productos.
 * Cada producto agrupa:
 * - Datos principales (name, category, gender, etc.)
 * - Variantes (993-1, 993-2, etc.) cada una con sus fotos extras y videos
 */
/**
 * Parsea un precio que puede venir como " $120.000", "120000", "$120,000", etc.
 */
function parsePrice(val) {
    if (!val) return 0;
    // Strip everything except digits, dots, and commas
    let s = String(val).replace(/[^0-9.,]/g, "");
    if (!s) return 0;
    if (s.includes(".") && s.includes(",")) {
        // "120.000,50" → 120000.50
        s = s.replace(/\./g, "").replace(",", ".");
    } else if (s.includes(".")) {
        const parts = s.split(".");
        // If last group has 3 digits → thousands separator (e.g. "120.000")
        if (parts[parts.length - 1].length === 3 && parts.length > 1) {
            s = s.replace(/\./g, "");
        }
    } else if (s.includes(",")) {
        const parts = s.split(",");
        if (parts[parts.length - 1].length === 3 && parts.length > 1) {
            s = s.replace(/,/g, "");
        } else {
            s = s.replace(",", ".");
        }
    }
    return parseFloat(s) || 0;
}

export function groupProducts(rows) {
    const seen = new Set();
    // First pass: group by baseSku (handles F1/V1 suffixes)
    const variantMap = new Map();

    for (const row of rows) {
        const sku = (row.sku || "").trim();
        if (!sku || seen.has(sku)) continue;
        seen.add(sku);

        if ((row.status || "").trim().toLowerCase() !== "active") continue;

        const { baseSku, type, index } = parseSkuSuffix(sku);

        if (!variantMap.has(baseSku)) {
            variantMap.set(baseSku, {
                sku: baseSku,
                name: (row.name || "").trim(),
                category: (row.category || "").trim(),
                gender: (row.gender || "").trim().toLowerCase(),
                movement: (row.movement || "").trim(),
                price: parsePrice(row.price || row.price_suggested),
                description: (row.description || "").trim(),
                status: (row.status || "").trim(),
                stock: row.stock !== undefined && row.stock !== "" ? parseInt(row.stock, 10) : -1,
                mainImage: null,
                extraPhotos: [],
                videos: [],
            });
        }

        const variant = variantMap.get(baseSku);

        if (type === "main") {
            variant.mainImage = sku;
        } else if (type === "photo") {
            variant.extraPhotos.push({ sku, index });
        } else if (type === "video") {
            variant.videos.push({ sku, index });
        }
    }

    // Set defaults for variants
    for (const v of variantMap.values()) {
        if (!v.mainImage) v.mainImage = v.sku;
        v.extraPhotos.sort((a, b) => a.index - b.index);
        v.videos.sort((a, b) => a.index - b.index);
    }

    // Second pass: group variants under parent SKU
    // "993-1" → parent "993", "938-2" → parent "938"
    const parentMap = new Map();

    for (const variant of variantMap.values()) {
        const parentSku = variant.sku.replace(/-\d+$/, "");

        if (!parentMap.has(parentSku)) {
            parentMap.set(parentSku, {
                sku: parentSku,
                name: variant.name,
                category: variant.category,
                gender: variant.gender,
                movement: variant.movement,
                price: variant.price,
                description: variant.description,
                status: variant.status,
                stock: variant.stock,
                mainImage: variant.mainImage,
                extraPhotos: [...variant.extraPhotos],
                videos: [...variant.videos],
            });
        } else {
            const parent = parentMap.get(parentSku);
            // Add this variant's mainImage as an extra photo thumbnail
            parent.extraPhotos.push({
                sku: variant.mainImage || variant.sku,
                index: parent.extraPhotos.length + 100,
            });
            // Merge additional photos and videos
            for (const ep of variant.extraPhotos) {
                parent.extraPhotos.push({ ...ep, index: parent.extraPhotos.length + 100 });
            }
            for (const vid of variant.videos) {
                parent.videos.push({ ...vid, index: parent.videos.length + 100 });
            }
            // Use higher stock if available
            if (variant.stock > 0 && (parent.stock <= 0 || parent.stock === -1)) {
                parent.stock = variant.stock;
            }
            // Use price if parent doesn't have one
            if (!parent.price && variant.price) {
                parent.price = variant.price;
            }
        }
    }

    return Array.from(parentMap.values());
}

/**
 * Carga completa: descarga sheet → filtra por marca → parsea → agrupa → retorna productos
 */
export async function loadProducts() {
    const rows = await fetchSheetData();

    // ✅ Filtrar solo productos de la marca POEDAGAR
    const brandRows = rows.filter((row) => {
        const brand = (row.brand || "").trim().toUpperCase();
        return brand === BRAND_FILTER.toUpperCase();
    });

    console.log(
        `[sheets] ${rows.length} filas totales → ${brandRows.length} filas POEDAGAR`
    );

    return groupProducts(brandRows);
}
