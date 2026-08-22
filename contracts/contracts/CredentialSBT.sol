// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CredentialSBT
 * @notice Soulbound credential registry. Universities mint non-transferable
 *         credentials to students; anyone can verify a credential hash on-chain.
 */
contract CredentialSBT is ERC721, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum MigrationStatus { None, Issued, Presented, Accepted }

    struct Credential {
        address issuer;
        address student;
        bytes32 docHash;
        string docType;
        string cid;
        uint256 issuedAt;
        bool revoked;
        MigrationStatus migrationStatus;
        address presentedTo;
    }

    uint256 private _nextTokenId;
    mapping(uint256 => Credential) private _credentials;
    mapping(bytes32 => uint256) private _tokenByHash;
    mapping(bytes32 => uint256) private _hashCount;

    mapping(address => string) private _issuerNames;
    event IssuerRegistered(address indexed issuer, string name);

    // Issuer-level counters power the AI risk engine's on-chain signals.
    mapping(address => uint256) private _issuerCredentialCount;
    mapping(address => uint256) private _issuerFirstIssuedAt;
    mapping(address => uint256) private _issuerTemplateCount;
    mapping(address => uint256) private _issuerLastIssuedAt;
    uint256 private _totalIssuances;

    // Every account -> token ids it owns (for the student vault indexer).
    mapping(address => uint256[]) private _ownedTokens;
    mapping(uint256 => uint256) private _ownedTokensIndex;

    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed issuer,
        address indexed student,
        bytes32 docHash,
        string docType
    );
    event CredentialRevoked(uint256 indexed tokenId, address indexed issuer);
    event MigrationPresented(
        uint256 indexed tokenId,
        address indexed student,
        address indexed destination
    );
    event MigrationAccepted(
        uint256 indexed tokenId,
        address indexed issuer,
        address indexed destination
    );

    constructor() ERC721("VeriCred", "VCRD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _issuerNames[msg.sender] = "Default Issuer";
    }

    function registerIssuer(address issuer, string calldata name) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(name).length > 0, "Invalid name");
        _grantRole(ISSUER_ROLE, issuer);
        _issuerNames[issuer] = name;
        emit IssuerRegistered(issuer, name);
    }

    function getIssuerName(address issuer) external view returns (string memory) {
        return _issuerNames[issuer];
    }

    function issueCredential(
        address student,
        bytes32 docHash,
        string calldata docType,
        string calldata cid
    ) external onlyRole(ISSUER_ROLE) returns (uint256 tokenId) {
        require(student != address(0), "Invalid student");
        require(docHash != bytes32(0), "Invalid hash");
        require(_hashCount[docHash] == 0, "Credential already issued");

        tokenId = _mintCredential(student, docHash, docType, cid);
    }

    function issueCredentialBatch(
        address[] calldata students,
        bytes32[] calldata docHashes,
        string[] calldata docTypes,
        string[] calldata cids
    ) external onlyRole(ISSUER_ROLE) returns (uint256[] memory tokenIds) {
        uint256 n = students.length;
        require(n > 0, "Empty batch");
        require(docHashes.length == n, "Length mismatch: docHashes");
        require(docTypes.length == n, "Length mismatch: docTypes");
        require(cids.length == n, "Length mismatch: cids");

        tokenIds = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            require(students[i] != address(0), "Invalid student");
            require(docHashes[i] != bytes32(0), "Invalid hash");
            require(_hashCount[docHashes[i]] == 0, "Credential already issued");
            tokenIds[i] = _mintCredential(
                students[i],
                docHashes[i],
                docTypes[i],
                cids[i]
            );
        }
    }

    function _mintCredential(
        address student,
        bytes32 docHash,
        string memory docType,
        string memory cid
    ) private returns (uint256 tokenId) {
        tokenId = _nextTokenId;
        _nextTokenId++;

        MigrationStatus migrationStatus = MigrationStatus.None;
        if (keccak256(bytes(docType)) == keccak256(bytes("migration"))) {
            migrationStatus = MigrationStatus.Issued;
        }

        _credentials[tokenId] = Credential({
            issuer: msg.sender,
            student: student,
            docHash: docHash,
            docType: docType,
            cid: cid,
            issuedAt: block.timestamp,
            revoked: false,
            migrationStatus: migrationStatus,
            presentedTo: address(0)
        });

        _tokenByHash[docHash] = tokenId;
        _hashCount[docHash] = 1;

        uint256 count = _issuerCredentialCount[msg.sender];
        if (count == 0) {
            _issuerFirstIssuedAt[msg.sender] = block.timestamp;
        }
        _issuerCredentialCount[msg.sender] = count + 1;
        _issuerLastIssuedAt[msg.sender] = block.timestamp;

        // Cheap template-entropy heuristic: count identical docType values.
        _issuerTemplateCount[msg.sender] += 1;
        _totalIssuances += 1;

        _mint(student, tokenId);

        emit CredentialIssued(tokenId, msg.sender, student, docHash, docType);
    }

    function verifyCredential(bytes32 docHash)
        external
        view
        returns (
            bool valid,
            address issuer,
            address student,
            bool revoked,
            string memory docType,
            string memory issuerName
        )
    {
        uint256 tokenId = _tokenByHash[docHash];
        if (tokenId == 0 && _hashCount[docHash] == 0) {
            return (false, address(0), address(0), false, "", "");
        }

        Credential storage c = _credentials[tokenId];
        return (true, c.issuer, c.student, c.revoked, c.docType, _issuerNames[c.issuer]);
    }

    function revokeCredential(uint256 tokenId)
        external
        onlyRole(ISSUER_ROLE)
    {
        Credential storage c = _credentials[tokenId];
        require(c.issuer != address(0), "Credential does not exist");
        require(!c.revoked, "Already revoked");

        c.revoked = true;
        emit CredentialRevoked(tokenId, msg.sender);
    }

    function presentMigration(uint256 tokenId, address destination)
        external
    {
        Credential storage c = _credentials[tokenId];
        require(c.issuer != address(0), "Credential does not exist");
        require(_ownerOf(tokenId) == msg.sender, "Only the holder can present");
        require(
            c.migrationStatus == MigrationStatus.Issued,
            "Migration is not issuable"
        );
        require(destination != address(0), "Invalid destination");

        c.migrationStatus = MigrationStatus.Presented;
        c.presentedTo = destination;

        emit MigrationPresented(tokenId, msg.sender, destination);
    }

    function acceptMigration(uint256 tokenId, address destination)
        external
        onlyRole(ISSUER_ROLE)
    {
        Credential storage c = _credentials[tokenId];
        require(c.issuer != address(0), "Credential does not exist");
        require(
            c.migrationStatus == MigrationStatus.Presented,
            "Migration is not presented"
        );

        c.migrationStatus = MigrationStatus.Accepted;
        c.presentedTo = destination;

        emit MigrationAccepted(tokenId, msg.sender, destination);
    }

    function getCredential(uint256 tokenId)
        external
        view
        returns (Credential memory)
    {
        return _credentials[tokenId];
    }

    function isIssuer(address account) external view returns (bool) {
        return hasRole(ISSUER_ROLE, account);
    }

    function totalIssuances() external view returns (uint256) {
        return _totalIssuances;
    }

    function tokensOfOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return _ownedTokens[owner];
    }

    function issuerCredentialCount(address issuer)
        external
        view
        returns (uint256)
    {
        return _issuerCredentialCount[issuer];
    }

    function issuerFirstIssuedAt(address issuer)
        external
        view
        returns (uint256)
    {
        return _issuerFirstIssuedAt[issuer];
    }

    function issuerTemplateCount(address issuer)
        external
        view
        returns (uint256)
    {
        return _issuerTemplateCount[issuer];
    }

    function issuerLastIssuedAt(address issuer)
        external
        view
        returns (uint256)
    {
        return _issuerLastIssuedAt[issuer];
    }

    function hashCount(bytes32 docHash) external view returns (uint256) {
        return _hashCount[docHash];
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(
            from == address(0) || to == address(0),
            "Soulbound: transfer not allowed"
        );

        if (from != address(0)) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }
        if (to != address(0)) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }

        return super._update(to, tokenId, auth);
    }

    function _addTokenToOwnerEnumeration(address owner, uint256 tokenId)
        private
    {
        _ownedTokensIndex[tokenId] = _ownedTokens[owner].length;
        _ownedTokens[owner].push(tokenId);
    }

    function _removeTokenFromOwnerEnumeration(address owner, uint256 tokenId)
        private
    {
        uint256 lastTokenIndex = _ownedTokens[owner].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[owner][lastTokenIndex];
            _ownedTokens[owner][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        _ownedTokens[owner].pop();
        delete _ownedTokensIndex[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
