import { Link } from "react-router-dom";
import { Plus, ImageOff } from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import { getProductImageUrl } from "../services/drive";

export default function ProductCard({ product, imageUrl }) {
    const { addToCart } = useCart();
    const [imgError, setImgError] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            sku: product.sku,
            name: product.name,
            price: product.price,
            image: imageUrl,
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
                        src={imageUrl}
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
    const url = getProductImageUrl(sku);
    const isPlaceholder = url.startsWith("data:");

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
