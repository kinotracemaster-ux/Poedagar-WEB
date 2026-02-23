import { VISOR_API_URL } from "../utils/constants";

// Cache de URLs de imágenes { sku: url }
let coverCache = {};
// Cache de media completa por SKU { sku: { files, rootSku } }
let mediaCache = {};

/**
 * Construye una URL de thumbnail de Google Drive.
 */
export function getDriveThumbnailUrl(fileId, size = 800) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * URL directa de imagen de Google Drive (para archivos públicos).
 */
export function getDriveImageUrl(fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w800`;
}

/**
 * Placeholder elegante para cuando no hay imagen.
 */
function placeholder(sku) {
    return `https://placehold.co/800x800/1a1a1a/C5A059?text=${encodeURIComponent(sku || "?")}`;
}

/**
 * Obtiene media de un producto desde el visor API.
 * Endpoint: GET /api/media/{sku}
 * Retorna: { files: [{id, name, mimeType, thumbnailLink}], rootSku, ... }
 */
async function fetchMediaFromVisor(sku) {
    if (mediaCache[sku]) return mediaCache[sku];

    try {
        const res = await fetch(`${VISOR_API_URL}/api/media/${encodeURIComponent(sku)}`);
        if (!res.ok) return { files: [] };
        const data = await res.json();
        mediaCache[sku] = data;
        return data;
    } catch (err) {
        console.warn(`[drive] Error cargando media para ${sku}:`, err.message);
        return { files: [] };
    }
}

/**
 * Obtiene portadas en batch desde el visor API.
 * Endpoint: POST /api/covers/batch
 * Body: { skus: ["sku1", "sku2", ...] }
 * Retorna: { covers: { sku1: { url, video }, sku2: { url, video } } }
 */
async function fetchCoversBatch(skus) {
    if (!skus.length) return {};

    try {
        const res = await fetch(`${VISOR_API_URL}/api/covers/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skus }),
        });
        if (!res.ok) {
            console.warn("[drive] Batch covers failed:", res.status);
            return {};
        }
        const data = await res.json();
        return data.covers || {};
    } catch (err) {
        console.warn("[drive] Error en batch covers:", err.message);
        return {};
    }
}

/**
 * Carga el mapeo de portadas para todos los productos.
 * Llama al visor en lotes de 20 SKUs para no sobrecargar.
 */
export async function loadFileMapping(products = [], onProgress) {
    if (!products.length) return coverCache;

    // Prioritize: mainImage SKUs first, then extras and videos
    const mainSkus = products.map((p) => p.mainImage || p.sku);
    const extraSkus = [];
    for (const p of products) {
        if (p.extraPhotos) {
            for (const ep of p.extraPhotos) extraSkus.push(ep.sku);
        }
        if (p.videos) {
            for (const v of p.videos) extraSkus.push(v.sku);
        }
    }

    const BATCH_SIZE = 10;

    console.log(`[drive] Cargando ${mainSkus.length} portadas principales + ${extraSkus.length} extras...`);

    // Helper: process a list of SKUs in batches
    async function processBatches(skuList) {
        for (let i = 0; i < skuList.length; i += BATCH_SIZE) {
            const batch = skuList.slice(i, i + BATCH_SIZE);
            const covers = await fetchCoversBatch(batch);

            for (const [sku, data] of Object.entries(covers)) {
                if (data && data.url) {
                    coverCache[sku] = data.url;
                }
            }

            // Notify caller after each batch so UI can re-render
            if (onProgress) onProgress({ ...coverCache });
        }
    }

    // Ronda 1: portadas principales (lo que ve el catálogo)
    await processBatches(mainSkus);

    // Ronda 2: extras y videos (para detalle de producto)
    if (extraSkus.length > 0) {
        await processBatches(extraSkus);
    }

    // Ronda 3: reintentar los que fallaron
    const allSkus = [...mainSkus, ...extraSkus];
    const missing = allSkus.filter((s) => !coverCache[s]);
    if (missing.length > 0) {
        console.log(`[drive] Reintentando ${missing.length} SKUs sin portada...`);
        await processBatches(missing);
    }

    console.log(
        `[drive] ${Object.keys(coverCache).length} portadas cargadas de ${allSkus.length} solicitadas`
    );

    return coverCache;
}

/**
 * Obtiene la URL de imagen para un producto dado su SKU.
 * Primero busca en cache, luego retorna placeholder.
 */
export function getProductImageUrl(sku) {
    if (!sku) return placeholder("?");

    // Cache hit
    if (coverCache[sku]) {
        return coverCache[sku];
    }

    // Intentar con thumbnail directo si tenemos un file ID en cache
    // (para archivos ya cargados por loadFileMapping)
    return placeholder(sku);
}

/**
 * Obtiene todas las imágenes de un producto (main + extras).
 * Llama al visor API para obtener media completa del SKU raíz.
 */
export async function getProductAllImagesAsync(product) {
    const images = [];
    const sku = product.mainImage || product.sku;

    try {
        // Primero intentar cache rápido
        if (coverCache[sku]) {
            images.push({ sku, url: coverCache[sku], type: "main" });
        }

        // Luego cargar media completa del visor
        const media = await fetchMediaFromVisor(sku);

        if (media.files && media.files.length > 0) {
            for (const file of media.files) {
                const isVideo =
                    file.mimeType && file.mimeType.startsWith("video/");
                if (isVideo) continue; // Solo imágenes

                const url = file.thumbnailLink
                    ? file.thumbnailLink.replace(/=s\d+/, "=s800")
                    : getDriveThumbnailUrl(file.id);

                // Evitar duplicados
                if (!images.find((img) => img.url === url)) {
                    images.push({
                        sku: file.name?.replace(/\.[^/.]+$/, "") || sku,
                        url,
                        type: images.length === 0 ? "main" : "photo",
                    });
                }
            }
        }
    } catch (err) {
        console.warn("[drive] Error en getProductAllImagesAsync:", err);
    }

    // Si no se encontraron imágenes, usar placeholder
    if (images.length === 0) {
        images.push({ sku, url: placeholder(sku), type: "main" });
    }

    return images;
}

/**
 * Versión síncrona para compatibilidad — usa solo el cache disponible.
 */
export function getProductAllImages(product) {
    const images = [];
    const sku = product.mainImage || product.sku;

    // Imagen principal desde cache
    const mainUrl = coverCache[sku] || placeholder(sku);
    images.push({ sku, url: mainUrl, type: "main" });

    // Fotos extras desde cache
    if (product.extraPhotos) {
        for (const extra of product.extraPhotos) {
            const url = coverCache[extra.sku] || placeholder(extra.sku);
            images.push({ sku: extra.sku, url, type: "photo" });
        }
    }

    return images;
}

/**
 * Obtiene los videos de un producto desde el visor API.
 */
export async function getProductVideosAsync(product) {
    const sku = product.mainImage || product.sku;
    const media = await fetchMediaFromVisor(sku);

    if (!media.files) return [];

    return media.files
        .filter((f) => f.mimeType && f.mimeType.startsWith("video/"))
        .map((f) => ({
            sku: f.name?.replace(/\.[^/.]+$/, "") || sku,
            url: `https://drive.google.com/file/d/${f.id}/preview`,
            downloadUrl: `${VISOR_API_URL}/api/download/${f.id}`,
            type: "video",
        }));
}

/**
 * Retorna el cache actual de portadas.
 */
export function getFileCache() {
    return { ...coverCache };
}
