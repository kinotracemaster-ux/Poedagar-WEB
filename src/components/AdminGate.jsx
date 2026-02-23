import { useState } from "react";
import { Lock } from "lucide-react";

const ADMIN_PASSWORD = "poedagar2026";

export default function AdminGate({ children }) {
    const [authenticated, setAuthenticated] = useState(
        () => sessionStorage.getItem("admin_auth") === "true"
    );
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem("admin_auth", "true");
            setAuthenticated(true);
            setError(false);
        } else {
            setError(true);
        }
    };

    if (authenticated) return children;

    return (
        <main className="admin-gate">
            <div className="admin-gate__card">
                <div className="admin-gate__icon">
                    <Lock size={32} />
                </div>
                <h2 className="admin-gate__title">Panel de Administración</h2>
                <p className="admin-gate__desc">
                    Ingresa la contraseña para acceder al panel.
                </p>
                <form onSubmit={handleSubmit} className="admin-gate__form">
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError(false);
                        }}
                        className={`admin-gate__input ${error ? "admin-gate__input--error" : ""}`}
                        autoFocus
                    />
                    {error && (
                        <span className="admin-gate__error">
                            Contraseña incorrecta
                        </span>
                    )}
                    <button type="submit" className="btn btn--primary btn--lg">
                        Ingresar
                    </button>
                </form>
            </div>
        </main>
    );
}
