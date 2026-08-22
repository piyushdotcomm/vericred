const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CredentialSBT with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const factory = await ethers.getContractFactory("CredentialSBT");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("CredentialSBT deployed to:", address);

  console.log("Registering deployer as 'University A' in Issuer Registry...");
  const tx = await contract.registerIssuer(deployer.address, "University A");
  await tx.wait();
  console.log("Issuer registered successfully.");

  const deployment = {
    address,
    deployer: deployer.address,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "..", "lib");
  fs.writeFileSync(
    path.join(outDir, "deployment.json"),
    JSON.stringify(deployment, null, 2),
  );
  console.log("Deployment info written to lib/deployment.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
