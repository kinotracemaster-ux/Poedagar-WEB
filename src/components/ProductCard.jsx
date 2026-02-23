import { Link } from "react-router-dom";
import { Plus, ImageOff } from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { getProductImageUrl, loadCoverForSku } from "../services/drive";

export default function ProductCard({ product, imageUrl }) {
    const { addToCart } = useCart();
    const [imgError, setImgError] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(imageUrl);

    // Lazy load: if showing placeholder, fetch real image
    useEffect(() => {
        if (!imageUrl || imageUrl.includes("placehold.co")) {
            const sku = product.mainImage || product.sku;
            loadCoverForSku(sku).then((url) => {
                if (url && !url.includes("placehold.co")) {
                    setCurrentUrl(url);
                    setImgError(false);
                }
            });
        } else {
            setCurrentUrl(imageUrl);
        }
    }, [imageUrl, product.mainImage, product.sku]);

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            sku: product.sku,
            name: product.name,
            price: product.price,
            image: currentUrl,
            category: product.category,
        });
    };

    // Variant thumbnails: extraPhotos images
    const variants = product.extraPhotos || [];
    const variantCount = variants.length;

    return (
        <Link to={`/producto/${encodeURIComponent(product.sku)}`} className="product-card">
            <div className="product-card__image-wrapper">
                {!imgError ? (
                    <img
                        src={currentUrl}
                        alt={product.name}
                        className="product-card__image"
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="product-card__placeholder">
                        <ImageOff size={40} />
                        <span>{product.sku}</span>
                    </div>
                )}
                <span className="product-card__sku-badge">{product.sku}</span>
            </div>
            <div className="product-card__body">
                <p className="product-card__sku">{product.sku}</p>
                <h3 className="product-card__name">{product.name}</h3>
                <span
                    className="product-card__category"
                    style={{ color: GOLD_VINTAGE }}
                >
                    {product.category}
                </span>

                {/* Variant thumbnails — like the Visor */}
                {variantCount > 0 && (
                    <div className="product-card__variants">
                        {variants.slice(0, 4).map((v) => (
                            <VariantThumb key={v.sku} sku={v.sku} />
                        ))}
                        {variantCount > 0 && (
                            <span className="product-card__variant-count">
                                {variantCount} variante{variantCount !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                )}

                <div className="product-card__footer">
                    <span className="product-card__price">
                        {product.price > 0
                            ? `$ ${product.price.toLocaleString()}`
                            : "Consultar"}
                    </span>
                    <button onClick={handleAdd} className="product-card__add">
                        Añadir <Plus size={12} />
                    </button>
                </div>
            </div>
        </Link>
    );
}

function VariantThumb({ sku }) {
    const [err, setErr] = useState(false);
    const [url, setUrl] = useState(() => getProductImageUrl(sku));

    useEffect(() => {
        if (url.includes("placehold.co")) {
            loadCoverForSku(sku).then((newUrl) => {
                if (newUrl && !newUrl.includes("placehold.co")) {
                    setUrl(newUrl);
                    setErr(false);
                }
            });
        }
    }, [sku, url]);

    const isPlaceholder = url.includes("placehold.co");

    if (isPlaceholder || err) {
        return (
            <span className="product-card__variant-thumb product-card__variant-thumb--empty">
                {sku.split(/[-F]/).pop()}
            </span>
        );
    }

    return (
        <img
            src={url}
            alt={sku}
            className="product-card__variant-thumb"
            loading="lazy"
            onError={() => setErr(true)}
        />
    );
}
