import { useNavigate } from "react-router-dom";
import { ShieldCheck, Package, Clock } from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";

const BANNER_IMG = "/portada-hero.png";
const ATELIER_IMG =
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1200";

const FEATURES = [
    { icon: ShieldCheck, title: "Calidad", desc: "Diseño único y resistente" },
    { icon: Package, title: "Envío", desc: "Entrega segura a tu puerta" },
    { icon: Clock, title: "Elegancia", desc: "Estilo que perdura" },
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
                        Elegancia & Diseño Único
                    </span>
                    <h1 className="hero__title animate-fade-up delay-200">
                        Relojes de lujo para quienes aprecian el valor del tiempo
                    </h1>
                    <p className="hero__desc animate-fade-up delay-500">
                        Cada reloj Poedagar es una declaración de estilo.
                        Diseño exclusivo, materiales premium y atención al detalle.
                    </p>
                    <button
                        onClick={() => navigate("/catalogo")}
                        className="btn btn--hero"
                    >
                        Ver Colección
                    </button>
                </div>
            </section>

            {/* Atelier */}
            <section className="atelier">
                <div className="atelier__grid">
                    <div className="atelier__image-wrapper">
                        <img src={ATELIER_IMG} className="atelier__image" alt="Poedagar" />
                        <div className="atelier__frame" style={{ borderColor: `${GOLD_VINTAGE}33` }} />
                    </div>
                    <div className="atelier__info">
                        <h2
                            className="atelier__label"
                            style={{ color: GOLD_VINTAGE }}
                        >
                            Nuestra Esencia
                        </h2>
                        <h3 className="atelier__heading">
                            Elegancia en cada detalle
                        </h3>
                        <p className="atelier__text">
                            Cada pieza de nuestra colección refleja un compromiso con el diseño
                            y la calidad. No solo ofrecemos relojes, sino una experiencia de
                            estilo que habla por sí misma.
                        </p>
                        <div className="atelier__stats">
                            <div>
                                <span className="atelier__stat-number">+50</span>
                                <p className="atelier__stat-label">Modelos Exclusivos</p>
                            </div>
                            <div>
                                <span className="atelier__stat-number">100%</span>
                                <p className="atelier__stat-label">Garantía de Calidad</p>
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
