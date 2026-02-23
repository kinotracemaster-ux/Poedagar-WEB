import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, Menu, X, ShoppingBag, Search } from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
    { to: "/", label: "Inicio" },
    { to: "/catalogo", label: "Colecciones" },
    { to: "/admin", label: "Atelier" },
];

export default function Navbar({ onOpenCart }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { cartCount } = useCart();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    return (
        <nav
            className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
        >
            <div className="navbar__inner">
                <div className="navbar__row">
                    {/* Logo */}
                    <Link to="/" className="navbar__logo">
                        <Clock className="navbar__logo-icon" style={{ color: GOLD_VINTAGE }} />
                        <div className="navbar__logo-text">
                            <span className="navbar__brand">Poedagar</span>
                            <span className="navbar__tagline">Atelier de Luxe</span>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="navbar__links">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`navbar__link ${location.pathname === link.to ? "navbar__link--active" : ""}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="navbar__actions">
                        <Link to="/catalogo" className="navbar__search-btn">
                            <Search size={18} />
                        </Link>

                        <button onClick={onOpenCart} className="navbar__cart-btn">
                            <span className="navbar__cart-label">Pedido</span>
                            <ShoppingBag size={18} />
                            {cartCount > 0 && (
                                <span className="navbar__badge">{cartCount}</span>
                            )}
                        </button>

                        <button
                            className="navbar__mobile-toggle"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="navbar__mobile-menu">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`navbar__mobile-link ${location.pathname === link.to ? "navbar__link--active" : ""}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
