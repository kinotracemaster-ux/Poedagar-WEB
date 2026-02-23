import { Link } from "react-router-dom";
import { Plus, ImageOff } from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";
import { useCart } from "../context/CartContext";
import { useState } from "react";

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
            </div>
            <div className="product-card__body">
                <span
                    className="product-card__category"
                    style={{ color: GOLD_VINTAGE }}
                >
                    {product.category}
                </span>
                <h3 className="product-card__name">{product.name}</h3>
                <p className="product-card__sku">SKU: {product.sku}</p>
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
