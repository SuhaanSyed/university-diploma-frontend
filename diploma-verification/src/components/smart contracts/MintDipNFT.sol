// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MintDip is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Struct to store all metadata attributes
    struct DiplomaMetadata {
        string studentName;
        string studentID;
        address studentAddress;
        string majorId;
        string diplomaUri;
        address collegeAddress;
        string collegeName;
        string message;
        bytes signature;
    }

    // Mapping from token ID to metadata attributes
    mapping(uint256 => DiplomaMetadata) private _tokenMetadata;

    constructor() ERC721("MintDip", "DiplomaNFT") {}

    function mintNFT(
        address recipient,
        string memory metadataURI,
        string memory studentID,
        string memory studentName,
        string memory majorId,
        address collegeAddress,
        string memory collegeName,
        string memory message,
        bytes memory signature
    ) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadataURI);

        // Store metadata attributes in the struct
        _tokenMetadata[newItemId] = DiplomaMetadata({
            studentName: studentName,
            studentID: studentID,
            studentAddress: recipient,
            majorId: majorId,
            diplomaUri: metadataURI,
            collegeAddress: collegeAddress,
            collegeName: collegeName,
            message: message,
            signature: signature
        });

        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function getTokenMetadata(
        uint256 tokenId
    ) public view returns (DiplomaMetadata memory) {
        address owner = ownerOf(tokenId);
        if (owner == address(0)) {
            revert("ERC721: Query for nonexistent token");
        }
        return _tokenMetadata[tokenId];
    }
    // perform elliptic hashing
    function verifyCollegeSignature(
        uint256 tokenId
    ) public view returns (bool) {
        address owner = ownerOf(tokenId);

        if (owner == address(0)) {
            revert("ERC721: Query for nonexistent token");
        }

        bytes32 messageHash = keccak256(
            abi.encodePacked(_tokenMetadata[tokenId].message)
        );
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return
            recoverSigner(
                ethSignedMessageHash,
                _tokenMetadata[tokenId].signature
            ) == _tokenMetadata[tokenId].collegeAddress;
    }

    function getEthSignedMessageHash(
        bytes32 messageHash
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    messageHash
                )
            );
    }

    function recoverSigner(
        bytes32 ethSignedMessageHash,
        bytes memory signature
    ) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return (r, s, v);
    }
}
