/**
 * Diagnostic: check what mainImage values the loadProducts returns.
 * This simulates what the frontend does.
 */

const SHEETS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1FiZdSeYEVlUxfBtFPZ0pVOe_vWvbwVFlShMK6q49OL8/export?format=csv";
const VISOR_API_URL = "https://viewfinder-kino-visor.up.railway.app";
const BRAND_FILTER = "POEDAGAR";

function parseCSVPapa(text) {
    // Simplified papaparse-like parsing
    const lines = text.split("\n").filter(Boolean);
    const rawHeaders = lines[0];
    // Handle potential quoted fields
    const headers = rawHeaders.split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_").replace(/"/g, ""));

    return lines.slice(1).map((line) => {
        // Simple CSV split (doesn't handle quoted commas perfectly)
        const vals = line.split(",");
        const obj = {};
        headers.forEach((h, i) => (obj[h] = (vals[i] || "").trim().replace(/"/g, "")));
        return obj;
    });
}

function parseSkuSuffix(sku) {
    const trimmed = sku.trim();
    const photoMatch = trimmed.match(/^(.+?)F(\d+)$/i);
    if (photoMatch) return { baseSku: photoMatch[1], type: "photo", index: parseInt(photoMatch[2]) };
    const videoMatch = trimmed.match(/^(.+?)V(\d+)$/i);
    if (videoMatch) return { baseSku: videoMatch[1], type: "video", index: parseInt(videoMatch[2]) };
    return { baseSku: trimmed, type: "main", index: 0 };
}

async function main() {
    console.log("Fetching sheet...");
    const res = await fetch(SHEETS_CSV_URL);
    const csv = await res.text();
    const rows = parseCSVPapa(csv);

    // Filter POEDAGAR
    const brandRows = rows.filter((r) =>
        (r.brand || "").trim().toUpperCase() === BRAND_FILTER
    );

    console.log(`Total rows: ${rows.length}, Poedagar: ${brandRows.length}`);

    // Group products (like sheets.js groupProducts)
    const seen = new Set();
    const productMap = new Map();

    for (const row of brandRows) {
        const sku = (row.sku || "").trim();
        if (!sku || seen.has(sku)) continue;
        seen.add(sku);

        if ((row.status || "").trim().toLowerCase() !== "active") continue;

        const { baseSku, type } = parseSkuSuffix(sku);

        if (!productMap.has(baseSku)) {
            productMap.set(baseSku, {
                sku: baseSku,
                name: (row.name || "").trim(),
                mainImage: null,
                extraPhotos: [],
            });
        }

        const product = productMap.get(baseSku);
        if (type === "main") product.mainImage = sku;
        else if (type === "photo") product.extraPhotos.push(sku);
    }

    // Fallback if no mainImage
    for (const p of productMap.values()) {
        if (!p.mainImage) p.mainImage = p.sku;
    }

    const products = Array.from(productMap.values());
    console.log(`\nGrouped products: ${products.length}`);

    // Show each product's mainImage (this is what drive.js uses for covers)
    console.log("\nProduct SKU -> mainImage (used for cover lookup):");
    for (const p of products) {
        console.log(`  ${p.sku} -> mainImage: "${p.mainImage}" (extras: [${p.extraPhotos.join(", ")}])`);
    }

    // Now test batch cover lookup with the same mainImage values
    const skusToFetch = products.map((p) => p.mainImage || p.sku);
    console.log(`\nFetching covers for ${skusToFetch.length} mainImage SKUs...`);

    const BATCH_SIZE = 10;
    const found = {};
    const missing = [];

    for (let i = 0; i < skusToFetch.length; i += BATCH_SIZE) {
        const batch = skusToFetch.slice(i, i + BATCH_SIZE);
        try {
            const r = await fetch(`${VISOR_API_URL}/api/covers/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skus: batch }),
            });
            const data = await r.json();
            const covers = data.covers || {};

            for (const sku of batch) {
                if (covers[sku] && covers[sku].url) {
                    found[sku] = covers[sku].url.substring(0, 60);
                } else {
                    missing.push(sku);
                }
            }
        } catch (err) {
            missing.push(...batch);
            console.log(`  Error: ${err.message}`);
        }
    }

    console.log(`\n✅ Covers found: ${Object.keys(found).length}`);
    console.log(`❌ Covers missing: ${missing.length}`);
    if (missing.length > 0) {
        console.log(`Missing mainImage SKUs: ${missing.join(", ")}`);
    }
}

main().catch(console.error);
