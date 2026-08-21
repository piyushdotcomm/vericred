const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialSBT", function () {
  async function deploy() {
    const [issuer, student, other] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("CredentialSBT");
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    return { contract, issuer, student, other };
  }

  const DOC_HASH = ethers.keccak256(ethers.toUtf8Bytes("credential-json-1"));
  const MIGRATION_HASH = ethers.keccak256(
    ethers.toUtf8Bytes("credential-json-migration"),
  );

  it("lets an issuer mint a credential to a student", async function () {
    const { contract, issuer, student } = await deploy();
    const tx = await contract.issueCredential(
      student.address,
      DOC_HASH,
      "degree",
      "ipfs://abc",
    );
    await expect(tx)
      .to.emit(contract, "CredentialIssued")
      .withArgs(0, issuer.address, student.address, DOC_HASH, "degree");
    expect(await contract.ownerOf(0)).to.equal(student.address);
  });

  it("rejects non-issuer minting", async function () {
    const { contract, student, other } = await deploy();
    await expect(
      contract.connect(other).issueCredential(
        student.address,
        DOC_HASH,
        "degree",
        "ipfs://abc",
      ),
    ).to.be.revertedWithCustomError(
      contract,
      "AccessControlUnauthorizedAccount",
    );
  });

  it("verifies a credential as valid and not revoked", async function () {
    const { contract, issuer, student } = await deploy();
    await contract.issueCredential(student.address, DOC_HASH, "degree", "ipfs://abc");
    const result = await contract.verifyCredential(DOC_HASH);
    expect(result.valid).to.equal(true);
    expect(result.issuer).to.equal(issuer.address);
    expect(result.student).to.equal(student.address);
    expect(result.revoked).to.equal(false);
  });

  it("returns invalid for a tampered (unknown) hash", async function () {
    const { contract } = await deploy();
    const result = await contract.verifyCredential(
      ethers.keccak256(ethers.toUtf8Bytes("tampered")),
    );
    expect(result.valid).to.equal(false);
  });

  it("marks a credential revoked", async function () {
    const { contract, student } = await deploy();
    await contract.issueCredential(student.address, DOC_HASH, "degree", "ipfs://abc");
    await contract.revokeCredential(0);
    const result = await contract.verifyCredential(DOC_HASH);
    expect(result.revoked).to.equal(true);
  });

  it("rejects non-issuer revoke", async function () {
    const { contract, student, other } = await deploy();
    await contract.issueCredential(student.address, DOC_HASH, "degree", "ipfs://abc");
    await expect(
      contract.connect(other).revokeCredential(0),
    ).to.be.revertedWithCustomError(
      contract,
      "AccessControlUnauthorizedAccount",
    );
  });

  it("blocks transfer (soulbound)", async function () {
    const { contract, student, other } = await deploy();
    await contract.issueCredential(student.address, DOC_HASH, "degree", "ipfs://abc");
    await expect(
      contract.connect(student).transferFrom(student.address, other.address, 0),
    ).to.be.revertedWith("Soulbound: transfer not allowed");
  });

  it("sets migration status to Issued on mint", async function () {
    const { contract, student } = await deploy();
    await contract.issueCredential(
      student.address,
      MIGRATION_HASH,
      "migration",
      "ipfs://mig",
    );
    const c = await contract.getCredential(0);
    expect(c.migrationStatus).to.equal(1); // Issued
  });

  it("lets the holder present a migration", async function () {
    const { contract, student, other } = await deploy();
    await contract.issueCredential(
      student.address,
      MIGRATION_HASH,
      "migration",
      "ipfs://mig",
    );
    await contract.connect(student).presentMigration(0, other.address);
    const c = await contract.getCredential(0);
    expect(c.migrationStatus).to.equal(2); // Presented
    expect(c.presentedTo).to.equal(other.address);
  });

  it("emits MigrationAccepted after a present -> accept handshake", async function () {
    const { contract, issuer, student, other } = await deploy();
    await contract.issueCredential(
      student.address,
      MIGRATION_HASH,
      "migration",
      "ipfs://mig",
    );
    await contract.connect(student).presentMigration(0, other.address);
    const tx = await contract.acceptMigration(0, other.address);
    await expect(tx)
      .to.emit(contract, "MigrationAccepted")
      .withArgs(0, issuer.address, other.address);
  });

  it("rejects accepting a non-presented migration", async function () {
    const { contract, student, other } = await deploy();
    await contract.issueCredential(
      student.address,
      MIGRATION_HASH,
      "migration",
      "ipfs://mig",
    );
    await expect(
      contract.acceptMigration(0, other.address),
    ).to.be.revertedWith("Migration is not presented");
  });

  it("prevents duplicate issuance of the same hash", async function () {
    const { contract, student } = await deploy();
    await contract.issueCredential(student.address, DOC_HASH, "degree", "ipfs://abc");
    await expect(
      contract.issueCredential(student.address, DOC_HASH, "degree", "ipfs://xyz"),
    ).to.be.revertedWith("Credential already issued");
  });

  it("enumerates owned tokens for the student vault", async function () {
    const { contract, student } = await deploy();
    await contract.issueCredential(student.address, DOC_HASH, "degree", "ipfs://abc");
    await contract.issueCredential(
      student.address,
      ethers.keccak256(ethers.toUtf8Bytes("second")),
      "transcript",
      "ipfs://def",
    );
    const tokens = await contract.tokensOfOwner(student.address);
    expect(tokens.map((t) => Number(t))).to.deep.equal([0, 1]);
  });

  it("tracks issuer-level counters for the AI risk engine", async function () {
    const { contract, issuer, student } = await deploy();
    await contract.issueCredential(student.address, DOC_HASH, "degree", "ipfs://abc");
    expect(await contract.totalIssuances()).to.equal(1);
    expect(await contract.issuerCredentialCount(issuer.address)).to.equal(1);
  });

  it("mints a batch of credentials in one call", async function () {
    const { contract, student } = await deploy();
    const h1 = ethers.keccak256(ethers.toUtf8Bytes("batch-1"));
    const h2 = ethers.keccak256(ethers.toUtf8Bytes("batch-2"));
    const tx = await contract.issueCredentialBatch(
      [student.address, student.address],
      [h1, h2],
      ["degree", "transcript"],
      ["ipfs://b1", "ipfs://b2"],
    );
    const receipt = await tx.wait();
    const issued = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
        } catch {
          return null;
        }
      })
      .filter((p) => p && p.name === "CredentialIssued")
      .map((p) => Number(p.args.tokenId));
    expect(issued.sort((a, b) => a - b)).to.deep.equal([0, 1]);
    expect(await contract.ownerOf(0)).to.equal(student.address);
    expect(await contract.ownerOf(1)).to.equal(student.address);
  });

  it("rejects a mismatched batch length", async function () {
    const { contract, student } = await deploy();
    const h1 = ethers.keccak256(ethers.toUtf8Bytes("batch-1"));
    await expect(
      contract.issueCredentialBatch(
        [student.address],
        [h1, h1],
        ["degree", "degree"],
        ["ipfs://a", "ipfs://b"],
      ),
    ).to.be.revertedWith("Length mismatch: docHashes");
  });
});
