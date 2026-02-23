import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "poedagar_cart";

function loadCartFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCartToStorage(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function cartReducer(state, action) {
    let newState;
    switch (action.type) {
        case "ADD_ITEM": {
            const exists = state.find((item) => item.sku === action.product.sku);
            if (exists) {
                newState = state.map((item) =>
                    item.sku === action.product.sku
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                newState = [...state, { ...action.product, quantity: 1 }];
            }
            break;
        }
        case "REMOVE_ITEM":
            newState = state.filter((item) => item.sku !== action.sku);
            break;
        case "UPDATE_QUANTITY":
            newState = state.map((item) =>
                item.sku === action.sku
                    ? { ...item, quantity: Math.max(1, item.quantity + action.delta) }
                    : item
            );
            break;
        case "CLEAR":
            newState = [];
            break;
        default:
            return state;
    }
    saveCartToStorage(newState);
    return newState;
}

export function CartProvider({ children }) {
    const [cart, dispatch] = useReducer(cartReducer, [], loadCartFromStorage);

    useEffect(() => {
        saveCartToStorage(cart);
    }, [cart]);

    const addToCart = (product) =>
        dispatch({ type: "ADD_ITEM", product });

    const removeFromCart = (sku) =>
        dispatch({ type: "REMOVE_ITEM", sku });

    const updateQuantity = (sku, delta) =>
        dispatch({ type: "UPDATE_QUANTITY", sku, delta });

    const clearCart = () => dispatch({ type: "CLEAR" });

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}
