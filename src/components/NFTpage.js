import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage (props) {
    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("");
    const [cid, updateCid] = useState("");

    async function getNFTData(tokenId) {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        
        var tokenURI = await contract.tokenURI(tokenId);
        const listedToken = await contract.getListedTokenForId(tokenId);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        const imageCid = GetIpfsUrlFromPinata(meta.image);
        const metadataCid = GetIpfsUrlFromPinata(tokenURI);

        let item = {
            price: meta.price,
            tokenId: tokenId,
            seller: listedToken.seller,
            owner: listedToken.owner,
            image: imageCid,
            name: meta.name,
            description: meta.description,
            cid: metadataCid
        };

        updateCid(metadataCid);
        updateData(item);
        updateDataFetched(true);
        updateCurrAddress(addr);
    }

    async function buyNFT(tokenId) {
        try {
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const salePrice = ethers.utils.parseUnits(data.price, 'ether');
            updateMessage("Adquiriendo el NFT. Por favor, espera. (Puede tardar hasta 5 mins)");
            let transaction = await contract.executeSale(tokenId, {value: salePrice});
            await transaction.wait();

            alert('Has comprado con éxito un NFT');
            updateMessage("");
        } catch (e) {
            alert("Upload Error" + e);
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
                        { currAddress !== data.owner && currAddress !== data.seller ?
                            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Compra este NFT</button>
                            : <div className="text-emerald-500 text-2xl">Eres el propietario de este NFT</div>
                        }
                        <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
