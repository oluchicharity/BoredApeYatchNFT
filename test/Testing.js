const { expect } = require('chai');
const { ethers } = require('hardhat');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

describe('MerkleAirdrop', function () {
    let airdrop, token, bayc, owner, user1, user2;
    let merkleTree, merkleRoot, leaves;

    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy ERC20 token
        const Token = await ethers.getContractFactory("ERC20Token");
        token = await Token.deploy("TestToken", "TT", 1000000);
        await token.deployed();

        // Deploy BAYC NFT
        const BAYC = await ethers.getContractFactory("ERC721Token");
        bayc = await BAYC.deploy("BAYC", "BAYC");
        await bayc.deployed();

        // Mint BAYC NFT to user1
        await bayc.mint(user1.address);

        // Generate Merkle tree
        const eligibleUsers = [
            { index: 0, address: user1.address, amount: 1000 },
            { index: 1, address: user2.address, amount: 1500 },
        ];

        leaves = eligibleUsers.map(user =>
            keccak256(ethers.utils.solidityPack(['uint256', 'address', 'uint256'], [user.index, user.address, user.amount]))
        );
        merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        merkleRoot = merkleTree.getHexRoot();

        // Deploy the Merkle Airdrop contract
        const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
        airdrop = await MerkleAirdrop.deploy(token.address, merkleRoot, bayc.address);
        await airdrop.deployed();

        // Transfer tokens to the airdrop contract
        await token.transfer(airdrop.address, 3000);
    });

    it('User1 can claim the airdrop if they have a BAYC NFT and a valid Merkle proof', async function () {
        const proof = merkleTree.getHexProof(leaves[0]);

        await expect(airdrop.connect(user1).claim(0, 1000, proof))
            .to.emit(airdrop, 'AirdropClaimed')
            .withArgs(user1.address, 1000);
    });

    it('User2 cannot claim the airdrop without BAYC NFT', async function () {
        const proof = merkleTree.getHexProof(leaves[1]);

        await expect(airdrop.connect(user2).claim(1, 1500, proof))
            .to.be.revertedWith('Must own a BAYC NFT to claim');
    });
});
