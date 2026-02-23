import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { GOLD_VINTAGE, CATEGORIES, GENDERS } from "../utils/constants";
import ProductCard from "../components/ProductCard";
import { getProductImageUrl } from "../services/drive";

export default function CatalogPage({ products, loading }) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todos");
    const [gender, setGender] = useState("Todos");
    const [sortBy, setSortBy] = useState("name");
    const [showFilters, setShowFilters] = useState(false);

    const filtered = useMemo(() => {
        let result = [...products];

        // Filtrar por categoría
        if (category !== "Todos") {
            result = result.filter(
                (p) => p.category.toUpperCase() === category.toUpperCase()
            );
        }

        // Filtrar por género
        if (gender !== "Todos") {
            result = result.filter(
                (p) => p.gender.toLowerCase() === gender.toLowerCase()
            );
        }

        // Buscar por texto
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.sku.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
            );
        }

        // Ordenar
        switch (sortBy) {
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "sku":
                result.sort((a, b) => a.sku.localeCompare(b.sku));
                break;
            default:
                result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [products, category, gender, search, sortBy]);

    return (
        <main className="catalog-page">
            {/* Header */}
            <div className="catalog-page__header">
                <div className="catalog-page__title-area">
                    <span className="label-gold" style={{ color: GOLD_VINTAGE }}>
                        Catálogo de Temporada
                    </span>
                    <h1 className="page-title">Colecciones</h1>
                    <p className="page-subtitle">
                        Explore nuestra gama de piezas clásicas, deportivas y de edición limitada.
                    </p>
                </div>
            </div>

            {/* Category pills — siempre visibles */}
            <div className="catalog-categories">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`pill ${category === cat ? "pill--active" : ""}`}
                        style={category === cat ? { borderColor: GOLD_VINTAGE, color: GOLD_VINTAGE } : {}}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="catalog-filters">
                <div className="catalog-filters__search">
                    <Search size={18} className="catalog-filters__search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="catalog-filters__input"
                    />
                </div>

                <button
                    className="catalog-filters__toggle"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <SlidersHorizontal size={18} />
                    Filtros
                </button>
            </div>

            {/* Filter Bar */}
            <div className={`catalog-filters__bar ${showFilters ? "catalog-filters__bar--open" : ""}`}>
                <div className="catalog-filters__group">
                    <label>Género</label>
                    <div className="catalog-filters__pills">
                        {GENDERS.map((g) => (
                            <button
                                key={g}
                                onClick={() => setGender(g)}
                                className={`pill ${gender === g ? "pill--active" : ""}`}
                                style={gender === g ? { borderColor: GOLD_VINTAGE, color: GOLD_VINTAGE } : {}}
                            >
                                {g === "Todos" ? "Todos" : g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="catalog-filters__group">
                    <label>Ordenar</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="catalog-filters__select"
                    >
                        <option value="name">Nombre A-Z</option>
                        <option value="sku">SKU</option>
                        <option value="price-asc">Precio ↑</option>
                        <option value="price-desc">Precio ↓</option>
                    </select>
                </div>
            </div>

            {/* Results count */}
            <div className="catalog-page__count">
                <span>{filtered.length} producto{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Loading */}
            {loading && (
                <div className="catalog-page__loading">
                    <div className="spinner" />
                    <p>Cargando catálogo desde Google Sheets...</p>
                </div>
            )}

            {/* Grid */}
            {!loading && (
                <div className="product-grid">
                    {filtered.map((p) => (
                        <ProductCard
                            key={p.sku}
                            product={p}
                            imageUrl={getProductImageUrl(p.mainImage)}
                        />
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="catalog-page__empty">
                    <p>No hay piezas disponibles con los filtros seleccionados.</p>
                </div>
            )}
        </main>
    );
}
