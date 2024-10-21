const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x345a8597c4ce44dc5D5cbDA8274D392aFdb46a53"; // Dirección de tu contrato existente
    const SeguimientoCommits = await ethers.getContractFactory("SeguimientoCommits");
    const contract = await SeguimientoCommits.attach(contractAddress);

    const commitHash = process.env.COMMIT_HASH; // Obtener el hash del commit
    const autor = process.env.COMMIT_AUTHOR; // Obtener el autor del commit desde el entorno

    // Llamar a la función agregarCommit
    const tx = await contract.agregarCommit(commitHash, autor);
    await tx.wait(); // Espera a que la transacción sea confirmada

    console.log(`Commit agregado: ${commitHash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
