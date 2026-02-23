import { X, Minus, Plus, Trash2, ShoppingBag, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { GOLD_VINTAGE, WHATSAPP_NUMBER } from "../utils/constants";

export default function CartSidebar({ isOpen, onClose }) {
    const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
    const navigate = useNavigate();

    const sendWhatsApp = () => {
        let msg = "🏛️ *ORDEN DE COMPRA - POEDAGAR WATCHES*\n";
        msg += "------------------------------------------\n";
        cart.forEach((item) => {
            const subtotal = item.price * item.quantity;
            msg += `• ${item.name} (${item.sku})\n  Cant: ${item.quantity}`;
            if (item.price > 0) msg += ` | Subtotal: $${subtotal.toLocaleString()}`;
            msg += "\n";
        });
        msg += "------------------------------------------\n";
        if (cartTotal > 0) {
            msg += `*TOTAL ESTIMADO:* $${cartTotal.toLocaleString()} USD\n\n`;
        }
        msg += "_Por favor, confírmenme disponibilidad y métodos de envío._";
        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
            "_blank"
        );
    };

    const goToCheckout = () => {
        onClose();
        navigate("/checkout");
    };

    if (!isOpen) return null;

    return (
        <div className="cart-overlay">
            <div className="cart-overlay__backdrop" onClick={onClose} />
            <div className="cart-sidebar">
                {/* Header */}
                <div className="cart-sidebar__header">
                    <div>
                        <h2 className="cart-sidebar__title">Su Selección</h2>
                        <p className="cart-sidebar__subtitle">Poedagar European Order</p>
                    </div>
                    <button onClick={onClose} className="cart-sidebar__close">
                        <X size={24} />
                    </button>
                </div>

                {/* Items */}
                <div className="cart-sidebar__items">
                    {cart.length === 0 ? (
                        <div className="cart-sidebar__empty">
                            <ShoppingBag size={48} />
                            <p>El carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.sku} className="cart-item">
                                <img
                                    src={item.image}
                                    className="cart-item__img"
                                    alt={item.name}
                                />
                                <div className="cart-item__info">
                                    <h4 className="cart-item__name">{item.name}</h4>
                                    <p className="cart-item__sku">{item.sku}</p>
                                    <p className="cart-item__price">
                                        {item.price > 0
                                            ? `$ ${item.price.toLocaleString()}`
                                            : "Consultar"}
                                    </p>
                                    <div className="cart-item__controls">
                                        <div className="cart-item__qty">
                                            <button onClick={() => updateQuantity(item.sku, -1)}>
                                                <Minus size={14} />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.sku, 1)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.sku)}
                                            className="cart-item__remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="cart-sidebar__footer">
                        <div className="cart-sidebar__total">
                            <span>Total Orden</span>
                            <span className="cart-sidebar__total-amount" style={{ color: GOLD_VINTAGE }}>
                                {cartTotal > 0 ? `$ ${cartTotal.toLocaleString()}` : "Consultar precios"}
                            </span>
                        </div>
                        <button onClick={goToCheckout} className="btn btn--primary btn--full">
                            Proceder al Checkout
                        </button>
                        <button onClick={sendWhatsApp} className="btn btn--outline btn--full">
                            Enviar por WhatsApp <ExternalLink size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
