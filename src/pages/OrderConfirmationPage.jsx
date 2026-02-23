import { useParams, useLocation, Link } from "react-router-dom";
import { CheckCircle, ExternalLink, ArrowRight } from "lucide-react";
import { GOLD_VINTAGE, WHATSAPP_NUMBER } from "../utils/constants";

export default function OrderConfirmationPage() {
    const { id } = useParams();
    const location = useLocation();
    const order = location.state?.order || loadOrder(id);

    const sendWhatsApp = () => {
        if (!order) return;
        let msg = `🏛️ *ORDEN DE COMPRA - POEDAGAR WATCHES*\n`;
        msg += `📋 Orden: *${order.id}*\n`;
        msg += `👤 Cliente: ${order.customer.name}\n`;
        msg += `📱 Tel: ${order.customer.phone}\n`;
        msg += `------------------------------------------\n`;
        order.items.forEach((item) => {
            msg += `• ${item.name} (${item.sku})\n  Cant: ${item.quantity}`;
            if (item.price > 0)
                msg += ` | Subtotal: $${(item.price * item.quantity).toLocaleString()}`;
            msg += "\n";
        });
        msg += `------------------------------------------\n`;
        msg += `📦 Envío: ${order.shipping.zoneName} — $${order.shippingCost.toLocaleString()}\n`;
        msg += `📍 ${order.shipping.street}, ${order.shipping.city} ${order.shipping.zip}, ${order.shipping.country}\n`;
        if (order.total > 0) {
            msg += `\n*TOTAL:* $${order.total.toLocaleString()} USD\n`;
        }
        if (order.notes) {
            msg += `\n📝 Notas: ${order.notes}\n`;
        }
        msg += `\n_Pedido generado el ${new Date(order.date).toLocaleString()}_`;

        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
            "_blank"
        );
    };

    if (!order) {
        return (
            <main className="confirm-page">
                <div className="confirm-page__not-found">
                    <h2>Orden no encontrada</h2>
                    <Link to="/catalogo" className="btn btn--primary">
                        Volver al Catálogo
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="confirm-page">
            <div className="confirm-card">
                <div className="confirm-card__header">
                    <CheckCircle size={64} style={{ color: "#22c55e" }} />
                    <h1>¡Pedido Confirmado!</h1>
                    <p className="confirm-card__order-id" style={{ color: GOLD_VINTAGE }}>
                        Orden: {order.id}
                    </p>
                </div>

                <div className="confirm-card__details">
                    <div className="confirm-detail">
                        <h3>Cliente</h3>
                        <p>{order.customer.name}</p>
                        <p>{order.customer.email}</p>
                        <p>{order.customer.phone}</p>
                    </div>

                    <div className="confirm-detail">
                        <h3>Envío</h3>
                        <p>{order.shipping.street}</p>
                        <p>
                            {order.shipping.city} {order.shipping.zip}
                        </p>
                        <p>{order.shipping.country}</p>
                        <p className="confirm-detail__zone">
                            {order.shipping.zoneName} — ${order.shippingCost.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="confirm-card__items">
                    <h3>Productos</h3>
                    {order.items.map((item) => (
                        <div key={item.sku} className="confirm-item">
                            <span>
                                {item.name} ({item.sku}) × {item.quantity}
                            </span>
                            <span>
                                {item.price > 0
                                    ? `$${(item.price * item.quantity).toLocaleString()}`
                                    : "Consultar"}
                            </span>
                        </div>
                    ))}
                    <div className="confirm-total">
                        <span>Total</span>
                        <span style={{ color: GOLD_VINTAGE }}>
                            {order.total > 0 ? `$${order.total.toLocaleString()}` : "Consultar precios"}
                        </span>
                    </div>
                </div>

                <div className="confirm-card__actions">
                    <button onClick={sendWhatsApp} className="btn btn--primary btn--full btn--lg">
                        Enviar Pedido por WhatsApp <ExternalLink size={16} />
                    </button>
                    <Link to="/catalogo" className="btn btn--outline btn--full">
                        Seguir Comprando <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </main>
    );
}

function loadOrder(id) {
    try {
        const orders = JSON.parse(localStorage.getItem("poedagar_orders") || "[]");
        return orders.find((o) => o.id === id) || null;
    } catch {
        return null;
    }
}
