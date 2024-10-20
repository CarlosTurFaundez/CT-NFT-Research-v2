import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage(props) {
    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("");
    const [cid, updateCid] = useState("");
    const [isListed, setIsListed] = useState(false);  // Nuevo estado para verificar si el NFT está listado

    async function getNFTData(tokenId) {
        try {
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

            // Obtener la URI del token
            let tokenURI = await contract.tokenURI(tokenId);
            // Obtener la dirección del propietario actual
            const currentOwner = await contract.ownerOf(tokenId);

            // Verificar si el token está listado
            let listedToken;
            try {
                listedToken = await contract.getListedTokenForId(tokenId);
                setIsListed(true); // El token está listado
            } catch (error) {
                listedToken = null; // Si no está listado
                setIsListed(false); // El token no está listado
            }

            tokenURI = GetIpfsUrlFromPinata(tokenURI);
            const meta = await axios.get(tokenURI).then(res => res.data);
            const imageCid = GetIpfsUrlFromPinata(meta.image);
            const metadataCid = GetIpfsUrlFromPinata(tokenURI);

            // Convertir el precio de wei a ether
            const priceInEther = listedToken ? ethers.utils.formatEther(listedToken.price) : "No disponible"; 

            // Crear el objeto item con los datos necesarios
            const item = {
                price: priceInEther, // Mostrar el precio en Ether
                tokenId: tokenId,
                seller: listedToken ? listedToken.seller : "No disponible", // Solo mostrar el vendedor si está listado
                owner: currentOwner, // Cambiado para usar el propietario actual
                image: imageCid,
                name: meta.name,
                description: meta.description,
                cid: metadataCid
            };

            updateCid(metadataCid);
            updateData(item);
            updateDataFetched(true);
            updateCurrAddress(addr);
        } catch (error) {
            console.error("Error fetching NFT data:", error);
            updateMessage("Error fetching NFT data");
        }
    }
    async function buyNFT(tokenId) {
        try {
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
    
            const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const salePrice = ethers.utils.parseUnits(data.price, 'ether');
    
            // Verificar si el NFT está listado
            if (!isListed) {
                alert("El NFT no está listado o no existe.");
                return;
            }
    
            let gasEstimate;
            try {
                // Intentar estimar el gas
                gasEstimate = await contract.estimateGas.executeSale(tokenId, { value: salePrice });
                console.log("Gas estimate:", gasEstimate.toString());
            } catch (error) {
                console.error("Error estimating gas:", error);
                // Si falla, establecer un gas limit manual
                gasEstimate = 100000; // Establece un valor que creas que es suficiente
                alert("No se pudo estimar el gas. Usando un límite de gas manual.");
            }
    
            updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
    
            // Ejecutar la función de venta
            let transaction = await contract.executeSale(tokenId, {
                value: salePrice,
                gasLimit: gasEstimate
            });
            await transaction.wait();
    
            alert('You successfully bought the NFT!');
            updateMessage("");
        } catch (error) {
            console.error("Error in the purchase:", error);
            alert("Error al intentar comprar el NFT: " + error.message);
        }
    }
    
    const params = useParams();
    const tokenId = params.tokenId;
    if (!dataFetched) getNFTData(tokenId);

    return (
        <div style={{ "min-height": "100vh" }}>
            <Navbar />
            <div className="flex ml-20 mt-20">
                <img src={data.image} alt="" className="w-2/5 h-auto object-contain" />
                <div className="text-base ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5 max-w-xl">
                    <div>
                        <span className="text-white">Nombre:</span> <span className="text-white"> {data.name} </span>
                    </div>
                    <div>
                        <span className="text-white">Descripción:</span> <span className="text-white"><p className="text-sky-300 text-sm">{data.description}</p></span>
                    </div>
                    <div>
                        <span className="text-white">Precio:</span> <span className="text-white"><span className="text-sky-300 text-sm">  {data.price + " ETH"}   </span></span>
                    </div>
                    <div>
                        <span className="text-white">Propietario:</span> <span className="text-white"><span className="text-sky-300 text-sm">  {data.owner}   </span> </span>
                    </div>
                    <div>
                        <span className="text-white">Vendedor:</span> <span className="text-white"><span className="text-sky-300 text-sm">  {data.seller}   </span> </span>
                    </div>
                    <div>
                        <span className="text-white">ID:</span> <span className="text-white"><span className="text-sky-500 text-sm"> {data.tokenId} </span></span>
                    </div>
                    <div>
                        <a
                            href={`https://sepolia.etherscan.io/token/${MarketplaceJSON.address}?a=${data.tokenId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 text-sm hover:underline"
                        >
                            Ver en el explorador de Sepolia
                        </a>
                    </div>
                    <div>
                        <span className="text-white">Enlace de IPFS de la imagen:</span> <a href={data.image} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">{data.image}</a>
                    </div>
                    <div>
                        <span className="text-white">Enlace de IPFS de los metadatos:</span> <a href={cid} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">{cid}</a>
                    </div>
                    <div>
                        { currAddress !== data.owner && isListed ? (
                            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>
                                Compra este NFT
                            </button>
                        ) : (
                            <div className="text-emerald-500 text-2xl">
                                {currAddress === data.owner ? "Eres el propietario de este NFT" : "Este NFT no está a la venta"}
                            </div>
                        )}
                        <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
