import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import Swal from "sweetalert2";

export default function Marketplace() {
    useEffect(() => {
        Swal.fire({
            icon: 'info',
            title: '¡Atención!',
            text: '¡Esta no es una página comercial! Ha sido creada exclusivamente para ser destinada a la investigación jurídica y a la docencia.',
            confirmButtonText: 'Aceptar',
        });
    }, []);
    const sampleData = [
        {
            image: "https://olive-abundant-impala-307.mypinata.cloud/ipfs/QmXj3tbxEyiznu9TQrR7gCo2ZkfPvJfu1roddsnSrFQeyQ",
            price: "0.01 ETH",
            currentlySelling: "True",
        },
        {
            image: "https://olive-abundant-impala-307.mypinata.cloud/ipfs/Qmc9gmr14JvdW9zh7E6hsv2aJ9KrnruZtd6EAeA52cK42S",
            price: "0.01 ETH",
            currentlySelling: "True",
            address: "0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        },
        {
            image: "https://olive-abundant-impala-307.mypinata.cloud/ipfs/Qmc9gmr14JvdW9zh7E6hsv2aJ9KrnruZtd6EAeA52cK42S",
            price: "0.01 ETH",
            currentlySelling: "True",
            address: "0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        },
    ];

    const [data, updateData] = useState(sampleData);
    const [dataFetched, updateFetched] = useState(false);

    const getAllNFTs = async () => {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const transaction = await contract.getAllNFTs();

        const items = await Promise.all(
            transaction.map(async (i) => {
                let tokenURI = await contract.tokenURI(i.tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;

                const price = ethers.utils.formatUnits(i.price.toString(), "ether");
                return {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                };
            })
        );

        updateFetched(true);
        updateData(items);
    };

    useEffect(() => {
        if (!dataFetched) getAllNFTs();
    }, [dataFetched]);

    const contractAddress = MarketplaceJSON.address;

    return (
        <div>
            <Navbar />
            <div className="flex flex-col place-items-center mt-20">
                <div className="md:text-lg font-sans text-pink-200">ESTOS SON LOS NFT MÁS DESTACADOS</div>
                <span className="mt-2 text-white">
                    Ver Smart Contract sobre el que han sido creados:
                    <a
                        href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline ml-2"
                    >
                        {contractAddress}
                    </a>
                </span>
                <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {data.map((value, index) => (
                        <NFTTile data={value} key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
