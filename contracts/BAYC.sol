// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MerkleAirdrop {
    address public token;
    bytes32 public merkleRoot;
    address public baycContract;
    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed user, uint256 amount);

    constructor(address _token, bytes32 _merkleRoot, address _baycContract) {
        token = _token;
        merkleRoot = _merkleRoot;
        baycContract = _baycContract;
    }

    /**
     * @notice Claim your airdrop if eligible and if you own a BAYC NFT
     * @param _index - The index of the user in the Merkle tree
     * @param _amount - The amount of tokens to claim
     * @param _proof - The Merkle proof for the user's eligibility
     */
    function claim(uint256 _index, uint256 _amount, bytes32[] calldata _proof) external {
        require(!hasClaimed[msg.sender], "Airdrop already claimed");
        require(IERC721(baycContract).balanceOf(msg.sender) > 0, "Must own a BAYC NFT to claim");

        // Verify the merkle proof
        bytes32 node = keccak256(abi.encodePacked(_index, msg.sender, _amount));
        require(MerkleProof.verify(_proof, merkleRoot, node), "Invalid Merkle proof");

        // Mark as claimed and transfer tokens
        hasClaimed[msg.sender] = true;
        require(IERC20(token).transfer(msg.sender, _amount), "Token transfer failed");

        emit AirdropClaimed(msg.sender, _amount);
    }
}
