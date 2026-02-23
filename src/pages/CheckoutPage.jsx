import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Truck, CreditCard, ExternalLink } from "lucide-react";
import { useCart } from "../context/CartContext";
import { GOLD_VINTAGE, WHATSAPP_NUMBER, SHIPPING_ZONES } from "../utils/constants";
import { calculateShipping, getZoneName } from "../utils/shipping";

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        zip: "",
        country: "Argentina",
        shippingZone: "local",
        notes: "",
    });

    const shippingCost = calculateShipping(form.shippingZone);
    const grandTotal = cartTotal + shippingCost;

    const updateField = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        // Generar orden
        const orderId = `PW-${Date.now().toString(36).toUpperCase()}`;
        const order = {
            id: orderId,
            date: new Date().toISOString(),
            customer: {
                name: form.name,
                email: form.email,
                phone: form.phone,
            },
            shipping: {
                street: form.street,
                city: form.city,
                zip: form.zip,
                country: form.country,
                zone: form.shippingZone,
                zoneName: getZoneName(form.shippingZone),
                cost: shippingCost,
            },
            items: cart.map((item) => ({
                sku: item.sku,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            })),
            subtotal: cartTotal,
            shippingCost,
            total: grandTotal,
            notes: form.notes,
        };

        // Guardar en localStorage
        const orders = JSON.parse(localStorage.getItem("poedagar_orders") || "[]");
        orders.push(order);
        localStorage.setItem("poedagar_orders", JSON.stringify(orders));

        clearCart();
        navigate(`/orden/${orderId}`, { state: { order } });
    };

    if (cart.length === 0) {
        return (
            <main className="checkout-page">
                <div className="checkout-page__empty">
                    <h2>Carrito vacío</h2>
                    <p>Agrega productos antes de proceder al checkout.</p>
                    <Link to="/catalogo" className="btn btn--primary">
                        Ir al Catálogo
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <button onClick={() => navigate(-1)} className="detail-page__back">
                <ArrowLeft size={18} /> Volver
            </button>

            <h1 className="page-title">Checkout</h1>

            <form onSubmit={handleSubmit} className="checkout-grid">
                {/* Left: Forms */}
                <div className="checkout-forms">
                    {/* Customer Info */}
                    <div className="checkout-section">
                        <h2 className="checkout-section__title">
                            <CreditCard size={20} style={{ color: GOLD_VINTAGE }} />
                            Datos del Cliente
                        </h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre completo *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono *</label>
                                <input
                                    type="tel"
                                    required
                                    value={form.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="checkout-section">
                        <h2 className="checkout-section__title">
                            <Truck size={20} style={{ color: GOLD_VINTAGE }} />
                            Dirección de Envío
                        </h2>
                        <div className="form-group">
                            <label>Calle y número *</label>
                            <input
                                type="text"
                                required
                                value={form.street}
                                onChange={(e) => updateField("street", e.target.value)}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Ciudad *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.city}
                                    onChange={(e) => updateField("city", e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Código Postal</label>
                                <input
                                    type="text"
                                    value={form.zip}
                                    onChange={(e) => updateField("zip", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>País</label>
                            <input
                                type="text"
                                value={form.country}
                                onChange={(e) => updateField("country", e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Zona de envío *</label>
                            <div className="shipping-zones">
                                {SHIPPING_ZONES.map((zone) => (
                                    <label
                                        key={zone.id}
                                        className={`shipping-zone ${form.shippingZone === zone.id ? "shipping-zone--active" : ""}`}
                                        style={
                                            form.shippingZone === zone.id
                                                ? { borderColor: GOLD_VINTAGE }
                                                : {}
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="shippingZone"
                                            value={zone.id}
                                            checked={form.shippingZone === zone.id}
                                            onChange={(e) =>
                                                updateField("shippingZone", e.target.value)
                                            }
                                        />
                                        <span className="shipping-zone__name">{zone.name}</span>
                                        <span className="shipping-zone__price">
                                            $ {zone.price.toLocaleString()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Notas del pedido</label>
                            <textarea
                                rows={3}
                                value={form.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                placeholder="Instrucciones especiales para el envío..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="checkout-summary">
                    <div className="checkout-summary__card">
                        <h3 className="checkout-summary__title">Resumen del Pedido</h3>
                        <div className="checkout-summary__items">
                            {cart.map((item) => (
                                <div key={item.sku} className="checkout-summary__item">
                                    <img src={item.image} alt={item.name} />
                                    <div>
                                        <p className="checkout-summary__item-name">{item.name}</p>
                                        <p className="checkout-summary__item-sku">{item.sku}</p>
                                        <p>Cant: {item.quantity}</p>
                                    </div>
                                    <span>
                                        {item.price > 0
                                            ? `$${(item.price * item.quantity).toLocaleString()}`
                                            : "Consultar"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="checkout-summary__totals">
                            <div className="checkout-summary__row">
                                <span>Subtotal</span>
                                <span>
                                    {cartTotal > 0 ? `$${cartTotal.toLocaleString()}` : "—"}
                                </span>
                            </div>
                            <div className="checkout-summary__row">
                                <span>Envío ({getZoneName(form.shippingZone)})</span>
                                <span>${shippingCost.toLocaleString()}</span>
                            </div>
                            <div className="checkout-summary__row checkout-summary__row--total">
                                <span>Total</span>
                                <span style={{ color: GOLD_VINTAGE }}>
                                    {grandTotal > 0 ? `$${grandTotal.toLocaleString()}` : "Consultar"}
                                </span>
                            </div>
                        </div>

                        <button type="submit" className="btn btn--primary btn--full btn--lg">
                            Confirmar Pedido
                        </button>
                    </div>
                </div>
            </form>
        </main>
    );
}
