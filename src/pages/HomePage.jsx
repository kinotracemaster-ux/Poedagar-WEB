import { useNavigate } from "react-router-dom";
import { ShieldCheck, Package, Clock } from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";

const BANNER_IMG =
    "https://images.unsplash.com/photo-1547996160-81dfa63595dd?auto=format&fit=crop&q=80&w=2000";
const ATELIER_IMG =
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1200";

const FEATURES = [
    { icon: ShieldCheck, title: "Seguridad", desc: "Certificado de origen" },
    { icon: Package, title: "Logística", desc: "Envío prioritario" },
    { icon: Clock, title: "Soporte", desc: "Asistencia Atelier" },
];

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <main>
            {/* Hero */}
            <section className="hero">
                <div className="hero__bg">
                    <img src={BANNER_IMG} className="hero__img" alt="Poedagar Watches" />
                    <div className="hero__gradient" />
                </div>
                <div className="hero__content">
                    <span className="hero__subtitle animate-fade-up">
                        Manufactura Europea - Est. 1998
                    </span>
                    <h1 className="hero__title animate-fade-up delay-200">
                        Poedagar Watches
                    </h1>
                    <p className="hero__desc animate-fade-up delay-500">
                        "El tiempo es el único lujo que no se puede fabricar, pero sí se
                        puede vestir con elegancia."
                    </p>
                    <button
                        onClick={() => navigate("/catalogo")}
                        className="btn btn--hero"
                    >
                        Explorar Colecciones
                    </button>
                </div>
            </section>

            {/* Atelier */}
            <section className="atelier">
                <div className="atelier__grid">
                    <div className="atelier__image-wrapper">
                        <img src={ATELIER_IMG} className="atelier__image" alt="Atelier" />
                        <div className="atelier__frame" style={{ borderColor: `${GOLD_VINTAGE}33` }} />
                    </div>
                    <div className="atelier__info">
                        <h2
                            className="atelier__label"
                            style={{ color: GOLD_VINTAGE }}
                        >
                            L'Atelier
                        </h2>
                        <h3 className="atelier__heading">
                            Artesanía Europea con Alma Moderna
                        </h3>
                        <p className="atelier__text">
                            Cada pieza de nuestra colección es seleccionada bajo estándares de
                            calidad ginebrinos. No solo vendemos un instrumento para medir el
                            tiempo, sino una joya que cuenta su historia.
                        </p>
                        <div className="atelier__stats">
                            <div>
                                <span className="atelier__stat-number">27</span>
                                <p className="atelier__stat-label">Años de Tradición</p>
                            </div>
                            <div>
                                <span className="atelier__stat-number">100%</span>
                                <p className="atelier__stat-label">Garantía Atelier</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
