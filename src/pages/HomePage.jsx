import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Package, Clock, ArrowRight } from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";
import ProductCard from "../components/ProductCard";
import { getProductImageUrl } from "../services/drive";
import { useMemo } from "react";
import InstagramCarousel from "../components/InstagramCarousel";

const BANNER_IMG = "/portada-hero.png";

const FEATURES = [
    { icon: ShieldCheck, title: "Calidad", desc: "Diseño único y resistente" },
    { icon: Package, title: "Envío", desc: "Entrega segura a tu puerta" },
    { icon: Clock, title: "Elegancia", desc: "Estilo que perdura" },
];

// Category display info
const CATEGORY_DESC = {
    CLASICO: "Elegancia atemporal para quienes valoran la tradición.",
    DEPORTIVO: "Resistencia y estilo para un ritmo de vida activo.",
};

export default function HomePage({ products = [] }) {
    const navigate = useNavigate();

    // 20 últimas referencias
    const latestProducts = products.slice(0, 20);

    // Products grouped by category — only categories that actually exist
    const categoriesWithProducts = useMemo(() => {
        const catMap = new Map();
        for (const p of products) {
            const key = (p.category || "").toUpperCase();
            if (!key) continue;
            if (!catMap.has(key)) catMap.set(key, []);
            catMap.get(key).push(p);
        }
        return Array.from(catMap.entries())
            .map(([key, items]) => ({
                key,
                title: key.charAt(0) + key.slice(1).toLowerCase(),
                desc: CATEGORY_DESC[key] || "",
                items,
            }))
            .sort((a, b) => a.key.localeCompare(b.key));
    }, [products]);

    return (
        <main>
            {/* Hero */}
            <section className="hero">
                <div className="hero__bg">
                    <img src={BANNER_IMG} className="hero__img" alt="Poedagar Watches" />
                    <div className="hero__gradient" />
                </div>
                <div className="hero__content hero__content--bottom">
                    <span className="hero__subtitle animate-fade-up">
                        Poedagar
                    </span>
                    <h1 className="hero__title hero__title--compact animate-fade-up delay-200">
                        Elegancia & Diseño Único
                    </h1>
                    <p className="hero__desc animate-fade-up delay-500">
                        Relojes de lujo para quienes aprecian el valor del tiempo.
                    </p>
                    <button
                        onClick={() => navigate("/catalogo")}
                        className="btn btn--hero"
                    >
                        Ver Colección
                    </button>
                </div>
            </section>

            {/* Pre-catálogo — Últimas Referencias */}
            {latestProducts.length > 0 && (
                <section className="home-catalog">
                    <div className="home-catalog__header">
                        <span className="label-gold" style={{ color: GOLD_VINTAGE }}>
                            Novedades
                        </span>
                        <h2 className="page-title">Últimas Referencias</h2>
                        <p className="page-subtitle">
                            Descubre las piezas más recientes de nuestra colección.
                        </p>
                    </div>
                    <div className="product-grid">
                        {latestProducts.map((p) => (
                            <ProductCard
                                key={p.sku}
                                product={p}
                                imageUrl={getProductImageUrl(p.mainImage)}
                            />
                        ))}
                    </div>
                    <div className="home-catalog__cta">
                        <Link to="/catalogo" className="btn btn--outline">
                            Ver Todo el Catálogo <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>
            )}

            {/* Colecciones por Categoría */}
            {categoriesWithProducts.length > 0 && (
                <section className="home-collections">
                    <div className="home-collections__header">
                        <span className="label-gold" style={{ color: GOLD_VINTAGE }}>
                            Nuestras Colecciones
                        </span>
                        <h2 className="page-title">Colecciones</h2>
                        <p className="page-subtitle">
                            Explora nuestras líneas diseñadas para cada estilo de vida.
                        </p>
                    </div>
                    <div className="home-collections__list">
                        {categoriesWithProducts.map((cat) => (
                            <div key={cat.key} className="home-collection-block">
                                <div className="home-collection-block__header">
                                    <h3 className="home-collection-block__title">
                                        {cat.title}
                                    </h3>
                                    {cat.desc && (
                                        <p className="home-collection-block__desc">
                                            {cat.desc}
                                        </p>
                                    )}
                                    <Link
                                        to={`/catalogo?cat=${encodeURIComponent(cat.key)}`}
                                        className="home-collection-block__link"
                                        style={{ color: GOLD_VINTAGE }}
                                    >
                                        Ver todos <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="product-grid product-grid--sm">
                                    {cat.items.slice(0, 4).map((p) => (
                                        <ProductCard
                                            key={p.sku}
                                            product={p}
                                            imageUrl={getProductImageUrl(p.mainImage)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <InstagramCarousel />

            {/* Features */}
            <section className="features-bar">
                <div className="features-bar__inner">
                    {FEATURES.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div key={i} className="feature-item">
                                <div
                                    className="feature-item__icon"
                                    style={{ borderColor: `${GOLD_VINTAGE}55`, color: GOLD_VINTAGE }}
                                >
                                    <Icon size={28} />
                                </div>
                                <div className="feature-item__text">
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
