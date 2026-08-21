const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Mirrors the frontend canonical JSON (with address normalization) so the
// hashes recorded here match what a verifier would recompute.
function canonicalJson(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalJson).join(",")}]`;
  const sorted = Object.keys(obj)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(obj[key])}`);
  return `{${sorted.join(",")}}`;
}

async function main() {
  const deploymentPath = path.join(
    __dirname,
    "..",
    "..",
    "lib",
    "deployment.json",
  );
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("Run deploy.js first — lib/deployment.json not found");
  }
  const { address } = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

  const [, , syntheticIssuer] = await ethers.getSigners();
  const contract = await ethers.getContractAt("CredentialSBT", address);

  // Grant the synthetic (diploma-mill) issuer the ISSUER_ROLE.
  const admin = (await ethers.getSigners())[0];
  const role = await contract.ISSUER_ROLE();
  if (!(await contract.hasRole(role, syntheticIssuer.address))) {
    const tx = await contract.grantRole(role, syntheticIssuer.address);
    await tx.wait();
    console.log("Granted ISSUER_ROLE to synthetic issuer:", syntheticIssuer.address);
  }

  // Simulate a diploma mill: 5000 identical-template credentials in one burst.
  const N = 5000;
  console.log(`Simulating diploma mill: ${N} credentials from one issuer...`);

  const students = [];
  const hashes = [];
  const docTypes = [];
  const cids = [];

  // Reuse the same template metadata (only the id differs) to trip the
  // "identical metadata template" entropy signal. Derive addresses cheaply
  // (no elliptic-curve keygen) so 5,000 credentials build instantly.
  for (let i = 0; i < N; i++) {
    const studentAddress =
      "0x" +
      ethers
        .keccak256(ethers.toUtf8Bytes("mill-student-" + i))
        .slice(26)
        .toLowerCase();

    const cred = {
      id: `mill-${i}`,
      issuerDid: "did:web:diploma-mill.example",
      issuerName: "Diploma Mill University",
      studentName: `Student ${i}`,
      studentAddress,
      rollNumber: "MILL-000",
      course: "Instant Degree",
      docType: "degree",
      issuedAt: "2026-08-21T00:00:00Z",
      claims: { cgpa: 10, program: "Instant Degree" },
    };

    students.push(cred.studentAddress);
    hashes.push(
      ethers.keccak256(ethers.toUtf8Bytes(canonicalJson(cred))),
    );
    docTypes.push("degree");
    cids.push(`ipfs://mill-${i}`);
  }

  // Batch-issue in smaller chunks so a single call stays under the default
  // Hardhat block gas limit (30M). 40 mints * ~150k gas ≈ 6M gas per chunk.
  const CHUNK = 40;
  for (let i = 0; i < N; i += CHUNK) {
    const end = Math.min(i + CHUNK, N);
    const tx = await contract
      .connect(syntheticIssuer)
      .issueCredentialBatch(
        students.slice(i, end),
        hashes.slice(i, end),
        docTypes.slice(i, end),
        cids.slice(i, end),
      );
    await tx.wait();
    if ((i / CHUNK) % 5 === 0) {
      console.log(`  ...issued ${end}/${N}`);
    }
  }

  const count = await contract.issuerCredentialCount(syntheticIssuer.address);
  console.log(`Done. Diploma-mill issuer now has ${count} credentials on-chain.`);
  console.log(`Verifier will flag this issuer as a mass-issuance anomaly.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
