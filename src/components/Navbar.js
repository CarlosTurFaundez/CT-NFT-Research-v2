// src/components/Navbar.js
import fullLogo from '../CARLOSTURLOGO2.png';
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';

function Navbar() {
  const [connected, setConnected] = useState(false);
  const location = useLocation();
  const [currAddress, setCurrAddress] = useState('0x');
 
  
  async function connectWebsite() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnected(true);
        setCurrAddress(accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error.message);
        alert(`No se pudo conectar a la wallet: ${error.message}`);
      }
    } else {
      alert("MetaMask no está instalado. Por favor, instálalo.");
    }
  }

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnected(true);
          setCurrAddress(accounts[0]);
        }
      }
    };
    checkConnection();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setConnected(true);
        setCurrAddress(accounts[0]);
      } else {
        setConnected(false);
        setCurrAddress('0x');
      }
    };

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  return (
    <div>
      <nav className="w-screen">
        <ul className='flex items-center justify-between py-3 bg-transparent text-white pr-5'>
          <li className='flex items-center ml-5 pb-2'>
            <Link to="/">
              <img src={fullLogo} alt="Logo" width={300} height={300} className="inline-block -mt-2" />
            </Link>
          </li>
          <li className='w-2/3'> {/* Cambié el tamaño a 2/3 para evitar la sobrecarga de espacio */}
            <ul className='lg:flex justify-around font-thin mr-8 text-base tracking-wide'>
              <li className={`hover:border-b-2 hover:pb-0 p-2 ${location.pathname === "/" ? "border-b-2" : ""}`}>
                <Link to="/">Marketplace</Link>
              </li>
              <li className={`hover:border-b-2 hover:pb-0 p-2 ${location.pathname === "/sellNFT" ? "border-b-2" : ""}`}>
                <Link to="/sellNFT">Crear NFTs</Link>
              </li>
              <li className={`hover:border-b-2 hover:pb-0 p-2 ${location.pathname === "/profile" ? "border-b-2" : ""}`}>
                <Link to="/profile">Perfil</Link>
              </li>
              <li className={`hover:border-b-2 hover:pb-0 p-2 ${location.pathname === "/test" ? "border-b-2" : ""}`}>
              <Link to="/commits">Commits</Link>
              </li>
              <li>
                <button className={`enableEthereumButton ${connected ? 'bg-green-500' : 'bg-blue-500'} hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm whitespace-nowrap`} onClick={connectWebsite}>
                  {connected ? "Conectado" : "Conecta MetaMask"}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <div className='text-white text-bold text-right mr-10 text-sm'>
        {currAddress !== "0x" 
          ? <>Conectado a la cuenta {currAddress.substring(0, 6)}...{currAddress.substring(currAddress.length - 4)}</> 
          : "No estás conectado. Por favor conéctate para ver tus NFTs"}
      </div>
    </div>
  );
}

export default Navbar;
