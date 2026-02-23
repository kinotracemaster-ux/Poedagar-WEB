import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
    ArrowLeft,
    Plus,
    Minus,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
    ImageOff,
} from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";
import { useCart } from "../context/CartContext";
import { getProductAllImages } from "../services/drive";
import ProductCard from "../components/ProductCard";
import { getProductImageUrl } from "../services/drive";

export default function ProductDetailPage({ products }) {
    const { sku } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [currentImg, setCurrentImg] = useState(0);
    const [imgError, setImgError] = useState({});

    const product = useMemo(
        () => products.find((p) => p.sku === decodeURIComponent(sku)),
        [products, sku]
    );

    const images = useMemo(() => {
        if (!product) return [];
        return getProductAllImages(product);
    }, [product]);

    const related = useMemo(() => {
        if (!product) return [];
        return products
            .filter((p) => p.category === product.category && p.sku !== product.sku)
            .slice(0, 4);
    }, [products, product]);

    if (!product) {
        return (
            <main className="detail-page">
                <div className="detail-page__not-found">
                    <h2>Producto no encontrado</h2>
                    <p>El SKU "{sku}" no existe en el catálogo.</p>
                    <Link to="/catalogo" className="btn btn--primary">
                        Volver al Catálogo
                    </Link>
                </div>
            </main>
        );
    }

    const handleAddToCart = () => {
        for (let i = 0; i < qty; i++) {
            addToCart({
                sku: product.sku,
                name: product.name,
                price: product.price,
                image: images[0]?.url || "",
                category: product.category,
            });
        }
    };

    const prevImg = () =>
        setCurrentImg((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    const nextImg = () =>
        setCurrentImg((prev) => (prev < images.length - 1 ? prev + 1 : 0));

    return (
        <main className="detail-page">
            <button onClick={() => navigate(-1)} className="detail-page__back">
                <ArrowLeft size={18} /> Volver
            </button>

            <div className="detail-page__grid">
                {/* Gallery */}
                <div className="detail-gallery">
                    <div className="detail-gallery__main">
                        {images.length > 0 && !imgError[currentImg] ? (
                            <img
                                src={images[currentImg]?.url}
                                alt={product.name}
                                className="detail-gallery__img"
                                onError={() =>
                                    setImgError((prev) => ({ ...prev, [currentImg]: true }))
                                }
                            />
                        ) : (
                            <div className="detail-gallery__placeholder">
                                <ImageOff size={64} />
                                <span>{product.sku}</span>
                            </div>
                        )}
                        {images.length > 1 && (
                            <>
                                <button onClick={prevImg} className="detail-gallery__nav detail-gallery__nav--prev">
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={nextImg} className="detail-gallery__nav detail-gallery__nav--next">
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="detail-gallery__thumbs">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImg(i)}
                                    className={`detail-gallery__thumb ${currentImg === i ? "detail-gallery__thumb--active" : ""}`}
                                >
                                    <img
                                        src={img.url}
                                        alt={`${product.name} - ${i + 1}`}
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="detail-info">
                    <span className="detail-info__category" style={{ color: GOLD_VINTAGE }}>
                        {product.category}
                    </span>
                    <h1 className="detail-info__name">{product.name}</h1>
                    <p className="detail-info__sku">SKU: {product.sku}</p>

                    <div className="detail-info__price">
                        {product.price > 0
                            ? `$ ${product.price.toLocaleString()}`
                            : "Consultar precio"}
                    </div>

                    <p className="detail-info__desc">{product.description}</p>

                    <div className="detail-info__meta">
                        <div className="detail-info__meta-item">
                            <span className="detail-info__meta-label">Género</span>
                            <span>{product.gender}</span>
                        </div>
                        <div className="detail-info__meta-item">
                            <span className="detail-info__meta-label">Movimiento</span>
                            <span>{product.movement}</span>
                        </div>
                    </div>

                    <div className="detail-info__actions">
                        <div className="qty-selector">
                            <button onClick={() => setQty(Math.max(1, qty - 1))}>
                                <Minus size={16} />
                            </button>
                            <span>{qty}</span>
                            <button onClick={() => setQty(qty + 1)}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <button onClick={handleAddToCart} className="btn btn--primary btn--lg">
                            <ShoppingBag size={18} /> Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
                <section className="detail-related">
                    <h2 className="detail-related__title">Productos Relacionados</h2>
                    <div className="product-grid product-grid--sm">
                        {related.map((p) => (
                            <ProductCard
                                key={p.sku}
                                product={p}
                                imageUrl={getProductImageUrl(p.mainImage)}
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
