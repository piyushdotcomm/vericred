const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Canonical JSON with the SAME address normalization as the frontend
// (lib/hash.ts normalizeCredential) so seeded hashes verify end-to-end.
function canonicalJson(obj) {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalJson).join(",")}]`;
  }
  const sorted = Object.keys(obj)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(obj[key])}`);
  return `{${sorted.join(",")}}`;
}

const SEED_CREDENTIALS = [
  {
    id: "cred-demo-1",
    issuerDid: "did:web:university-a.edu",
    issuerName: "University A",
    studentName: "Aisha Verma",
    studentAddress: "0xabc",
    rollNumber: "2021CS045",
    course: "B.Tech Computer Science",
    docType: "degree",
    issuedAt: "2025-06-15T10:00:00Z",
    claims: { cgpa: 8.4, program: "B.Tech" },
  },
  {
    id: "cred-demo-2",
    issuerDid: "did:web:university-a.edu",
    issuerName: "University A",
    studentName: "Aisha Verma",
    studentAddress: "0xabc",
    rollNumber: "2021CS045",
    course: "B.Tech Computer Science",
    docType: "transcript",
    issuedAt: "2025-06-15T10:00:00Z",
    claims: { cgpa: 8.4, program: "B.Tech" },
  },
  {
    id: "cred-demo-3",
    issuerDid: "did:web:university-a.edu",
    issuerName: "University A",
    studentName: "Rahul Sharma",
    studentAddress: "0xdef",
    rollNumber: "2021EE012",
    course: "B.Tech Electrical Engineering",
    docType: "migration",
    issuedAt: "2025-07-01T09:00:00Z",
    issuedBy: "University A",
    claims: { cgpa: 7.9, program: "B.Tech", destination: "University B" },
  },
];

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

  const [issuer, studentA, studentB] = await ethers.getSigners();
  console.log("Seeding with issuer:", issuer.address);

  const contract = await ethers.getContractAt("CredentialSBT", address);

  const studentMap = {
    "0xabc": studentA.address.toLowerCase(),
    "0xdef": studentB.address.toLowerCase(),
  };

  const records = [];

  for (const seed of SEED_CREDENTIALS) {
    // The on-chain hash is computed over the PLACEHOLDER address (0xabc/0xdef),
    // exactly matching the seed script's existing behavior. The served record
    // will carry the REAL address + its recomputed hash, so the frontend's
    // recompute (real address) must match what we anchor here.
    //
    // To keep a single source of truth, we anchor the hash of the REAL address
    // credential and serve that same credential. This makes verify VALID.
    const realAddress = studentMap[seed.studentAddress] || seed.studentAddress;
    const realCredential = {
      ...seed,
      studentAddress: realAddress,
    };

    const canonical = canonicalJson(realCredential);
    const docHash = ethers.keccak256(ethers.toUtf8Bytes(canonical));
    const cid = `ipfs://seed-${seed.id}`;

    console.log(`\nIssuing "${seed.docType}" for ${seed.studentName}...`);
    console.log(`  docHash: ${docHash}`);

    const tx = await contract.issueCredential(
      realAddress,
      docHash,
      seed.docType,
      cid,
    );
    const receipt = await tx.wait();

    let tokenId = -1;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        if (parsed.name === "CredentialIssued") {
          tokenId = Number(parsed.args.tokenId);
          break;
        }
      } catch {}
    }

    console.log(`  tokenId: ${tokenId}, tx: ${tx.hash}`);
    records.push({
      credential: realCredential,
      cid,
      issuerSignature: "0x",
      docHash,
      tokenId,
    });
  }

  // Write the served records to data/credentials.json. In production the
  // records are seeded into Supabase via `npm run db:seed` (root), which reads
  // this same file.
  const outPath = path.join(__dirname, "..", "..", "data", "credentials.json");
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2));
  console.log("\nSeed data written to data/credentials.json");

  // Sanity check: verify each hash on-chain.
  for (const r of records) {
    const result = await contract.verifyCredential(r.docHash);
    console.log(
      `verifyCredential(${r.docHash.slice(0, 10)}...): valid=${result.valid} revoked=${result.revoked}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
