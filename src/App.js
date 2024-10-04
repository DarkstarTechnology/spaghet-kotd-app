import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import {Layout, Home, Inventory, Shop, Raid, Event} from "./pages";
import { useState } from 'react';

sessionStorage.setItem('tabID', new Date().getTime());

export default function App() {
  
  const [ storedPlayerName ] = useState(localStorage.getItem('storedPlayerName') || false);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="boss-list" replace />} />
          <Route path="boss-list" element={<Home />} />
          {storedPlayerName ? <Route path="inventory" element={<Inventory />} /> : <Route path="boss-list" element={<Home />} />}
          <Route path="shop" element={<Shop />} />
          <Route path="1000Doors" element={<Event />} />
          {storedPlayerName ? <Route path="raid/" element={<Raid />} /> : <Route path="boss-list" element={<Home />} />}
          <Route path="*" element={<Navigate to="boss-list" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
