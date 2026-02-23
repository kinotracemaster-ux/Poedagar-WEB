import { useState, useMemo } from "react";
import {
    Search,
    Edit3,
    Trash2,
    Plus,
    X,
    Package,
    DollarSign,
    Layers,
    Save,
} from "lucide-react";
import { GOLD_VINTAGE, CATEGORIES } from "../utils/constants";
import { getProductImageUrl } from "../services/drive";

export default function AdminPage({ products, setProducts }) {
    const [search, setSearch] = useState("");
    const [editProduct, setEditProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Stats
    const stats = useMemo(() => {
        const cats = {};
        products.forEach((p) => {
            cats[p.category] = (cats[p.category] || 0) + 1;
        });
        const withPrice = products.filter((p) => p.price > 0).length;
        return {
            total: products.length,
            withPrice,
            withoutPrice: products.length - withPrice,
            categories: cats,
        };
    }, [products]);

    const filtered = useMemo(() => {
        if (!search.trim()) return products;
        const q = search.toLowerCase();
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
        );
    }, [products, search]);

    const handleEdit = (product) => {
        setEditProduct({ ...product });
        setShowForm(true);
    };

    const handleDelete = (sku) => {
        if (window.confirm(`¿Eliminar producto ${sku}?`)) {
            const updated = products.filter((p) => p.sku !== sku);
            setProducts(updated);
            saveOverrides(updated);
        }
    };

    const handleSave = () => {
        if (!editProduct) return;
        const exists = products.find((p) => p.sku === editProduct.sku);
        let updated;
        if (exists) {
            updated = products.map((p) =>
                p.sku === editProduct.sku ? { ...p, ...editProduct } : p
            );
        } else {
            updated = [...products, editProduct];
        }
        setProducts(updated);
        saveOverrides(updated);
        setShowForm(false);
        setEditProduct(null);
    };

    const handleNewProduct = () => {
        setEditProduct({
            sku: "",
            name: "",
            category: "CLASICO",
            gender: "hombre",
            movement: "",
            price: 0,
            description: "",
            status: "active",
            mainImage: "",
            extraPhotos: [],
            videos: [],
        });
        setShowForm(true);
    };

    return (
        <main className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="page-title">Panel de Inventario</h1>
                    <p className="page-subtitle">Gestión de productos del Atelier</p>
                </div>
                <button onClick={handleNewProduct} className="btn btn--primary">
                    <Plus size={16} /> Nuevo Producto
                </button>
            </div>

            {/* Stats */}
            <div className="admin-stats">
                <div className="admin-stat">
                    <Package size={24} style={{ color: GOLD_VINTAGE }} />
                    <div>
                        <span className="admin-stat__number">{stats.total}</span>
                        <span className="admin-stat__label">Productos</span>
                    </div>
                </div>
                <div className="admin-stat">
                    <DollarSign size={24} style={{ color: "#22c55e" }} />
                    <div>
                        <span className="admin-stat__number">{stats.withPrice}</span>
                        <span className="admin-stat__label">Con precio</span>
                    </div>
                </div>
                <div className="admin-stat">
                    <DollarSign size={24} style={{ color: "#ef4444" }} />
                    <div>
                        <span className="admin-stat__number">{stats.withoutPrice}</span>
                        <span className="admin-stat__label">Sin precio</span>
                    </div>
                </div>
                <div className="admin-stat">
                    <Layers size={24} style={{ color: "#6366f1" }} />
                    <div>
                        <span className="admin-stat__number">
                            {Object.keys(stats.categories).length}
                        </span>
                        <span className="admin-stat__label">Categorías</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="admin-search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Buscar en inventario..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>SKU</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Género</th>
                            <th>Precio</th>
                            <th>Fotos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p) => (
                            <tr key={p.sku}>
                                <td>
                                    <img
                                        src={getProductImageUrl(p.mainImage)}
                                        alt={p.name}
                                        className="admin-table__img"
                                        onError={(e) => {
                                            e.target.src = `https://placehold.co/60x60/1a1a1a/C5A059?text=${p.sku.substring(0, 5)}`;
                                        }}
                                    />
                                </td>
                                <td className="admin-table__sku">{p.sku}</td>
                                <td>{p.name}</td>
                                <td>
                                    <span className="admin-table__cat">{p.category}</span>
                                </td>
                                <td>{p.gender}</td>
                                <td>
                                    {p.price > 0 ? (
                                        `$${p.price.toLocaleString()}`
                                    ) : (
                                        <span className="text-muted">Sin precio</span>
                                    )}
                                </td>
                                <td>{1 + p.extraPhotos.length}</td>
                                <td>
                                    <div className="admin-table__actions">
                                        <button
                                            onClick={() => handleEdit(p)}
                                            className="admin-action admin-action--edit"
                                            title="Editar"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.sku)}
                                            className="admin-action admin-action--delete"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div className="admin-table__empty">
                    <p>No se encontraron productos.</p>
                </div>
            )}

            {/* Edit/Create Modal */}
            {showForm && editProduct && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal__header">
                            <h2>{editProduct.sku ? "Editar Producto" : "Nuevo Producto"}</h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditProduct(null);
                                }}
                                className="modal__close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal__body">
                            <div className="form-group">
                                <label>SKU</label>
                                <input
                                    type="text"
                                    value={editProduct.sku}
                                    onChange={(e) =>
                                        setEditProduct({ ...editProduct, sku: e.target.value })
                                    }
                                    disabled={products.some((p) => p.sku === editProduct.sku)}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        value={editProduct.name}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select
                                        value={editProduct.category}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, category: e.target.value })
                                        }
                                    >
                                        {CATEGORIES.filter((c) => c !== "Todos").map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Precio</label>
                                    <input
                                        type="number"
                                        value={editProduct.price}
                                        onChange={(e) =>
                                            setEditProduct({
                                                ...editProduct,
                                                price: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Género</label>
                                    <select
                                        value={editProduct.gender}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, gender: e.target.value })
                                        }
                                    >
                                        <option value="hombre">Hombre</option>
                                        <option value="mujer">Mujer</option>
                                        <option value="HOGAR">Hogar</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={editProduct.description}
                                    onChange={(e) =>
                                        setEditProduct({
                                            ...editProduct,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Movimiento</label>
                                <input
                                    type="text"
                                    value={editProduct.movement}
                                    onChange={(e) =>
                                        setEditProduct({
                                            ...editProduct,
                                            movement: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditProduct(null);
                                }}
                                className="btn btn--outline"
                            >
                                Cancelar
                            </button>
                            <button onClick={handleSave} className="btn btn--primary">
                                <Save size={16} /> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

// Guardar overrides en localStorage
function saveOverrides(products) {
    try {
        const overrides = {};
        products.forEach((p) => {
            overrides[p.sku] = {
                price: p.price,
                name: p.name,
                category: p.category,
                gender: p.gender,
                description: p.description,
                movement: p.movement,
            };
        });
        localStorage.setItem("poedagar_product_overrides", JSON.stringify(overrides));
    } catch (e) {
        console.warn("Error guardando overrides", e);
    }
}

export function loadOverrides() {
    try {
        const stored = localStorage.getItem("poedagar_product_overrides");
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

export function applyOverrides(products) {
    const overrides = loadOverrides();
    return products.map((p) => {
        if (overrides[p.sku]) {
            return { ...p, ...overrides[p.sku] };
        }
        return p;
    });
}
