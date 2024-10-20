const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.getBalance();
    console.log("Dirección del desplegador:", deployer.address);
    console.log("Balance del desplegador:", ethers.utils.formatEther(balance), "ETH");

    const SeguimientoCommits = await hre.ethers.getContractFactory("SeguimientoCommits");
    const seguimientoCommits = await SeguimientoCommits.deploy();

    await seguimientoCommits.deployed();

    console.log("Smart contract de SeguimientoCommits desplegado en:", seguimientoCommits.address);

    const data = {
        address: seguimientoCommits.address,
        abi: JSON.parse(seguimientoCommits.interface.format('json'))
    };

    // Esto escribe el ABI y la dirección en el archivo seguimientoCommits.json
    fs.writeFileSync('./src/SeguimientoCommits.json', JSON.stringify(data));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
