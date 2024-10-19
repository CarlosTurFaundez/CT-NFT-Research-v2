import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { ClipLoader } from "react-spinners"; // Importar react-spinners

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();
    const [loading, setLoading] = useState(false); // Estado para manejar el spinner

    async function disableButton() {
        const listButton = document.getElementById("list-button")
        listButton.disabled = true
        listButton.style.backgroundColor = "grey";
        listButton.style.opacity = 0.3;
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button")
        listButton.disabled = false
        listButton.style.backgroundColor = "#A500FF";
        listButton.style.opacity = 1;
    }

    // Función para cargar la imagen en IPFS
    async function OnChangeFile(e) {
        var file = e.target.files[0];
        try {
            disableButton();
            setLoading(true); // Mostrar spinner
            const response = await uploadFileToIPFS(file);
            if(response.success === true) {
                enableButton();
                setLoading(false); // Ocultar spinner
                Swal.fire("Imagen cargada con éxito", "Tu imagen ha sido subida a Pinata", "success");
                setFileURL(response.pinataURL);
            }
        } catch(e) {
            console.log("Error durante la carga del archivo", e);
            Swal.fire("Error", "Hubo un error al cargar la imagen", "error");
            setLoading(false); // Ocultar spinner en caso de error
        }
    }

    // Función para cargar los metadatos en IPFS
    async function uploadMetadataToIPFS() {
        const {name, description, price} = formParams;
        if( !name || !description || !price || !fileURL) {
            Swal.fire("Campos incompletos", "Por favor, completa todos los campos", "warning");
            return -1;
        }

        const nftJSON = {
            name, description, price, image: fileURL
        }

        try {
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                return response.pinataURL;
            }
        } catch(e) {
            console.log("Error cargando JSON metadata:", e);
            Swal.fire("Error", "Hubo un error al cargar los metadatos", "error");
        }
    }

    // Función para crear y listar el NFT
    async function listNFT(e) {
        e.preventDefault();
        try {
            const metadataURL = await uploadMetadataToIPFS();
            if(metadataURL === -1) return;
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            disableButton();
            setLoading(true); // Mostrar spinner
            Swal.fire("Creando NFT", "Por favor, espera mientras se crea tu NFT", "info");

            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            const price = ethers.utils.parseUnits(formParams.price, 'ether');
            let listingPrice = await contract.getListPrice();
            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice });

            await transaction.wait();
            setLoading(false); // Ocultar spinner
            Swal.fire("¡NFT creado con éxito!", "Tu NFT ha sido creado y registrado en la blockchain", "success");

            enableButton();
            updateFormParams({ name: '', description: '', price: ''});
            window.location.replace("/");
        } catch(e) {
            console.log("Error durante la creación del NFT:", e);
            Swal.fire("Error", "Hubo un error al crear tu NFT", "error");
            setLoading(false); // Ocultar spinner en caso de error
        }
    }

    return (
        <div className="">
            <Navbar></Navbar>
            <div className="flex flex-col place-items-center mt-10" id="nftForm">
                {loading && <ClipLoader color={"#A500FF"} loading={loading} size={50} />} {/* Mostrar spinner durante la carga */}
                <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
                    <h3 className="text-center font-bold text-purple-500 mb-8">Sube tu NFT a este marketplace</h3>
                    <div className="mb-4">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">Nombre del NFT</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="El nombre que eliges" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                    </div>
                    <div className="mb-6">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">Descripción del NFT</label>
                        <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="Detalle de las características..." value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                    </div>
                    <div className="mb-6">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Precio (en ETH)</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                    </div>
                    <div>
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Carga tu imagen (&lt;500 KB)</label>
                        <input type={"file"} onChange={OnChangeFile}></input>
                    </div>
                    <br></br>
                    <div className="text-red-500 text-center">{message}</div>
                    <button onClick={listNFT} className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg" id="list-button">
                        Subir tu NFT
                    </button>
                </form>
            </div>
        </div>
    )
}
