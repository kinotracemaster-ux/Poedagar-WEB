import { Clock } from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__brand">
                    <Clock className="footer__icon" style={{ color: GOLD_VINTAGE }} />
                    <span className="footer__name">Poedagar</span>
                </div>
                <p className="footer__quote">
                    "La precisión europea en su muñeca. Poedagar Watches, donde el tiempo
                    se convierte en legado."
                </p>
                <div className="footer__divider" />
                <div className="footer__bottom">
                    <p className="footer__copy">
                        © 2026 Poedagar Atelier de Luxe. Todos los derechos reservados.
                    </p>
                    <div className="footer__links">
                        <span>Historia</span>
                        <span>Términos</span>
                        <span>Privacidad</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
