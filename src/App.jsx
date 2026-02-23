import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { loadProducts } from "./services/sheets";
import { loadFileMapping } from "./services/drive";
import { applyOverrides } from "./pages/AdminPage";
import Navbar from "./components/Navbar";
import CartSidebar from "./components/CartSidebar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AdminPage from "./pages/AdminPage";
import AdminGate from "./components/AdminGate";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // 1. Cargar productos del Google Sheet
        const prods = await loadProducts();
        // 2. Aplicar overrides del admin (precios, etc.)
        const merged = applyOverrides(prods);
        setProducts(merged);
        setLoading(false);

        // 3. Cargar portadas desde el visor API (progresivo)
        await loadFileMapping(merged, () => {
          // Re-render después de cada lote para mostrar imágenes progresivamente
          setProducts((prev) => [...prev]);
        }).catch((err) =>
          console.warn("Error cargando portadas:", err)
        );
        // Render final con todas las portadas
        setProducts((prev) => [...prev]);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setLoading(false);
      }
    }
    init();
  }, []);

  // Cerrar carrito con Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <div className="app">
          <Navbar onOpenCart={() => setCartOpen(true)} />
          <CartSidebar
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
          />

          <Routes>
            <Route path="/" element={<HomePage products={products} />} />
            <Route
              path="/catalogo"
              element={
                <CatalogPage products={products} loading={loading} />
              }
            />
            <Route
              path="/producto/:sku"
              element={<ProductDetailPage products={products} />}
            />
            <Route
              path="/panel-admin"
              element={
                <AdminGate>
                  <AdminPage products={products} setProducts={setProducts} />
                </AdminGate>
              }
            />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orden/:id" element={<OrderConfirmationPage />} />
          </Routes>

          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
