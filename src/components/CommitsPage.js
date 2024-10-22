// src/components/CommitsPage.js
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Navbar from './Navbar';
import SeguimientoCommitsJSON from '../SeguimientoCommits.json'; // Asegúrate de importar el ABI del contrato

const CommitsPage = () => {
  const [commits, setCommits] = useState([]);
  const contractAddress = "0x345a8597c4ce44dc5D5cbDA8274D392aFdb46a53"; // Dirección del contrato SeguimientoCommits

  useEffect(() => {
    const fetchCommits = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, SeguimientoCommitsJSON.abi, provider);
        
        try {
          const commitsData = await contract.obtenerCommits();
          const formattedCommits = commitsData.map((commit, index) => ({
            hash: commit.hash,
            autor: commit.autor,
            timestamp: commit.timestamp.toNumber(),
            // Convertir timestamp a una fecha legible
            fecha: new Date(commit.timestamp.toNumber() * 1000).toLocaleString(),
            // Añadir enumeración para los commits
            numero: index + 1,
          }));

          setCommits(formattedCommits);
        } catch (error) {
          console.error("Error al obtener los commits:", error);
        }
      }
    };

    fetchCommits();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="flex flex-col place-items-center mt-20">
        <h1 className="md:text-lg font-sans text-pink-200">
          Registro de modificaciones de código fuente almacenadas en el smart contract:
        </h1>
        <a
          href={`https://sepolia.etherscan.io/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline ml-2"
        >
          {contractAddress}
        </a>

        {/* Aumentar el tamaño del contenedor de commits */}
        <div className="commit-container mt-5 border-2 border-white p-6 bg-black w-full max-w-3xl">
          {commits.length > 0 ? (
            commits.map(commit => (
              <div key={commit.hash} className="commit-item text-white mb-4">
                <strong>{`Commit ${commit.numero}:`}</strong> <br />
                <strong>Hash:</strong> {commit.hash} <br />
                <strong>Autor:</strong> {commit.autor} <br />
                <strong>Fecha:</strong> {commit.fecha} <br />
              </div>
            ))
          ) : (
            <p className="text-white">No hay commits para mostrar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitsPage;
