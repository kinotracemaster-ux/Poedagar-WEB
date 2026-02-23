import { VISOR_API_URL } from "../utils/constants";

// Cache de URLs de imágenes { sku: url }
let coverCache = {};
// Cache de media completa por SKU { sku: { files, rootSku } }
let mediaCache = {};
// Pending fetches to avoid duplicate requests { sku: Promise }
let pendingFetches = {};

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

        // Cache individual cover URLs from files
        if (data.files) {
            for (const f of data.files) {
                const fname = (f.name || "").replace(/\.[^.]+$/, "");
                if (f.id && !coverCache[fname]) {
                    coverCache[fname] = getDriveImageUrl(f.id);
                }
            }
        }

        return data;
    } catch (err) {
        console.warn(`[drive] Error cargando media para ${sku}:`, err.message);
        return { files: [] };
    }
}

/**
 * Carga la imagen de un SKU específico.
 * Busca en visor API /api/media/{sku} y cachea la URL.
 * Deduplicates requests for the same SKU.
 */
export async function loadCoverForSku(sku) {
    if (!sku) return placeholder("?");
    if (coverCache[sku]) return coverCache[sku];

    // Deduplicate: if already fetching this SKU, wait for it
    if (pendingFetches[sku]) {
        await pendingFetches[sku];
        return coverCache[sku] || placeholder(sku);
    }

    // Start fetch and register as pending
    pendingFetches[sku] = (async () => {
        const data = await fetchMediaFromVisor(sku);

        if (data.files && data.files.length > 0) {
            // Find the exact match or first file
            const exact = data.files.find((f) => {
                const fname = (f.name || "").replace(/\.[^.]+$/, "");
                return fname === sku;
            });
            const file = exact || data.files[0];
            if (file && file.id) {
                coverCache[sku] = getDriveImageUrl(file.id);
            }
        }
    })();

    await pendingFetches[sku];
    delete pendingFetches[sku];

    return coverCache[sku] || placeholder(sku);
}

/**
 * Obtiene la URL de imagen para un producto dado su SKU.
 * Retorna cache hit o placeholder (sync).
 */
export function getProductImageUrl(sku) {
    if (!sku) return placeholder("?");
    if (coverCache[sku]) return coverCache[sku];
    return placeholder(sku);
}

/**
 * Pre-carga todas las portadas principales para el catálogo.
 * Usa /api/media/{sku} en paralelo con concurrencia limitada.
 * Mucho más rápido que el batch secuencial.
 */
export async function loadFileMapping(products = [], onProgress) {
    if (!products.length) return coverCache;

    const mainSkus = products.map((p) => p.mainImage || p.sku);
    const uniqueSkus = [...new Set(mainSkus)].filter((s) => !coverCache[s]);

    console.log(`[drive] Cargando ${uniqueSkus.length} portadas en paralelo...`);

    // Parallel with concurrency limit of 6
    const CONCURRENCY = 6;
    let loaded = 0;

    async function processOne(sku) {
        await loadCoverForSku(sku);
        loaded++;
        if (onProgress && loaded % CONCURRENCY === 0) {
            onProgress({ ...coverCache });
        }
    }

    // Process in chunks of CONCURRENCY
    for (let i = 0; i < uniqueSkus.length; i += CONCURRENCY) {
        const chunk = uniqueSkus.slice(i, i + CONCURRENCY);
        await Promise.all(chunk.map(processOne));
    }

    // Final progress
    if (onProgress) onProgress({ ...coverCache });

    console.log(
        `[drive] ${Object.keys(coverCache).length} portadas cargadas`
    );

    return coverCache;
}

/**
 * Obtiene todas las imágenes de un producto (main + extras).
 * Versión sincrónica — usa coverCache.
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

    // Videos
    if (product.videos) {
        for (const vid of product.videos) {
            const url = coverCache[vid.sku] || placeholder(vid.sku);
            images.push({ sku: vid.sku, url, type: "video" });
        }
    }

    return images;
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
        const data = await fetchMediaFromVisor(product.sku);
        if (data.files && data.files.length > 0) {
            for (const file of data.files) {
                const url = getDriveImageUrl(file.id);
                const fname = (file.name || "").replace(/\.[^.]+$/, "");

                // Detect type from filename
                let type = "main";
                if (/F\d+$/i.test(fname)) type = "photo";
                else if (/V\d+$/i.test(fname)) type = "video";

                // Skip if already added via cache
                if (images.some((img) => img.sku === fname)) {
                    const existing = images.find((img) => img.sku === fname);
                    existing.url = url;
                    continue;
                }

                images.push({
                    sku: fname,
                    url,
                    type,
                    mimeType: file.mimeType,
                    downloadUrl: file.webContentLink,
                });
            }
        }
    } catch (err) {
        console.warn("[drive] Error cargando imágenes:", err);
    }

    // Fallback: si no hay imágenes, al menos mostrar placeholder
    if (images.length === 0) {
        images.push({ sku, url: placeholder(sku), type: "main" });
    }

    return images;
}
