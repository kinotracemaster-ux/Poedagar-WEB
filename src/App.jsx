import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // Cargar datos en paralelo
        const [prods] = await Promise.all([
          loadProducts(),
          loadFileMapping().catch(() => ({})),
        ]);
        // Aplicar overrides del admin (precios, etc.)
        const merged = applyOverrides(prods);
        setProducts(merged);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
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
      <CartProvider>
        <div className="app">
          <Navbar onOpenCart={() => setCartOpen(true)} />
          <CartSidebar
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
          />

          <Routes>
            <Route path="/" element={<HomePage />} />
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
              path="/admin"
              element={
                <AdminPage products={products} setProducts={setProducts} />
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
