import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CartProvider } from "react-use-cart";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>
);
