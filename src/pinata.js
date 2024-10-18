require('dotenv').config();
const key = process.env.REACT_APP_PINATA_API_KEY;
const secret = process.env.REACT_APP_PINATA_API_SECRET;

const axios = require('axios');
const FormData = require('form-data');

// Función para subir JSON a IPFS
export const uploadJSONToIPFS = async (jsonBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    return axios
        .post(url, jsonBody, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
            return {
                success: true,
                pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
                cid: response.data.IpfsHash, // Agregar el CID
            };
        })
        .catch(function (error) {
            console.log(error);
            return {
                success: false,
                message: error.message,
            };
        });
};

// Función para subir archivos a IPFS
export const uploadFileToIPFS = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    
    let data = new FormData();
    data.append('file', file);

    // Metadata puede incluir el nombre del NFT y otros atributos, si es necesario
    const metadata = JSON.stringify({
        name: file.name, // Usar el nombre del archivo como ejemplo
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    data.append('pinataMetadata', metadata);

    // Opciones de pinning (opcional)
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    data.append('pinataOptions', pinataOptions);

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
            console.log("Image uploaded", response.data.IpfsHash);
            return {
                success: true,
                pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
                cid: response.data.IpfsHash, // Agregar el CID
            };
        })
        .catch(function (error) {
            console.log(error);
            return {
                success: false,
                message: error.message,
            };
        });
};
