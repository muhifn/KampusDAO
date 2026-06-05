// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

interface IERC5192 {
    event Locked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

contract CampusSoulboundNFT is
    ERC721,
    ERC721Votes,
    ERC721Enumerable,
    ERC721URIStorage,
    AccessControl,
    IERC5192
{
    using Strings for uint256;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    uint256 private _nextTokenId;
    uint256 private constant _MAX_SUPPLY = 2000;

    // IPFS Metadata Base URI
    string private _baseTokenURI;

    mapping(address => bool) private _whitelist;
    mapping(address => uint256) private _passBook;

    error SoulboundTransferNotAllowed();
    error AlreadyHasPass(address student);
    error NotWhitelisted(address student);
    error TokenDoesNotExist(uint256 tokenId);
    error AlreadyWhitelisted(address student);
    error NotInWhitelist(address student);
    error NoPass();
    error NotTokenOwner();

    event PassClaimed(address indexed student, uint256 tokenId, uint256 claimedAt);
    event PassRevoked(address indexed student, uint256 tokenId);
    event WhitelistUpdated(address indexed student, bool status);

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) EIP712("CampusSoulboundNFT", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    // ======================== SOULBOUND CORE (ERC-5192) ========================

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Votes, ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);

        // SOULBOUND: block all transfers (not mint, not burn)
        if (from != address(0) && to != address(0)) {
            revert SoulboundTransferNotAllowed();
        }

        // Delegate BEFORE super._update() so voting power is tracked correctly
        if (to != address(0)) {
            _delegate(to, to);
        }

        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert SoulboundTransferNotAllowed();
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert SoulboundTransferNotAllowed();
    }

    function locked(uint256 tokenId) public view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist(tokenId);
        return true;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return
            interfaceId == type(IERC5192).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Votes, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    // ======================== WHITELIST FUNCTIONS ========================

    function addToWhitelist(address student) external onlyRole(ISSUER_ROLE) {
        if (_whitelist[student]) revert AlreadyWhitelisted(student);
        _whitelist[student] = true;
        emit WhitelistUpdated(student, true);
    }

    function batchAddToWhitelist(address[] calldata students) external onlyRole(ISSUER_ROLE) {
        for (uint256 i = 0; i < students.length; i++) {
            if (!_whitelist[students[i]]) {
                _whitelist[students[i]] = true;
                emit WhitelistUpdated(students[i], true);
            }
        }
    }

    function removeFromWhitelist(address student) external onlyRole(ISSUER_ROLE) {
        if (!_whitelist[student]) revert NotInWhitelist(student);
        _whitelist[student] = false;
        emit WhitelistUpdated(student, false);
    }

    // ======================== STUDENT FUNCTIONS (Consent-Based Mint) ========================

    function claimPass() external {
        address student = msg.sender;
        if (!_whitelist[student]) revert NotWhitelisted(student);
        if (_passBook[student] != 0) revert AlreadyHasPass(student);

        uint256 tokenId = _nextTokenId++;
        
        // Use baseURI if set, otherwise fallback to default
        string memory uri;
        if (bytes(_baseTokenURI).length > 0) {
            uri = string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
        } else {
            uri = string(abi.encodePacked(
                "https://campus-dao.example/metadata/", tokenId.toString()));
        }
        
        _mint(student, tokenId);
        _setTokenURI(tokenId, uri);

        // _passBook stores 0 as uninitialized, use tokenId+1 to store
        _passBook[student] = tokenId + 1;

        emit PassClaimed(student, tokenId, block.timestamp);
        emit Locked(tokenId);
    }

    // ======================== PASS FUNCTIONS ========================

    function hasPass(address student) external view returns (bool) {
        return balanceOf(student) > 0;
    }

    function getPassTokenId(address student) public view returns (uint256) {
        uint256 stored = _passBook[student];
        if (stored == 0) revert NoPass();
        return stored - 1;
    }

    function burnPass() external {
        uint256 stored = _passBook[msg.sender];
        if (stored == 0 || ownerOf(stored - 1) != msg.sender) revert NotTokenOwner();
        _burn(stored - 1);
        delete _passBook[msg.sender];
        emit PassRevoked(msg.sender, stored - 1);
    }

    // ======================== ADMIN FUNCTIONS ========================

    function setBaseURI(string calldata newBaseURI) external onlyRole(ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function revokePass(uint256 tokenId) external onlyRole(ISSUER_ROLE) {
        address owner = ownerOf(tokenId);
        _burn(tokenId);
        delete _passBook[owner];
        emit PassRevoked(owner, tokenId);
    }

    function isWhitelisted(address student) external view returns (bool) {
        return _whitelist[student];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function totalPasses() external view returns (uint256) {
        return totalSupply();
    }
}