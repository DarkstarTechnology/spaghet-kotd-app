import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Shop from "./pages/Shop";
import Raid from "./pages/Raid";

sessionStorage.setItem('tabID', new Date().getTime());

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="boss-list" replace />} />
          <Route path="boss-list" element={<Home />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="shop" element={<Shop />} />
          <Route path="raid/" element={<Raid />} />
          <Route path="raid/:bossID" element={<Raid />} />
          <Route path="*" element={<Navigate to="boss-list" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
