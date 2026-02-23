import { GOLD_VINTAGE } from "../utils/constants";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__brand">
                    <img
                        src="/logo-poedagar.webp"
                        alt="Poedagar"
                        className="footer__icon"
                        style={{ filter: "brightness(0) invert(1)" }}
                    />
                    <span className="footer__name">Poedagar</span>
                </div>
                <p className="footer__quote">
                    Elegancia y diseño único en cada pieza.
                    Tu estilo, tu tiempo.
                </p>
                <div className="footer__divider" />
                <div className="footer__bottom">
                    <p className="footer__copy">
                        © 2026 Poedagar Colombia. Todos los derechos reservados.
                    </p>
                    <div className="footer__links">
                        <span>Contacto</span>
                        <span>Términos</span>
                        <span>Privacidad</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
