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
export function groupProducts(rows) {
    const seen = new Set();
    const productMap = new Map();

    for (const row of rows) {
        const sku = (row.sku || "").trim();
        if (!sku || seen.has(sku)) continue; // deduplica
        seen.add(sku);

        if ((row.status || "").trim().toLowerCase() !== "active") continue;

        const { baseSku, type, index } = parseSkuSuffix(sku);

        if (!productMap.has(baseSku)) {
            productMap.set(baseSku, {
                sku: baseSku,
                name: (row.name || "").trim(),
                category: (row.category || "").trim(),
                gender: (row.gender || "").trim().toLowerCase(),
                movement: (row.movement || "").trim(),
                price: parseFloat(row.price_suggested) || 0,
                description: (row.description || "").trim(),
                status: (row.status || "").trim(),
                stock: row.stock !== undefined && row.stock !== "" ? parseInt(row.stock, 10) : -1,
                mainImage: null,
                extraPhotos: [],
                videos: [],
            });
        }

        const product = productMap.get(baseSku);

        if (type === "main") {
            product.mainImage = sku;
        } else if (type === "photo") {
            product.extraPhotos.push({ sku, index });
        } else if (type === "video") {
            product.videos.push({ sku, index });
        }
    }

    // Si un producto no tiene mainImage, usar su baseSku
    for (const p of productMap.values()) {
        if (!p.mainImage) p.mainImage = p.sku;
        // Ordenar fotos extras por index
        p.extraPhotos.sort((a, b) => a.index - b.index);
        p.videos.sort((a, b) => a.index - b.index);
    }

    return Array.from(productMap.values());
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
