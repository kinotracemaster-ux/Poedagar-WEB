import { DRIVE_FOLDER_ID, BRAND_FILTER } from "../utils/constants";

// Cache de file IDs ya descubiertos
let fileIdCache = {};

// ID de la subcarpeta de la marca (se resuelve al inicio)
let brandFolderId = null;

/**
 * Construye una URL de thumbnail desde un File ID de Google Drive.
 * sz=w800 obtiene una imagen de 800px de ancho.
 */
export function getDriveThumbnailUrl(fileId, size = 800) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * Construye una URL de vista de imagen usando el fileId.
 */
export function getDriveImageUrl(fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w800`;
}

/**
 * Construye una URL de descarga directa para un archivo de Drive.
 */
export function getDriveDownloadUrl(fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Busca la subcarpeta de la marca (POEDAGAR) dentro del folder raíz.
 * Retorna el ID de la subcarpeta o null si no la encuentra.
 */
async function findBrandFolder() {
    if (brandFolderId) return brandFolderId;

    try {
        const url = new URL("https://www.googleapis.com/drive/v3/files");
        url.searchParams.set(
            "q",
            `'${DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and name='${BRAND_FILTER}'`
        );
        url.searchParams.set("fields", "files(id,name)");
        url.searchParams.set("key", "");

        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();

        if (data.files && data.files.length > 0) {
            brandFolderId = data.files[0].id;
            console.log(`[drive] Carpeta ${BRAND_FILTER} encontrada: ${brandFolderId}`);
            return brandFolderId;
        }

        // Si no se encuentra una subcarpeta, usar el folder raíz como fallback
        console.warn(`[drive] Subcarpeta ${BRAND_FILTER} no encontrada, usando carpeta raíz`);
        return DRIVE_FOLDER_ID;
    } catch {
        console.warn("[drive] Error buscando subcarpeta de marca");
        return DRIVE_FOLDER_ID;
    }
}

/**
 * Busca archivos en la carpeta de la marca en Drive.
 * Primero localiza la subcarpeta POEDAGAR, luego lista sus archivos.
 */
export async function listDriveFiles(query = "") {
    const folderId = await findBrandFolder();

    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set(
        "q",
        `'${folderId}' in parents${query ? ` and name contains '${query}'` : ""}`
    );
    url.searchParams.set("fields", "files(id,name,mimeType)");
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("key", "");

    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return data.files || [];
    } catch {
        return [];
    }
}

/**
 * Dada una lista de productos, intenta construir URLs de imagen usando
 * un mapping SKU → file que se carga una vez.
 * Fallback: usa placeholder si no se encuentra.
 */
export function buildImageUrl(sku) {
    // Primero verificar cache
    if (fileIdCache[sku]) {
        return getDriveImageUrl(fileIdCache[sku]);
    }

    // Fallback: intentar URL directa con nombre (funciona si carpeta es pública)
    // Google Drive necesita file id, así que usamos un placeholder elegante
    return null;
}

/**
 * Carga el mapeo SKU → fileId desde la subcarpeta POEDAGAR en Drive.
 * Solo necesita ejecutarse una vez al inicio.
 */
export async function loadFileMapping() {
    try {
        const files = await listDriveFiles();

        console.log(`[drive] ${files.length} archivos encontrados en carpeta ${BRAND_FILTER}`);

        for (const file of files) {
            // El nombre del archivo sin extensión es el SKU
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            fileIdCache[nameWithoutExt] = file.id;
        }
        return fileIdCache;
    } catch {
        console.warn("No se pudo cargar el mapeo de archivos de Drive");
        return {};
    }
}

/**
 * Obtiene la URL de imagen para un producto dado su SKU.
 * Retorna la URL o un placeholder.
 */
export function getProductImageUrl(sku) {
    const cached = fileIdCache[sku];
    if (cached) {
        return getDriveImageUrl(cached);
    }
    // Placeholder elegante
    return `https://placehold.co/800x800/1a1a1a/C5A059?text=${encodeURIComponent(sku)}`;
}

/**
 * Obtiene todas las imágenes de un producto (main + extras).
 */
export function getProductAllImages(product) {
    const images = [];

    // Imagen principal
    images.push({
        sku: product.mainImage,
        url: getProductImageUrl(product.mainImage),
        type: "main",
    });

    // Fotos extras
    for (const extra of product.extraPhotos) {
        images.push({
            sku: extra.sku,
            url: getProductImageUrl(extra.sku),
            type: "photo",
        });
    }

    return images;
}

/**
 * Obtiene los videos de un producto.
 */
export function getProductVideos(product) {
    return product.videos.map((v) => ({
        sku: v.sku,
        url: fileIdCache[v.sku]
            ? `https://drive.google.com/file/d/${fileIdCache[v.sku]}/preview`
            : null,
        type: "video",
    }));
}

/**
 * Retorna el cache actual.
 */
export function getFileCache() {
    return { ...fileIdCache };
}
