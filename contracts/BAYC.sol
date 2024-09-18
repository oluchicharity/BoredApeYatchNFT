// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {
    address public token;
    bytes32 public merkleRoot;
    IERC721 public BAYCNFT;

    mapping(address => bool) public claimed;

    event AirdropClaimed(address indexed claimant, uint256 amount);

    constructor(address _token, bytes32 _merkleRoot, address _baycAddress) {
        token = _token;
        merkleRoot = _merkleRoot;
        BAYCNFT = IERC721(_baycAddress);
    }

    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external {
        require(!claimed[account], "Airdrop already claimed.");
        require(BAYCNFT.balanceOf(account) > 0, "You must own a BAYC NFT to claim.");

        // Verify Merkle proof
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), "Invalid proof.");

        claimed[account] = true;
        require(IERC20(token).transfer(account, amount), "Token transfer failed.");

        emit AirdropClaimed(account, amount);
    }
}
