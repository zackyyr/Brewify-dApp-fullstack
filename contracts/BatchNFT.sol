// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BatchNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE    = keccak256("MINTER_ROLE");
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");

    enum Status {
        Unknown,
        Harvested,
        Processed,
        Packed,
        Shipped,
        Delivered
    }

    mapping(uint256 => Status) public tokenStatus;
    mapping(uint256 => address) public creator;

    uint256 private _nextId = 1;

    event BatchMinted(address indexed to, uint256 indexed tokenId, string uri);
    event StatusUpdated(uint256 indexed tokenId, Status previousStatus, Status newStatus);
    event TokenURIUpdated(uint256 indexed tokenId, string newUri);

    constructor() ERC721("Brewify Coffee Batch", "BREW") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(LOGISTICS_ROLE, msg.sender); // bisa diganti/ditambah via grantRole
    }

    function mintBatch(address to, string memory uri)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256)
    {
        uint256 tokenId = _nextId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        tokenStatus[tokenId] = Status.Harvested;
        creator[tokenId]     = msg.sender;

        emit BatchMinted(to, tokenId, uri);
        emit StatusUpdated(tokenId, Status.Unknown, Status.Harvested);

        return tokenId;
    }

    function updateBatchStatus(uint256 tokenId, Status newStatus) external {
        require(_exists(tokenId), "BatchNFT: token does not exist");

        Status current = tokenStatus[tokenId];
        require(uint8(newStatus) > uint8(current), "BatchNFT: invalid status transition");

        // Farmer (MINTER_ROLE) mengelola tahap produksi awal
        if (
            newStatus == Status.Harvested ||
            newStatus == Status.Processed ||
            newStatus == Status.Packed
        ) {
            require(
                hasRole(MINTER_ROLE, msg.sender),
                "BatchNFT: only farmer role"
            );
        }
        // Logistics / verifier mengelola pengiriman & delivered
        else {
            require(
                hasRole(LOGISTICS_ROLE, msg.sender),
                "BatchNFT: only logistics role"
            );
        }

        tokenStatus[tokenId] = newStatus;
        emit StatusUpdated(tokenId, current, newStatus);
    }

    /// Izinkan pemilik token (atau farmer role) meng-update metadata URI (mis. saat ganti gambar/metadata IPFS)
    function updateTokenURI(uint256 tokenId, string calldata newUri) external {
        require(_exists(tokenId), "BatchNFT: token does not exist");
        require(
            _isApprovedOrOwner(_msgSender(), tokenId) || hasRole(MINTER_ROLE, _msgSender()),
            "BatchNFT: not authorised"
        );

        _setTokenURI(tokenId, newUri);
        emit TokenURIUpdated(tokenId, newUri);
    }

    function getStatus(uint256 tokenId) external view returns (Status) {
        require(_exists(tokenId), "BatchNFT: token does not exist");
        return tokenStatus[tokenId];
    }

    // ==== Overrides ====

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721URIStorage)
    {
        super._burn(tokenId);
        delete tokenStatus[tokenId];
        delete creator[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
