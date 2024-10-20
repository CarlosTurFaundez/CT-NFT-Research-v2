// scripts/flatten.js
const fs = require("fs");
const path = require("path");
const { run } = require("hardhat");

async function main() {
  const contractName = "NFTMarketplace"; // Cambia esto al nombre de tu contrato
  const contractPath = path.join(__dirname, "../contracts", `${contractName}.sol`);

  await run("compile");

  const flattened = await run("hardhat-flatten", {
    contracts: [contractPath],
  });

  // Guardar el contrato aplanado en un archivo
  fs.writeFileSync(`./flattened/${contractName}.sol`, flattened);
  console.log(`Contract flattened and saved to flattened/${contractName}.sol`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
