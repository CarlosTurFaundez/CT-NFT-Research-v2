import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css'; 
import reportWebVitals from './reportWebVitals';
import {
  HashRouter,  // Cambiado de BrowserRouter a HashRouter
  Routes,
  Route,
} from "react-router-dom";
import SellNFT from './components/SellNFT';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import NFTPage from './components/NFTpage';
import CommitsPage from './components/CommitsPage'; // Importa el componente CommitsPage

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>  {/* Cambiado de BrowserRouter a HashRouter */}
      <Routes>
        <Route path="/" element={<Marketplace />}/>
        <Route path="/sellNFT" element={<SellNFT />}/> 
        <Route path="/nftPage/:tokenId" element={<NFTPage />}/>        
        <Route path="/profile" element={<Profile />}/> 
        <Route path="/commits" element={<CommitsPage />}/> {/* Agrega la ruta para CommitsPage */}
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
