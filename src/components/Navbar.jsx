import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
    { to: "/", label: "Inicio" },
    { to: "/catalogo", label: "Colecciones" },
];

export default function Navbar({ onOpenCart }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { cartCount } = useCart();
    const location = useLocation();

    // Subpages have light background — navbar must always be dark there
    const isHome = location.pathname === "/";
    const needsDarkBg = !isHome || scrolled;

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
            className={`navbar ${needsDarkBg ? "navbar--scrolled" : ""}`}
        >
            <div className="navbar__inner">
                <div className="navbar__row">
                    {/* Logo — imagen reemplaza el texto del nombre */}
                    <Link to="/" className="navbar__logo">
                        <img
                            src="/logo-poedagar.webp"
                            alt="Poedagar"
                            className="navbar__logo-img"
                        />
                        <span className="navbar__tagline">Elegancia & Diseño Único</span>
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
