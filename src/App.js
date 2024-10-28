import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import {Layout, Home, Inventory, Shop, Raid, 
  // Event
} from "./pages";
import { ThousandDoors, ThousandDoorsReport } from "./components";
import { useState } from 'react';

sessionStorage.setItem('tabID', new Date().getTime());

export default function App() {
  
  const [ storedPlayerName ] = useState(localStorage.getItem('storedPlayerName') || false);
  const thousandDoorReporters = [
    'SpaghetOG',
    'DejaV42',
    'numerousiceballs'
  ];
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="boss-list" replace />} />
          <Route path="boss-list" element={<Home />} />
          {storedPlayerName ? <Route path="inventory" element={<Inventory />} /> : <Route path="boss-list" element={<Home />} />}
          <Route path="shop" element={<Shop />} />
          {storedPlayerName && thousandDoorReporters.includes(storedPlayerName) ? <Route path="1000Doors/report" element={<ThousandDoorsReport />} /> : ''}
          <Route path="1000Doors" element={<ThousandDoors />} />
          {storedPlayerName ? <Route path="raid/" element={<Raid />} /> : <Route path="boss-list" element={<Home />} />}
          <Route path="*" element={<Navigate to="boss-list" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
