const { expect } = require("chai");
const { ethers } = require("hardhat");

const BAYC_ADDRESS = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"; 
const AIRDROP_TOKEN_ADDRESS = "0xYourERC20TokenAddress";
const MERKLE_ROOT = "0xYourMerkleRoot"; 

describe("Merkle Airdrop", function () {
    let airdrop, baycHolder, token, merkleTree;

    before(async function () {
        [deployer, baycHolder] = await ethers.getSigners();


        const BAYCHolderAddress = "0xSomeBAYCHolderAddress"; 
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [BAYCHolderAddress],
        });

        baycHolder = await ethers.getSigner(BAYCHolderAddress);


        const Airdrop = await ethers.getContractFactory("MerkleAirdrop");
        airdrop = await Airdrop.deploy(AIRDROP_TOKEN_ADDRESS, MERKLE_ROOT, BAYC_ADDRESS);
        await airdrop.deployed();

        token = await ethers.getContractAt("IERC20", AIRDROP_TOKEN_ADDRESS);
        await token.connect(deployer).transfer(airdrop.address, ethers.utils.parseUnits("1000", 18));
    });

    it("Should allow BAYC NFT holders to claim the airdrop", async function () {
        const index = 0; 
        const amount = ethers.utils.parseUnits("100", 18); 
        const account = baycHolder.address; 
        //// Generating the valid proof from Merkle tree
        const merkleProof = []; 

        // BAYC holder claims the airdrop
        await airdrop.connect(baycHolder).claim(index, account, amount, merkleProof);

        // Checking if tokens are transferred
        const balance = await token.balanceOf(account);
        expect(balance).to.equal(amount);
    });
});
